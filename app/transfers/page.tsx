'use client'

import { useState, useMemo } from 'react'
import { Plus, X, AlertCircle, ArrowRight, Check, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transfers, inventoryItems, locations, categories } from '@/lib/mock-data'
import { calculateInventoryStatus } from '@/lib/inventory-utils'
import type { Transfer, TransferLineItem } from '@/lib/mock-data'

interface ApproverOption {
  id: string
  name: string
  role: string
}

const approverOptions: ApproverOption[] = [
  { id: '1', name: 'Manager A', role: 'Transfer Approver' },
  { id: '2', name: 'Manager B', role: 'Transfer Approver' },
  { id: '3', name: 'Supervisor', role: 'Transfer Approver' },
  { id: '4', name: 'Receiving Officer A', role: 'Receiver' },
  { id: '5', name: 'Receiving Officer B', role: 'Receiver' },
  { id: '6', name: 'Field Supervisor', role: 'Receiver' },
]

export default function TransfersPage() {
  const [transferList, setTransferList] = useState<Transfer[]>(transfers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    category: 'ppe' as const,
    approver1: '',
    approver1Name: '',
    approver2: '',
    approver2Name: '',
    notes: '',
  })

  const [lineItems, setLineItems] = useState<TransferLineItem[]>([])
  const [itemSearch, setItemSearch] = useState('')
  const [showApprover1Dropdown, setShowApprover1Dropdown] = useState(false)
  const [showApprover2Dropdown, setShowApprover2Dropdown] = useState(false)

  const searchResults = useMemo(() => {
    if (!itemSearch.trim()) return []
    return inventoryItems
      .filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(itemSearch.toLowerCase())
      )
      .slice(0, 8)
  }, [itemSearch])

  const addLineItem = (itemId: string) => {
    const item = inventoryItems.find((i) => i.id === itemId)
    if (!item) return

    const newLineItem: TransferLineItem = {
      id: `li-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: 1,
      unitType: 'pcs',
      fromLocation: locations[0]?.name || 'Warehouse',
      toLocation: locations[1]?.name || 'Main Plant',
      stockByLocation: {
        [item.location]: item.quantity,
        [locations[1]?.name || 'Main Plant']: 0,
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
    const errors: string[] = []

    if (!formData.approver1 || !formData.approver1Name) {
      errors.push('Please assign both approvers before submitting')
    }
    if (!formData.approver2 || !formData.approver2Name) {
      errors.push('Please assign both approvers before submitting')
    }
    if (lineItems.length === 0) {
      errors.push('Please add at least one item to transfer')
    }

    // Check stock availability
    lineItems.forEach((item, idx) => {
      const stock = item.stockByLocation[item.fromLocation] || 0
      if (stock === 0) {
        errors.push(`Line ${idx + 1}: No stock available at "${item.fromLocation}"`)
      }
      if (item.quantity > stock) {
        errors.push(`Line ${idx + 1}: Only ${stock} units available, but ${item.quantity} requested`)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    const newTransfer: Transfer = {
      id: `t-${Date.now()}`,
      status: 'pending-approval1',
      lineItems,
      category: formData.category,
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      approver1: formData.approver1Name,
      approver1Status: 'pending',
      approver2: formData.approver2Name,
      approver2Status: 'pending',
      notes: formData.notes,
    }

    setTransferList([newTransfer, ...transferList])
    resetForm()
    setShowCreateModal(false)
  }

  const resetForm = () => {
    setFormData({ category: 'ppe', approver1: '', approver1Name: '', approver2: '', approver2Name: '', notes: '' })
    setLineItems([])
    setItemSearch('')
  }

  const handleApprover1Select = (approver: ApproverOption) => {
    setFormData({
      ...formData,
      approver1: approver.id,
      approver1Name: approver.name,
    })
    setShowApprover1Dropdown(false)
  }

  const handleApprover2Select = (approver: ApproverOption) => {
    setFormData({
      ...formData,
      approver2: approver.id,
      approver2Name: approver.name,
    })
    setShowApprover2Dropdown(false)
  }

  const filteredTransfers = useMemo(() => {
    return transferList.filter(
      (t) =>
        t.lineItems.some((li) =>
          li.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          li.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          li.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        t.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, transferList])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending-approval1': 'bg-blue-50 border-blue-200',
      'pending-approval2': 'bg-yellow-50 border-yellow-200',
      'completed': 'bg-green-50 border-green-200',
      'rejected': 'bg-red-50 border-red-200',
    }
    return colors[status] || 'bg-gray-50 border-gray-200'
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending-approval1': 'bg-blue-100 text-blue-800',
      'pending-approval2': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transfer Requests</h1>
          <p className="text-slate-600">Track item movements with full chain of custody</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Create Transfer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search by item, location, or requester..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transfer List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="p-8 text-center text-slate-600">No transfers found</Card>
        ) : (
          filteredTransfers.map((transfer) => (
            <Card
              key={transfer.id}
              className={`p-4 border-2 cursor-pointer transition ${getStatusColor(transfer.status)}`}
              onClick={() => setSelectedTransfer(transfer)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Transfer {transfer.id}</h3>
                  <p className="text-sm text-slate-600">Created by {transfer.createdBy} on {transfer.createdDate}</p>
                </div>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transfer.status)}`}>
                  {transfer.status === 'pending-approval1' && 'Awaiting Approver 1'}
                  {transfer.status === 'pending-approval2' && 'Awaiting Approver 2'}
                  {transfer.status === 'completed' && 'Completed'}
                  {transfer.status === 'rejected' && 'Rejected'}
                </span>
              </div>

              {/* Shipment Tracker */}
              <div className="bg-white/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {transfer.lineItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="text-xs font-semibold text-slate-700">{item.fromLocation}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.quantity} {item.unitType}</div>
                      </div>
                      {idx < transfer.lineItems.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      {idx === transfer.lineItems.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-700">{transfer.lineItems[0]?.toLocation}</div>
                    <div className="text-xs text-slate-500 mt-1">Destination</div>
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/50 rounded p-2">
                  <div className="text-xs font-semibold text-slate-700">Approver 1</div>
                  <div className="text-xs text-slate-600 mt-1">{transfer.approver1}</div>
                  <div className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                    transfer.approver1Status === 'approved' ? 'bg-green-100 text-green-700' :
                    transfer.approver1Status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {transfer.approver1Status === 'approved' && '✓ Approved'}
                    {transfer.approver1Status === 'rejected' && '✗ Rejected'}
                    {transfer.approver1Status === 'pending' && '⏳ Pending'}
                  </div>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <div className="text-xs font-semibold text-slate-700">Approver 2</div>
                  <div className="text-xs text-slate-600 mt-1">{transfer.approver2}</div>
                  <div className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                    transfer.approver2Status === 'approved' ? 'bg-green-100 text-green-700' :
                    transfer.approver2Status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {transfer.approver2Status === 'approved' && '✓ Approved'}
                    {transfer.approver2Status === 'rejected' && '✗ Rejected'}
                    {transfer.approver2Status === 'pending' && '⏳ Pending'}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Transfer Request</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ppe', 'tools', 'consumable', 'other'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition ${
                        formData.category === cat
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white border-border text-slate-600'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Approver Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Approver 1 (Request Approver) *
                  </label>
                  <button
                    onClick={() => setShowApprover1Dropdown(!showApprover1Dropdown)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-left text-sm bg-white hover:bg-slate-50"
                  >
                    {formData.approver1Name || 'Select approver...'}
                  </button>
                  {showApprover1Dropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-40">
                      {approverOptions.map((approver) => (
                        <button
                          key={approver.id}
                          onClick={() => handleApprover1Select(approver)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-slate-900">{approver.name}</div>
                          <div className="text-xs text-slate-600">{approver.role}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Approver 2 (Receiver) *
                  </label>
                  <button
                    onClick={() => setShowApprover2Dropdown(!showApprover2Dropdown)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-left text-sm bg-white hover:bg-slate-50"
                  >
                    {formData.approver2Name || 'Select receiver...'}
                  </button>
                  {showApprover2Dropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-40">
                      {approverOptions.map((approver) => (
                        <button
                          key={approver.id}
                          onClick={() => handleApprover2Select(approver)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-slate-900">{approver.name}</div>
                          <div className="text-xs text-slate-600">{approver.role}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Items Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Add Items *</label>
                <div className="relative mb-4">
                  <Input
                    placeholder="Search items by name or SKU..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="mb-2"
                  />
                  {itemSearch && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-lg shadow-lg z-40">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addLineItem(item.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 border-b border-border last:border-b-0"
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-600">SKU: {item.sku} | Stock: {item.quantity}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Line Items */}
                {lineItems.length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-sm bg-slate-50 rounded-lg">
                    No items added yet. Search and add items above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lineItems.map((item, idx) => (
                      <div key={item.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-slate-900">{item.itemName}</h4>
                            <p className="text-xs text-slate-600">Stock: {item.stockByLocation[item.fromLocation] || 0} available</p>
                          </div>
                          <button onClick={() => removeLineItem(idx)} className="text-red-600 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <label className="block text-xs font-medium mb-1">Qty</label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Unit</label>
                            <select
                              value={item.unitType}
                              onChange={(e) => updateLineItem(idx, { unitType: e.target.value as any })}
                              className="h-8 w-full px-2 border border-border rounded"
                            >
                              <option>pcs</option>
                              <option>sets</option>
                              <option>boxes</option>
                              <option>kg</option>
                              <option>liters</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">From</label>
                            <select
                              value={item.fromLocation}
                              onChange={(e) => updateLineItem(idx, { fromLocation: e.target.value })}
                              className="h-8 w-full px-2 border border-border rounded text-xs"
                            >
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.name}>
                                  {loc.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">To</label>
                            <select
                              value={item.toLocation}
                              onChange={(e) => updateLineItem(idx, { toLocation: e.target.value })}
                              className="h-8 w-full px-2 border border-border rounded text-xs"
                            >
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.name}>
                                  {loc.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional information..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm min-h-20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={handleCreateTransfer}
                  className="flex-1"
                >
                  Create Transfer
                </Button>
                <Button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
