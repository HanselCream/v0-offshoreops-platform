'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Download, AlertCircle, Loader } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchInventoryItems, fetchCategories, fetchLocations, createInventoryItem, type InventoryItem } from '@/lib/supabase'
import { calculateInventoryStatus, formatDate } from '@/lib/inventory-utils'

const categoryCodeMap: { [key: string]: string } = {
  'PPE': 'PPE',
  'Tools': 'TOOLS',
  'Safety Equipment': 'SAFETY',
  'IT Equipment': 'IT',
  'Consumable': 'CONS',
  'Parts & Supplies': 'PARTS',
  'Documentation': 'DOC',
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    sku: '', 
    category: '', 
    location: '', 
    quantity: '', 
    minStock: '', 
    maxThreshold: '',
    unitPrice: '',
    validityDate: '',
    maintenanceScheduleDate: '',
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [itemsData, categoriesData, locationsData] = await Promise.all([
          fetchInventoryItems(),
          fetchCategories(),
          fetchLocations(),
        ])
        setItems(itemsData)
        setCategories(categoriesData)
        setLocations(locationsData)
      } catch (err) {
        console.error('Error loading inventory data:', err)
        setError('Failed to load inventory data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const generateSKU = (category: string) => {
    const categoryCode = categoryCodeMap[category] || category.substring(0, 3).toUpperCase()
    const categoryItems = items.filter((item) => item.category === category)
    const nextNumber = categoryItems.length + 1
    return `${categoryCode}-${String(nextNumber).padStart(3, '0')}`
  }

  const handleCategoryChange = (newCategory: string) => {
    setFormData({
      ...formData,
      category: newCategory,
      sku: newCategory ? generateSKU(newCategory) : '',
    })
  }

  const handleAddItem = async () => {
    if (!formData.name || !formData.category || !formData.location || !formData.quantity) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const newItem: Omit<InventoryItem, 'id' | 'lastUpdated'> = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        location: formData.location,
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 0,
        maxThreshold: parseInt(formData.maxThreshold) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        validityDate: formData.validityDate || undefined,
        maintenanceScheduleDate: formData.maintenanceScheduleDate || undefined,
        status: 'ok',
      }

      const createdItem = await createInventoryItem(newItem)
      setItems([createdItem, ...items])
      setFormData({ name: '', sku: '', category: '', location: '', quantity: '', minStock: '', maxThreshold: '', unitPrice: '', validityDate: '', maintenanceScheduleDate: '' })
      setShowModal(false)
    } catch (err) {
      console.error('Error creating inventory item:', err)
      alert('Failed to create item. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation
      return matchesSearch && matchesCategory && matchesLocation
    })
  }, [items, searchTerm, selectedCategory, selectedLocation])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600">Loading inventory...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-600 mt-1">Track and manage all equipment and supplies</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
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
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Add Item Modal */}
      {showModal && (
        <Card className="p-6 bg-white border-2 border-primary/30">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Item</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <Input 
                  placeholder="e.g., Hard Hat" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Auto-generated)</label>
                <Input 
                  placeholder="Auto-generated" 
                  value={formData.sku}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <select 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min Threshold</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Threshold</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.maxThreshold}
                  onChange={(e) => setFormData({...formData, maxThreshold: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Validity Date</label>
                <Input 
                  type="date" 
                  value={formData.validityDate}
                  onChange={(e) => setFormData({...formData, validityDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Schedule</label>
                <Input 
                  type="date" 
                  value={formData.maintenanceScheduleDate}
                  onChange={(e) => setFormData({...formData, maintenanceScheduleDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddItem} disabled={submitting} className="flex-1">
                {submitting ? 'Creating...' : 'Create Item'}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1" disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Item Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Location
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Validity Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Maintenance Due
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => {
                const computedStatus = calculateInventoryStatus(item)
                const statusColor = computedStatus === 'ok' ? 'bg-green-100 text-green-700' : 
                                   computedStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-700' : 
                                   computedStatus === 'expiring-soon' ? 'bg-amber-100 text-amber-700' :
                                   computedStatus === 'expired' ? 'bg-red-100 text-red-700' :
                                   'bg-red-100 text-red-700'
                const statusLabel = computedStatus === 'ok' ? 'OK' :
                                   computedStatus === 'low-stock' ? 'Low Stock' :
                                   computedStatus === 'expiring-soon' ? 'Expiring Soon' :
                                   computedStatus === 'expired' ? 'Expired' :
                                   'Out of Stock'
                
                const today = new Date().toISOString().split('T')[0]
                const maintenanceDue = item.maintenanceScheduleDate && item.maintenanceScheduleDate <= today
                
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${maintenanceDue ? 'bg-orange-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.location}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatDate(item.validityDate)}
                    </td>
                    <td className="px-4 py-3">
                      {maintenanceDue ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-semibold text-red-600">DUE</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-600">{formatDate(item.maintenanceScheduleDate)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No items found matching your filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
