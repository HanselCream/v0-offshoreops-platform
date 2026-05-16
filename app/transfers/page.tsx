'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, MapPin, Truck, CheckCircle2, XCircle, Clock, AlertCircle, Loader } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  fetchTransfers, 
  fetchInventoryItems, 
  fetchLocations, 
  fetchUserRoles,
  createTransfer, 
  updateTransferStatus,
  type Transfer, 
  type InventoryItem,
} from '@/lib/supabase'

const statusConfig = {
  'pending': { color: 'bg-blue-100 text-blue-700', label: 'Pending' },
  'pending-approval1': { color: 'bg-amber-100 text-amber-700', label: 'Awaiting Approver 1' },
  'pending-approval2': { color: 'bg-amber-100 text-amber-700', label: 'Awaiting Approver 2' },
  'completed': { color: 'bg-green-100 text-green-700', label: 'Completed' },
  'rejected': { color: 'bg-red-100 text-red-700', label: 'Rejected' },
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [approvers, setApprovers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    category: '',
    approver1: '',
    approver2: '',
    notes: '',
    items: [{ itemId: '', fromLocation: '', toLocation: '', quantity: '', unitType: 'pcs' as const }],
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
const [transfersData, itemsData, locationsData, rolesData] = await Promise.all([
  fetchTransfers(),
  fetchInventoryItems(),
  fetchLocations(),
  fetchUserRoles().catch(() => []),  // ← don't let this kill the page
])
        setTransfers(transfersData)
        setInventoryItems(itemsData)
        setLocations(locationsData)
        setApprovers(rolesData.filter(r => r.role.includes('approver')))
      } catch (err) {
        console.error('Error loading transfers data:', err)
        setError('Failed to load transfers data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', fromLocation: '', toLocation: '', quantity: '', unitType: 'pcs' }],
    })
  }

  const handleRemoveLineItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleCreateTransfer = async () => {
    if (!formData.category || !formData.approver1 || !formData.approver2) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.items.some(item => !item.itemId || !item.fromLocation || !item.toLocation || !item.quantity)) {
      alert('Please complete all line item details')
      return
    }

    try {
      setSubmitting(true)
      const newTransfer: Omit<Transfer, 'id'> = {
        status: 'pending-approval1',
        category: formData.category as any,
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
        approver1: formData.approver1,
        approver1Status: 'pending',
        approver2: formData.approver2,
        approver2Status: 'pending',
        notes: formData.notes,
      }

      const items = formData.items.map(item => ({
        item_id: item.itemId,
        itemName: inventoryItems.find(i => i.id === item.itemId)?.name || '',
        category: inventoryItems.find(i => i.id === item.itemId)?.category || '',
        quantity: parseInt(item.quantity) || 0,
        unitType: item.unitType,
        fromLocation: item.fromLocation,
        toLocation: item.toLocation,
        status: 'pending' as const,
      }))

      await createTransfer(newTransfer, items)
      
      // Reload transfers
      const updatedTransfers = await fetchTransfers()
      setTransfers(updatedTransfers)
      
      setFormData({
        category: '',
        approver1: '',
        approver2: '',
        notes: '',
        items: [{ itemId: '', fromLocation: '', toLocation: '', quantity: '', unitType: 'pcs' }],
      })
      setShowModal(false)
    } catch (err) {
      console.error('Error creating transfer:', err)
      alert('Failed to create transfer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = transfer.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || transfer.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [transfers, searchTerm, selectedStatus])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600">Loading transfers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transfer Management</h1>
          <p className="text-slate-600 mt-1">Track item movements between locations with full chain of custody</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Transfer
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <Input
              placeholder="Search by category or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="pending-approval1">Awaiting Approver 1</option>
              <option value="pending-approval2">Awaiting Approver 2</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-slate-600">
              Total: <span className="font-bold">{filteredTransfers.length}</span> transfers
            </div>
          </div>
        </div>
      </Card>

      {/* Create Transfer Modal */}
      {showModal && (
        <Card className="p-6 bg-white border-2 border-primary/30">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Transfer</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="ppe">PPE</option>
                  <option value="tools">Tools</option>
                  <option value="it-equipment">IT Equipment</option>
                  <option value="consumable">Consumable</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <Input
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Approver 1 (Request) *</label>
                <select
                  value={formData.approver1}
                  onChange={(e) => setFormData({ ...formData, approver1: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select Approver 1</option>
                  {approvers.filter(a => a.role === 'approver_level_1').map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Approver 2 (Receiver) *</label>
                <select
                  value={formData.approver2}
                  onChange={(e) => setFormData({ ...formData, approver2: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select Approver 2</option>
                  {approvers.filter(a => a.role === 'approver_level_2').map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900">Transfer Items</h3>
                <Button onClick={handleAddLineItem} size="sm" variant="outline">
                  Add Another Item
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 p-3 border border-slate-200 rounded">
                    <select
                      value={item.itemId}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].itemId = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="col-span-2 px-2 py-1 border border-border rounded text-sm bg-white"
                    >
                      <option value="">Select Item</option>
                      {inventoryItems.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.name}</option>
                      ))}
                    </select>
                    <select
                      value={item.fromLocation}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].fromLocation = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="px-2 py-1 border border-border rounded text-sm bg-white"
                    >
                      <option value="">From</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                    <select
                      value={item.toLocation}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].toLocation = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="px-2 py-1 border border-border rounded text-sm bg-white"
                    >
                      <option value="">To</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].quantity = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="text-sm"
                    />
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => handleRemoveLineItem(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateTransfer} disabled={submitting} className="flex-1">
                {submitting ? 'Creating...' : 'Create Transfer'}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1" disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Transfers List */}
      <div className="space-y-3">
        {filteredTransfers.map((transfer) => {
          const config = statusConfig[transfer.status]
          return (
            <Card key={transfer.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{transfer.category.toUpperCase()} Transfer</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    By {transfer.createdBy} on {transfer.createdDate}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Approver 1:</span>{' '}
                      <span className="font-medium">{transfer.approver1}</span>
                      <span className={`ml-2 text-xs ${
                        transfer.approver1Status === 'approved' ? 'text-green-600' :
                        transfer.approver1Status === 'rejected' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {transfer.approver1Status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Approver 2:</span>{' '}
                      <span className="font-medium">{transfer.approver2}</span>
                      <span className={`ml-2 text-xs ${
                        transfer.approver2Status === 'approved' ? 'text-green-600' :
                        transfer.approver2Status === 'rejected' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {transfer.approver2Status}
                      </span>
                    </div>
                  </div>
                  {transfer.notes && (
                    <p className="text-sm text-slate-600 mt-2">Note: {transfer.notes}</p>
                  )}
                </div>
                <Truck className="w-6 h-6 text-slate-400 flex-shrink-0" />
              </div>
            </Card>
          )
        })}
        {filteredTransfers.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            No transfers found matching your filters.
          </Card>
        )}
      </div>
    </div>
  )
}
