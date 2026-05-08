'use client'

import { useState, useMemo } from 'react'
import { Plus, Download, Check, X } from 'lucide-react'
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
  const [formData, setFormData] = useState({ fromLocation: '', toLocation: '', items: [] as Array<{itemId: string, quantity: number}> })

  const handleApproveTransfer = (id: string) => {
    setTransferList(transferList.map(t => 
      t.id === id ? {...t, status: 'approved' as const, approvedBy: 'Current User', approvalDate: new Date().toISOString().split('T')[0]} : t
    ))
  }

  const handleRejectTransfer = (id: string) => {
    setTransferList(transferList.map(t => 
      t.id === id ? {...t, status: 'rejected' as const} : t
    ))
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
    }
    setTransferList([...transferList, newTransfer])
    setFormData({ fromLocation: '', toLocation: '', items: [] })
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
  }, [searchTerm, selectedStatus])

  const handleExport = () => {
    const csv = [
      ['ID', 'From Location', 'To Location', 'Status', 'Created By', 'Created Date', 'Items Count'],
      ...filteredTransfers.map((t) => [
        t.id,
        t.fromLocation,
        t.toLocation,
        t.status,
        t.createdBy,
        t.createdDate,
        t.items.length.toString(),
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
          <h1 className="text-3xl font-bold text-slate-900">Transfers</h1>
          <p className="text-slate-600 mt-1">Track item transfers between locations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Transfer</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Location
            </label>
            <Input
              placeholder="From or to location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="text-sm text-slate-600">
        Showing {filteredTransfers.length} of {transferList.length} transfers
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.map((transfer) => (
          <Card key={transfer.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === transfer.id ? null : transfer.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {transfer.fromLocation} → {transfer.toLocation}
                    </h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[transfer.status]}`}>
                      {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>Created by {transfer.createdBy} on {transfer.createdDate}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">{transfer.items.length} items</p>
                  {transfer.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1"
                        onClick={() => handleApproveTransfer(transfer.id)}
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1 text-red-600"
                        onClick={() => handleRejectTransfer(transfer.id)}
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === transfer.id && (
              <div className="border-t border-border p-4 bg-slate-50">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Transfer Items</h4>
                    <div className="space-y-2">
                      {transfer.items.map((item, idx) => {
                        const itemDetails = inventoryItems.find((inv) => inv.id === item.itemId)
                        return (
                          <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-border">
                            <span className="text-sm text-slate-900">
                              {itemDetails?.name} ({itemDetails?.sku})
                            </span>
                            <span className="font-semibold text-slate-900">Qty: {item.quantity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Created by</p>
                      <p className="font-semibold text-slate-900">{transfer.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Created Date</p>
                      <p className="font-semibold text-slate-900">{transfer.createdDate}</p>
                    </div>
                    {transfer.approvedBy && (
                      <>
                        <div>
                          <p className="text-slate-600">Approved by</p>
                          <p className="font-semibold text-slate-900">{transfer.approvedBy}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Approval Date</p>
                          <p className="font-semibold text-slate-900">{transfer.approvalDate}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Transfer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  From Location
                </label>
                <select 
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To Location
                </label>
                <select 
                  value={formData.toLocation}
                  onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select To Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Items
                </label>
                <div className="border border-border rounded-md p-2 bg-white max-h-40 overflow-y-auto">
                  {inventoryItems.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-slate-50">
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
                      <span className="text-sm">{item.name}</span>
                    </label>
                  ))}
                </div>
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
    </div>
  )
}
