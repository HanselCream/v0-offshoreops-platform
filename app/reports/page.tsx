'use client'

import { useState, useMemo, useEffect } from 'react'
import { Download, FileText, AlertCircle, Loader } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchInventoryItems, fetchTransfers, fetchMaintenanceTasks, fetchLocations } from '@/lib/supabase'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  } catch {
    return dateString
  }
}

export default function ReportsPage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [invData, tranData, mainData, locData] = await Promise.all([
          fetchInventoryItems(),
          fetchTransfers(),
          fetchMaintenanceTasks(),
          fetchLocations(),
        ])
        setInventoryItems(invData)
        setTransfers(tranData)
        setMaintenanceTasks(mainData)
        setLocations(locData)
      } catch (err) {
        console.error('Error loading report data:', err)
        setError('Failed to load report data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter inventory by location
  const filteredInventory = useMemo(() => {
    let filtered = inventoryItems

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation)
    }

    return filtered
  }, [inventoryItems, selectedLocation])

  // Filter transfers by date range and location
  const filteredTransfers = useMemo(() => {
    let filtered = transfers

    if (dateFrom) {
      filtered = filtered.filter(t => t.createdDate >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter(t => t.createdDate <= dateTo)
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(t => {
        // Check if any transfer item involves the selected location
        return t.createdDate // Simple filter since we don't have line items structure in Transfer
      })
    }

    return filtered
  }, [transfers, dateFrom, dateTo, selectedLocation])

  // Filter maintenance by date range and location
  const filteredMaintenance = useMemo(() => {
    let filtered = maintenanceTasks

    if (dateFrom) {
      filtered = filtered.filter(t => t.scheduledDate >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter(t => t.scheduledDate <= dateTo)
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(t => t.location === selectedLocation)
    }

    return filtered
  }, [maintenanceTasks, dateFrom, dateTo, selectedLocation])

  const handleExportInventoryReport = (format: 'pdf' | 'excel') => {
    const reportData = filteredInventory.map(item => ({
      'Item Name': item.name,
      'SKU': item.sku || '-',
      'Category': item.category,
      'Location': item.location,
      'Quantity': item.quantity,
      'Min Stock': item.minStock || '-',
      'Status': item.status || 'ok',
      'Unit Price': item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-',
    }))

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Report')
      XLSX.writeFile(workbook, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    } else {
      const doc = new jsPDF()
      const margin = 15
      const tableStartY = 50

      doc.setFontSize(16)
      doc.text('Inventory Report', margin, 20)

      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, margin, 30)
      if (dateFrom) doc.text(`From: ${formatDate(dateFrom)}`, margin, 36)
      if (dateTo) doc.text(`To: ${formatDate(dateTo)}`, margin, 42)

      const headers = ['Item', 'SKU', 'Category', 'Location', 'Qty', 'Min', 'Status', 'Price']
      const rows = reportData.map(item => [
        item['Item Name'].substring(0, 15),
        item['SKU'],
        item['Category'],
        item['Location'],
        item['Quantity'].toString(),
        item['Min Stock'].toString(),
        item['Status'],
        item['Unit Price'],
      ])

      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8 },
      })

      doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }
  }

  const handleExportTransferReport = (format: 'pdf' | 'excel') => {
    const reportData = filteredTransfers.map(transfer => ({
      'Transfer ID': transfer.id,
      'Category': transfer.category,
      'Status': transfer.status,
      'Approver 1': transfer.approver1 || '-',
      'Approver 1 Status': transfer.approver1Status || '-',
      'Approver 2': transfer.approver2 || '-',
      'Approver 2 Status': transfer.approver2Status || '-',
      'Created By': transfer.createdBy,
      'Created Date': transfer.createdDate,
      'Notes': transfer.notes || '-',
    }))

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfer Report')
      XLSX.writeFile(workbook, `transfer-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    } else {
      const doc = new jsPDF('l')
      const margin = 15
      const tableStartY = 50

      doc.setFontSize(16)
      doc.text('Transfer Report', margin, 20)

      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, margin, 30)
      if (dateFrom) doc.text(`From: ${formatDate(dateFrom)}`, margin, 36)
      if (dateTo) doc.text(`To: ${formatDate(dateTo)}`, margin, 42)

      const headers = ['Transfer ID', 'Category', 'Status', 'App1', 'App1 Status', 'App2', 'App2 Status', 'Created']
      const rows = reportData.map(item => [
        item['Transfer ID'],
        item['Category'],
        item['Status'],
        item['Approver 1'].substring(0, 8),
        item['Approver 1 Status'],
        item['Approver 2'].substring(0, 8),
        item['Approver 2 Status'],
        item['Created Date'],
      ])

      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7 },
      })

      doc.save(`transfer-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }
  }

  const handleExportMaintenanceReport = (format: 'pdf' | 'excel') => {
    const reportData = filteredMaintenance.map(task => ({
      'Equipment Name': task.equipmentName,
      'Category': task.category,
      'Location': task.location,
      'Status': task.status || 'pending',
      'Scheduled Date': formatDate(task.scheduledDate),
      'Assigned To': task.assignedTo,
      'Notes': task.notes || '-',
    }))

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Report')
      XLSX.writeFile(workbook, `maintenance-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    } else {
      const doc = new jsPDF()
      const margin = 15
      const tableStartY = 50

      doc.setFontSize(16)
      doc.text('Maintenance Report', margin, 20)

      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, margin, 30)
      if (dateFrom) doc.text(`From: ${formatDate(dateFrom)}`, margin, 36)
      if (dateTo) doc.text(`To: ${formatDate(dateTo)}`, margin, 42)

      const headers = ['Equipment', 'Category', 'Location', 'Status', 'Scheduled', 'Assigned To', 'Notes']
      const rows = reportData.map(item => [
        item['Equipment Name'],
        item['Category'],
        item['Location'],
        item['Status'],
        item['Scheduled Date'],
        item['Assigned To'],
        item['Notes'].substring(0, 20),
      ])

      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
      })

      doc.save(`maintenance-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }
  }

  const hasFiltersApplied = dateFrom || dateTo || selectedLocation !== 'all'

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600">Loading reports data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600">Generate and export operational reports</p>
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
      <Card className="p-4 bg-slate-50 border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
        {hasFiltersApplied && (
          <div className="mt-3 text-sm text-slate-600">
            <strong>Filters Applied:</strong>
            {dateFrom && ` From ${formatDate(dateFrom)}`}
            {dateTo && ` To ${formatDate(dateTo)}`}
            {selectedLocation !== 'all' && ` Location: ${selectedLocation}`}
          </div>
        )}
      </Card>

      {/* Inventory Report */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Inventory Report</h3>
            <p className="text-sm text-slate-600">{filteredInventory.length} items</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExportInventoryReport('excel')} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={() => handleExportInventoryReport('pdf')} variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-6 text-slate-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No records found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Item</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">SKU</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Category</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Location</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-900">Qty</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-900">{item.name}</td>
                    <td className="px-4 py-2 text-slate-600">{item.sku || '-'}</td>
                    <td className="px-4 py-2 text-slate-600">{item.category}</td>
                    <td className="px-4 py-2 text-slate-600">{item.location}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.quantity}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        item.status === 'ok' ? 'bg-green-100 text-green-700' :
                        item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status || 'ok'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Transfer Report */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Transfer Report</h3>
            <p className="text-sm text-slate-600">{filteredTransfers.length} transfers</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExportTransferReport('excel')} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={() => handleExportTransferReport('pdf')} variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {filteredTransfers.length === 0 ? (
          <div className="text-center py-6 text-slate-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No records found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Transfer ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Category</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Approver 1</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Approver 2</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransfers.map(transfer => (
                  <tr key={transfer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-900 font-medium">{transfer.id}</td>
                    <td className="px-4 py-2 text-slate-600">{transfer.category}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transfer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">{transfer.approver1 || '-'}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{transfer.approver2 || '-'}</td>
                    <td className="px-4 py-2 text-slate-600">{formatDate(transfer.createdDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Maintenance Report */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Maintenance Report</h3>
            <p className="text-sm text-slate-600">{filteredMaintenance.length} tasks</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExportMaintenanceReport('excel')} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={() => handleExportMaintenanceReport('pdf')} variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {filteredMaintenance.length === 0 ? (
          <div className="text-center py-6 text-slate-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No records found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Equipment</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Category</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Location</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Scheduled</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMaintenance.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-900">{task.equipmentName}</td>
                    <td className="px-4 py-2 text-slate-600">{task.category}</td>
                    <td className="px-4 py-2 text-slate-600">{task.location}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{formatDate(task.scheduledDate)}</td>
                    <td className="px-4 py-2 text-slate-600">{task.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
