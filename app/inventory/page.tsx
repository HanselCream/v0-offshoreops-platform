'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Download, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inventoryItems, categories, locations } from '@/lib/mock-data'
import { calculateInventoryStatus, formatDate } from '@/lib/inventory-utils'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  location: string
  quantity: number
  minStock: number
  maxThreshold: number
  unitPrice: number
  validityDate?: string
  maintenanceScheduleDate?: string
  status: 'ok' | 'low-stock' | 'out-of-stock'
  lastUpdated: string
}

const categoryCodeMap: { [key: string]: string } = {
  'PPE': 'PPE',
  'Tools': 'TOOLS',
  'Safety Equipment': 'SAFETY',
  'IT Equipment': 'IT',
  'Consumable': 'CONS',
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showModal, setShowModal] = useState(false)
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

  const handleAddItem = () => {
    if (!formData.name || !formData.category || !formData.location || !formData.quantity) {
      alert('Please fill in all required fields')
      return
    }
    const newItem: InventoryItem = {
      id: (Math.max(...items.map(i => parseInt(i.id)), 0) + 1).toString(),
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
      lastUpdated: new Date().toISOString(),
    }
    // Recalculate status based on dates and quantities
    newItem.status = calculateInventoryStatus(newItem) as any
    setItems([...items, newItem])
    setFormData({ name: '', sku: '', category: '', location: '', quantity: '', minStock: '', maxThreshold: '', unitPrice: '', validityDate: '', maintenanceScheduleDate: '' })
    setShowModal(false)
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation

      return matchesSearch && matchesCategory && matchesLocation
    })
  }, [searchTerm, selectedCategory, selectedLocation])

  const handleExport = () => {
    const csv = [
      ['Name', 'SKU', 'Category', 'Location', 'Quantity', 'Min Stock', 'Unit Price'],
      ...filteredItems.map((item) => [
        item.name,
        item.sku,
        item.category,
        item.location,
        item.quantity.toString(),
        item.minStock.toString(),
        `$${item.unitPrice.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-600">Manage items across all locations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
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

      {/* Results */}
      <div className="text-sm text-slate-600">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
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
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name
                </label>
                <Input 
                  placeholder="Enter item name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SKU
                </label>
                <Input 
                  placeholder="Enter SKU" 
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min Threshold
                  </label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Threshold
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity
                  </label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit Price
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Validity Date
                  </label>
                  <Input 
                    type="date" 
                    value={formData.validityDate}
                    onChange={(e) => setFormData({...formData, validityDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Maintenance Schedule
                  </label>
                  <Input 
                    type="date" 
                    value={formData.maintenanceScheduleDate}
                    onChange={(e) => setFormData({...formData, maintenanceScheduleDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddItem} className="flex-1">
                  Add Item
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
