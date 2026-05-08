'use client'

import { useState, useMemo } from 'react'
import { Plus, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ppeItems, locations } from '@/lib/mock-data'

const statusColors = {
  active: 'bg-green-100 text-green-700',
  'expiring-soon': 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
}

const statusIcons = {
  active: <CheckCircle className="w-4 h-4" />,
  'expiring-soon': <AlertCircle className="w-4 h-4" />,
  expired: <AlertCircle className="w-4 h-4" />,
}

export default function PPEPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filteredItems = useMemo(() => {
    return ppeItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation

      return matchesSearch && matchesStatus && matchesLocation
    })
  }, [searchTerm, selectedStatus, selectedLocation])

  const handleExport = () => {
    const csv = [
      ['Name', 'Type', 'Location', 'Quantity', 'Expiry Date', 'Status'],
      ...filteredItems.map((item) => [
        item.name,
        item.type,
        item.location,
        item.quantity.toString(),
        item.expiryDate,
        item.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ppe-items.csv'
    a.click()
  }

  const expiredCount = ppeItems.filter((item) => item.status === 'expired').length
  const expiringCount = ppeItems.filter((item) => item.status === 'expiring-soon').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">PPE Management</h1>
          <p className="text-slate-600 mt-1">Monitor PPE expiry and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add PPE</span>
          </Button>
        </div>
      </div>

      {/* Alert Cards */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredCount > 0 && (
            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Expired PPE</h3>
                  <p className="text-red-700 text-sm mt-1">
                    {expiredCount} item{expiredCount !== 1 ? 's' : ''} {expiredCount === 1 ? 'has' : 'have'} expired and need replacement
                  </p>
                </div>
              </div>
            </Card>
          )}
          {expiringCount > 0 && (
            <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Expiring Soon</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    {expiringCount} item{expiringCount !== 1 ? 's' : ''} {expiringCount === 1 ? 'is' : 'are'} expiring within 30 days
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <Input
              placeholder="Name or type..."
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
              <option value="active">Active</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
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
        Showing {filteredItems.length} of {ppeItems.length} items
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
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Location
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.location}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.expiryDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {statusIcons[item.status]}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                        {item.status === 'expiring-soon' ? 'Expiring Soon' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New PPE Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name
                </label>
                <Input placeholder="Enter PPE item name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <Input placeholder="e.g., Head Protection, Life Safety" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md bg-white">
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity
                  </label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowModal(false)} className="flex-1">
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
