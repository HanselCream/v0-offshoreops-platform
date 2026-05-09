'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inventoryItems, categories, locations } from '@/lib/mock-data'

export default function InventoryPage() {
  const [items, setItems] = useState(inventoryItems)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', location: '', quantity: '', minStock: '', unitPrice: '' })

  const handleAddItem = () => {
    if (!formData.name || !formData.sku || !formData.category || !formData.location) {
      alert('Please fill in all required fields')
      return
    }
    const newItem = {
      id: (Math.max(...items.map(i => parseInt(i.id))) + 1).toString(),
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      location: formData.location,
      quantity: parseInt(formData.quantity) || 0,
      minStock: parseInt(formData.minStock) || 0,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      lastUpdated: new Date().toISOString(),
    }
    setItems([...items, newItem])
    setFormData({ name: '', sku: '', category: '', location: '', quantity: '', minStock: '', unitPrice: '' })
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-600 mt-1">Manage items across all locations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
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
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Location
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  Unit Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity < item.minStock
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.location}</td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${
                      isLowStock ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {item.quantity}
                      {isLowStock && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Low Stock</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                      ${item.unitPrice.toFixed(2)}
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
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
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
