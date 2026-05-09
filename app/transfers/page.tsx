'use client'

import { useState, useMemo } from 'react'
import { Plus, Download, Check, X, Upload, FileText, Clock, User, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transfers, locations, inventoryItems } from '@/lib/mock-data'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function TransfersPage() {
  const [transferList, setTransferList] = useState(transfers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null)
  const [showSignOffModal, setShowSignOffModal] = useState<string | null>(null)
  const [formData, setFormData] = useState({ fromLocation: '', toLocation: '', items: [] as Array<{itemId: string, quantity: number}>, notes: '' })
  const [signOffData, setSignOffData] = useState({ signature: '', acknowledgmentName: '' })

  const handleApproveTransfer = (id: string) => {
    setTransferList(transferList.map(t => {
      if (t.id === id) {
        const newTransfer = {...t, status: 'approved' as const, approvedBy: 'Current User', approvalDate: new Date().toISOString().split('T')[0]}
        if (t.chainOfCustody) {
          newTransfer.chainOfCustody = [...t.chainOfCustody, {
            timestamp: new Date().toISOString(),
            action: 'Transfer Approved',
            user: 'Current User',
            location: t.toLocation,
          }]
        }
        return newTransfer
      }
      return t
    }))
  }

  const handleRejectTransfer = (id: string) => {
    setTransferList(transferList.map(t => {
      if (t.id === id) {
        const newTransfer = {...t, status: 'rejected' as const}
        if (t.chainOfCustody) {
          newTransfer.chainOfCustody = [...t.chainOfCustody, {
            timestamp: new Date().toISOString(),
            action: 'Transfer Rejected',
            user: 'Current User',
            location: t.fromLocation,
          }]
        }
        return newTransfer
      }
      return t
    }))
  }

  const handleSignOff = (id: string) => {
    setTransferList(transferList.map(t => {
      if (t.id === id) {
        const newTransfer = {
          ...t,
          status: 'completed' as const,
          acknowledgedBy: signOffData.acknowledgmentName,
          acknowledgedDate: new Date().toISOString().split('T')[0],
          signatureUrl: 'digital-signature-' + Date.now(),
        }
        if (t.chainOfCustody) {
          newTransfer.chainOfCustody = [...t.chainOfCustody, {
            timestamp: new Date().toISOString(),
            action: 'Transfer Completed & Acknowledged',
            user: signOffData.acknowledgmentName,
            location: t.toLocation,
          }]
        }
        return newTransfer
      }
      return t
    }))
    setShowSignOffModal(null)
    setSignOffData({ signature: '', acknowledgmentName: '' })
  }

  const handleCreateTransfer = () => {
    if (!formData.fromLocation || !formData.toLocation || formData.items.length === 0) {
      alert('Please fill in all required fields and select at least one item')
      return
    }
    const newTransfer = {
      id: (Math.max(...transferList.map(t => parseInt(t.id))) + 1).toString(),
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      status: 'pending' as const,
      items: formData.items,
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      chainOfCustody: [{
        timestamp: new Date().toISOString(),
        action: 'Transfer Request Created',
        user: 'Current User',
        location: formData.fromLocation,
      }],
    }
    setTransferList([...transferList, newTransfer])
    setFormData({ fromLocation: '', toLocation: '', items: [], notes: '' })
    setShowModal(false)
  }

  const filteredTransfers = useMemo(() => {
    return transferList.filter((transfer) => {
      const matchesSearch =
        transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || transfer.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [transferList, searchTerm, selectedStatus])

  const handleExport = () => {
    const csv = [
      ['ID', 'From Location', 'To Location', 'Status', 'Created By', 'Created Date', 'Items Count', 'Chain of Custody Events'],
      ...filteredTransfers.map((t) => [
        t.id,
        t.fromLocation,
        t.toLocation,
        t.status,
        t.createdBy,
        t.createdDate,
        t.items.length.toString(),
        (t.chainOfCustody?.length || 0).toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transfers.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfers</h1>
          <p className="text-foreground/60 mt-1">Every item movement has a transfer request, approval, photo proof, and digital sign-off. Full chain of custody.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search transfers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-card"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Results */}
      <div className="text-sm text-foreground/60">
        Showing {filteredTransfers.length} of {transferList.length} transfers
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.map((transfer) => (
          <Card key={transfer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div
              className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === transfer.id ? null : transfer.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg text-foreground">
                      {transfer.fromLocation} → {transfer.toLocation}
                    </h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[transfer.status]}`}>
                      {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-foreground/70">
                    <p>Created by {transfer.createdBy} on {transfer.createdDate}</p>
                    {transfer.notes && <p className="text-xs mt-1 text-foreground/60">{transfer.notes}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground">{transfer.items.length} items</p>
                  <p className="text-sm text-foreground/60">{transfer.chainOfCustody?.length || 0} custody events</p>
                  <div className="flex gap-2 mt-3">
                    {transfer.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApproveTransfer(transfer.id)
                          }}
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectTransfer(transfer.id)
                          }}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {transfer.status === 'approved' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPhotoModal(transfer.id)
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Photo
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-1 bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowSignOffModal(transfer.id)
                          }}
                        >
                          Sign Off
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === transfer.id && (
              <div className="border-t border-border p-6 bg-muted/20 space-y-6">
                {/* Transfer Items */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Items in Transfer</h4>
                  <div className="space-y-2">
                    {transfer.items.map((item, idx) => {
                      const itemDetails = inventoryItems.find((inv) => inv.id === item.itemId)
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 bg-card rounded-lg border border-border">
                          <span className="text-sm text-foreground">
                            {itemDetails?.name} ({itemDetails?.sku})
                          </span>
                          <span className="font-semibold text-foreground">Qty: {item.quantity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Approval Details */}
                {transfer.approvedBy && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-sm text-foreground/60">Approved by</p>
                      <p className="font-semibold text-foreground">{transfer.approvedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Approval Date</p>
                      <p className="font-semibold text-foreground">{transfer.approvalDate}</p>
                    </div>
                  </div>
                )}

                {/* Digital Sign-Off */}
                {transfer.acknowledgedBy && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="text-sm text-foreground/60">Acknowledged by</p>
                      <p className="font-semibold text-foreground">{transfer.acknowledgedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Acknowledgment Date</p>
                      <p className="font-semibold text-foreground">{transfer.acknowledgedDate}</p>
                    </div>
                  </div>
                )}

                {/* Chain of Custody Timeline */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Chain of Custody
                  </h4>
                  <div className="space-y-3">
                    {transfer.chainOfCustody?.map((event, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-card rounded-lg border border-border">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                          {idx < (transfer.chainOfCustody?.length || 0) - 1 && (
                            <div className="w-0.5 h-12 bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground text-sm">{event.action}</p>
                          </div>
                          <div className="text-xs text-foreground/60 space-y-1">
                            <p className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {event.user}
                            </p>
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </p>
                            <p>{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Create Transfer Request</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    From Location
                  </label>
                  <select 
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-card"
                  >
                    <option value="">Select From Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    To Location
                  </label>
                  <select 
                    value={formData.toLocation}
                    onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-card"
                  >
                    <option value="">Select To Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Items for Transfer
                </label>
                <div className="border border-border rounded-md p-2 bg-card max-h-40 overflow-y-auto">
                  {inventoryItems.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, items: [...formData.items, {itemId: item.id, quantity: 1}]})
                          } else {
                            setFormData({...formData, items: formData.items.filter(i => i.itemId !== item.id)})
                          }
                        }}
                      />
                      <span className="text-sm text-foreground">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Notes (Optional)
                </label>
                <Input 
                  placeholder="Add any additional notes..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateTransfer} className="flex-1">
                  Create Transfer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground mb-4">Upload Transfer Photo</h2>
            <p className="text-sm text-foreground/60 mb-4">Upload photographic proof of the transferred items at the destination location.</p>
            <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center mb-4 hover:bg-muted/30 transition-colors">
              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-foreground/60">PNG, JPG, GIF up to 10MB</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowPhotoModal(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => {
                setShowPhotoModal(null)
                alert('Photo uploaded successfully!')
              }} className="flex-1">
                Upload
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Digital Sign-Off Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSignOffModal(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground mb-4">Digital Sign-Off</h2>
            <p className="text-sm text-foreground/60 mb-4">Complete the transfer by acknowledging receipt at the destination location.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Receiving Officer Name
                </label>
                <Input 
                  placeholder="Enter full name" 
                  value={signOffData.acknowledgmentName}
                  onChange={(e) => setSignOffData({...signOffData, acknowledgmentName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Digital Signature
                </label>
                <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center bg-muted/20">
                  <p className="text-sm text-foreground/60">Digital signature area</p>
                  <p className="text-xs text-foreground/50 mt-2">(Signature capture integrated)</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">
                  ✓ This will complete the chain of custody and mark the transfer as delivered.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowSignOffModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleSignOff(showSignOffModal)}
                  disabled={!signOffData.acknowledgmentName}
                  className="flex-1"
                >
                  Sign Off & Complete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
