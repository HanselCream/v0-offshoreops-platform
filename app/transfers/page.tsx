'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, X, AlertCircle, Check, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transfers, inventoryItems, locations } from '@/lib/mock-data'
import type { Transfer, TransferLineItem } from '@/lib/mock-data'

export default function TransfersPage() {
  const [transferList, setTransferList] = useState<Transfer[]>(transfers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  
  // Form data for creating new transfer
  const [formData, setFormData] = useState({
    category: 'ppe' as const,
    approver1: '',
    approver2: '',
    notes: '',
  })
  
  // Line items being added
  const [lineItems, setLineItems] = useState<TransferLineItem[]>([])
  const [itemSearch, setItemSearch] = useState('')
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

  const searchResults = useMemo(() => {
    if (!itemSearch.trim()) return []
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearch.toLowerCase())
    ).slice(0, 8)
  }, [itemSearch])

  const addLineItem = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId)
    if (!item) return

    const newLineItem: TransferLineItem = {
      id: `li-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: 1,
      unitType: 'pcs',
      fromLocation: 'Warehouse',
      toLocation: 'Main Plant',
      stockByLocation: {
        'Warehouse': item.quantity,
        'Main Plant': 100,
        'Offshore Rig A': 50,
        'Port Facility': 30,
      },
      status: 'pending',
      approvalStatus: 'pending',
    }
    
    setLineItems([...lineItems, newLineItem])
    setItemSearch('')
  }

  const updateLineItem = (index: number, updates: Partial<TransferLineItem>) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], ...updates }
    setLineItems(updated)
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleCreateTransfer = () => {
    if (!formData.approver1 || !formData.approver2 || lineItems.length === 0) {
      alert('Please fill in all required fields and add at least one item')
      return
    }

    const newTransfer: Transfer = {
      id: `TR-${Date.now()}`,
      status: 'pending-approval1',
      lineItems: lineItems.map(item => ({ ...item, status: 'pending', approvalStatus: 'pending' })),
      category: formData.category,
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      approver1: formData.approver1,
      approver1Status: 'pending',
      approver2: formData.approver2,
      approver2Status: 'pending',
      notes: formData.notes,
    }

    setTransferList([newTransfer, ...transferList])
    setLineItems([])
    setFormData({ category: 'ppe', approver1: '', approver2: '', notes: '' })
    setShowCreateModal(false)
  }

  const handleApproveLineItem = (transferId: string, lineItemId: string, approverLevel: number) => {
    setTransferList(transferList.map(t => {
      if (t.id !== transferId) return t
      const updated = { ...t }
      updated.lineItems = updated.lineItems.map(li => {
        if (li.id !== lineItemId) return li
        if (approverLevel === 1) {
          return { ...li, approvalStatus: 'approved' }
        } else {
          return { ...li, status: 'approved', approvalStatus: 'approved' }
        }
      })
      
      // Update transfer status
      const allApproved = updated.lineItems.every(li => li.approvalStatus === 'approved')
      if (approverLevel === 1 && allApproved) {
        updated.approver1Status = 'approved'
        updated.status = 'pending-approval2'
      } else if (approverLevel === 2 && allApproved) {
        updated.approver2Status = 'approved'
        updated.status = 'completed'
      }
      
      return updated
    }))
  }

  const handleRejectLineItem = (transferId: string, lineItemId: string, reason: string) => {
    setTransferList(transferList.map(t => {
      if (t.id !== transferId) return t
      const updated = { ...t }
      updated.lineItems = updated.lineItems.map(li => {
        if (li.id !== lineItemId) return li
        return { ...li, approvalStatus: 'rejected', rejectionReason: reason }
      })
      updated.status = 'rejected'
      return updated
    }))
  }

  const filteredTransfers = useMemo(() => {
    return transferList.filter(t => {
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.approver1?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [transferList, searchTerm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Item Transfers</h1>
          <p className="text-slate-600">Full chain of custody: transfer request → approval → photo proof → digital sign-off</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Create Transfer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by transfer ID, requester, or approver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No transfers found</p>
          </Card>
        ) : (
          filteredTransfers.map(transfer => {
            const approvedCount = transfer.lineItems.filter(li => li.approvalStatus === 'approved').length
            const rejectedCount = transfer.lineItems.filter(li => li.approvalStatus === 'rejected').length
            const statusColor = transfer.status === 'completed' ? 'bg-green-50 border-green-200' :
              transfer.status === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            const statusLabel = transfer.status === 'pending-approval1' ? 'Awaiting Approver 1' :
              transfer.status === 'pending-approval2' ? 'Awaiting Approver 2' :
              transfer.status === 'completed' ? 'Completed' : 'Rejected'

            return (
              <Card key={transfer.id} className={`border-l-4 ${statusColor} overflow-hidden`}>
                {/* Transfer Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{transfer.id}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                          {transfer.category.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-200 text-green-700' :
                          transfer.status === 'rejected' ? 'bg-red-200 text-red-700' :
                          'bg-blue-200 text-blue-700'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Created by {transfer.createdBy} on {transfer.createdDate}
                      </p>
                      {approvedCount > 0 || rejectedCount > 0 ? (
                        <p className="text-sm font-medium mt-1">
                          {approvedCount} Approved / {rejectedCount} Rejected
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransfer(selectedTransfer?.id === transfer.id ? null : transfer)}
                    >
                      {selectedTransfer?.id === transfer.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </div>

                {/* Line Items */}
                {selectedTransfer?.id === transfer.id && (
                  <div className="divide-y divide-border">
                    {transfer.lineItems.map((lineItem, idx) => {
                      const fromStock = lineItem.stockByLocation[lineItem.fromLocation] || 0
                      const insufficientStock = fromStock === 0

                      return (
                        <div key={lineItem.id} className="p-4">
                          <div className="grid grid-cols-12 gap-3 items-start">
                            {/* Item Info */}
                            <div className="col-span-3">
                              <p className="font-semibold text-slate-900">{lineItem.itemName}</p>
                              <p className="text-sm text-slate-600">{lineItem.category}</p>
                            </div>

                            {/* Stock Info */}
                            <div className="col-span-2 text-sm">
                              <p className="text-slate-600">Stock:</p>
                              {Object.entries(lineItem.stockByLocation).map(([loc, qty]) => (
                                <p key={loc} className="text-slate-700">
                                  {loc}: <span className="font-medium">{qty}</span>
                                </p>
                              ))}
                            </div>

                            {/* Quantity & Unit */}
                            <div className="col-span-2">
                              <p className="font-semibold text-slate-900">{lineItem.quantity}</p>
                              <p className="text-sm text-slate-600">{lineItem.unitType}</p>
                            </div>

                            {/* From → To Locations */}
                            <div className="col-span-2">
                              <p className="font-semibold text-slate-900">{lineItem.fromLocation}</p>
                              <div className="flex items-center gap-2 my-1 text-sm text-slate-600">
                                <TrendingUp className="w-3 h-3" />
                              </div>
                              <p className="font-semibold text-slate-900">{lineItem.toLocation}</p>
                            </div>

                            {/* Approval Status */}
                            <div className="col-span-3">
                              {insufficientStock ? (
                                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                  <AlertCircle className="w-4 h-4" />
                                  Insufficient stock
                                </div>
                              ) : lineItem.approvalStatus === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-1"
                                    onClick={() => handleApproveLineItem(transfer.id, lineItem.id, 1)}
                                  >
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-red-600 gap-1"
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason:')
                                      if (reason) handleRejectLineItem(transfer.id, lineItem.id, reason)
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                    Reject
                                  </Button>
                                </div>
                              ) : lineItem.approvalStatus === 'approved' ? (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                                  <Check className="w-4 h-4" />
                                  Approved
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                  <X className="w-4 h-4" />
                                  Rejected
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Received Quantity and Discrepancies (for Approver 2) */}
                          {lineItem.quantityReceived !== undefined && (
                            <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                              <p className="text-slate-700">
                                Received: <span className="font-semibold">{lineItem.quantityReceived}</span> / {lineItem.quantity}
                              </p>
                              {lineItem.discrepancy && (
                                <p className="text-slate-700 mt-1">
                                  Note: {lineItem.discrepancy}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {lineItem.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 rounded text-sm text-red-700">
                              Rejection Reason: {lineItem.rejectionReason}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Transfer Summary */}
                {selectedTransfer?.id === transfer.id && (
                  <div className="p-4 bg-slate-50 border-t border-border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Approver 1</p>
                        <p className="font-semibold text-slate-900">{transfer.approver1}</p>
                        <p className={`text-xs mt-1 ${transfer.approver1Status === 'approved' ? 'text-green-700' : transfer.approver1Status === 'rejected' ? 'text-red-700' : 'text-slate-600'}`}>
                          {transfer.approver1Status === 'approved' ? '✓ Approved' : transfer.approver1Status === 'pending' ? 'Pending' : 'Rejected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Approver 2</p>
                        <p className="font-semibold text-slate-900">{transfer.approver2}</p>
                        <p className={`text-xs mt-1 ${transfer.approver2Status === 'approved' ? 'text-green-700' : transfer.approver2Status === 'rejected' ? 'text-red-700' : 'text-slate-600'}`}>
                          {transfer.approver2Status === 'approved' ? '✓ Approved' : transfer.approver2Status === 'pending' ? 'Pending' : 'Rejected'}
                        </p>
                      </div>
                      {transfer.notes && (
                        <div>
                          <p className="text-slate-600">Notes</p>
                          <p className="font-semibold text-slate-900">{transfer.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Create Transfer Request</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Transfer Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Transfer Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="ppe">PPE</option>
                  <option value="tools">Tools</option>
                  <option value="it-equipment">IT Equipment</option>
                  <option value="consumable">Consumable</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Approvers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Approver 1 (Request Approver)
                  </label>
                  <Input
                    placeholder="Manager name"
                    value={formData.approver1}
                    onChange={(e) => setFormData({ ...formData, approver1: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Approver 2 (Receiver)
                  </label>
                  <Input
                    placeholder="Receiving officer"
                    value={formData.approver2}
                    onChange={(e) => setFormData({ ...formData, approver2: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Transfer Notes
                </label>
                <textarea
                  placeholder="Add any notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              {/* Item Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Add Items to Transfer
                </label>
                <div className="relative">
                  <Input
                    placeholder="Search items by name or SKU..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full"
                  />
                  {itemSearch && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-md bg-white shadow-lg z-10">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addLineItem(item.id)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
                        >
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-slate-600">{item.sku} • {item.category} • Stock: {item.quantity}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Added Line Items */}
              {lineItems.length > 0 && (
                <div className="space-y-3 mt-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-slate-900">Items to Transfer ({lineItems.length})</h3>
                  {lineItems.map((item, idx) => (
                    <Card key={item.id} className="p-3 bg-slate-50">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-3">
                          <p className="font-semibold text-slate-900 text-sm">{item.itemName}</p>
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs text-slate-600">Qty</label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                            className="text-sm h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs text-slate-600">Unit</label>
                          <select
                            value={item.unitType}
                            onChange={(e) => updateLineItem(idx, { unitType: e.target.value as any })}
                            className="w-full px-2 py-1 border border-border rounded text-xs h-8"
                          >
                            <option value="pcs">pcs</option>
                            <option value="sets">sets</option>
                            <option value="boxes">boxes</option>
                            <option value="kg">kg</option>
                            <option value="liters">liters</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-slate-600">From</label>
                          <select
                            value={item.fromLocation}
                            onChange={(e) => updateLineItem(idx, { fromLocation: e.target.value })}
                            className="w-full px-2 py-1 border border-border rounded text-xs h-8"
                          >
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.name}>{loc.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-slate-600">To</label>
                          <select
                            value={item.toLocation}
                            onChange={(e) => updateLineItem(idx, { toLocation: e.target.value })}
                            className="w-full px-2 py-1 border border-border rounded text-xs h-8"
                          >
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.name}>{loc.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeLineItem(idx)}
                            className="w-full text-red-600 h-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1">
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
