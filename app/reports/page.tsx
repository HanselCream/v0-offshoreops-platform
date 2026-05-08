'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { inventoryItems, ppeItems, transfers, maintenanceTasks } from '@/lib/mock-data'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')

  const locations = [
    { id: '1', name: 'Main Plant' },
    { id: '2', name: 'Offshore Rig A' },
    { id: '3', name: 'Offshore Rig B' },
    { id: '4', name: 'Port Facility' },
    { id: '5', name: 'Warehouse' },
  ]

  const handleExportPPEReport = (format: 'pdf' | 'excel') => {
    const reportData = ppeItems.map((item) => ({
      'Item Name': item.name,
      'Type': item.type,
      'Location': item.location,
      'Quantity': item.quantity,
      'Expiry Date': item.expiryDate,
      'Status': item.status,
    }))

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Report')
      XLSX.writeFile(workbook, 'ppe-compliance-report.xlsx')
    } else {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const tableStartY = 40

      doc.setFontSize(16)
      doc.text('PPE Compliance Report', margin, 20)

      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 30)

      const headers = ['Item Name', 'Type', 'Location', 'Qty', 'Expiry', 'Status']
      const rows = reportData.map((item) => [
        item['Item Name'],
        item['Type'],
        item['Location'],
        item['Quantity'].toString(),
        item['Expiry Date'],
        item['Status'],
      ])

      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
        margin: { left: margin, right: margin },
      })

      doc.save('ppe-compliance-report.pdf')
    }
  }

  const handleExportTransferReport = (format: 'pdf' | 'excel') => {
    const reportData = transfers.map((transfer) => ({
      'Transfer ID': transfer.id,
      'From': transfer.fromLocation,
      'To': transfer.toLocation,
      'Status': transfer.status,
      'Created By': transfer.createdBy,
      'Created Date': transfer.createdDate,
      'Items': transfer.items.length,
    }))

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfer Report')
      XLSX.writeFile(workbook, 'transfer-log-report.xlsx')
    } else {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const tableStartY = 40

      doc.setFontSize(16)
      doc.text('Transfer Log Report', margin, 20)

      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 30)

      const headers = ['Transfer ID', 'From', 'To', 'Status', 'Created By', 'Date', 'Items']
      const rows = reportData.map((item) => [
        item['Transfer ID'],
        item['From'],
        item['To'],
        item['Status'],
        item['Created By'],
        item['Created Date'],
        item['Items'].toString(),
      ])

      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
        margin: { left: margin, right: margin },
      })

      doc.save('transfer-log-report.pdf')
    }
  }

  const handleExportMaintenanceReport = (format: 'pdf' | 'excel') => {
    const reportData = maintenanceTasks.map((task) => ({
      'Equipment': task.equipmentName,
      'Type': task.type,
      'Location': task.location,
      'Scheduled': task.scheduledDate,
      'Status': task.status,
      'Assigned To': task.assignedTo,
    }))

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Report')
      XLSX.writeFile(workbook, 'maintenance-history-report.xlsx')
    } else {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const tableStartY = 40

      doc.setFontSize(16)
      doc.text('Maintenance History Report', margin, 20)

      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 30)

      const headers = ['Equipment', 'Type', 'Location', 'Scheduled', 'Status', 'Assigned To']
      const rows = reportData.map((item) => [
        item['Equipment'],
        item['Type'],
        item['Location'],
        item['Scheduled'],
        item['Status'],
        item['Assigned To'],
      ])

      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
        margin: { left: margin, right: margin },
      })

      doc.save('maintenance-history-report.pdf')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">Generate and export reports</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
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

      {/* PPE Compliance Report */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">PPE Compliance Report</h3>
            <p className="text-slate-600">All PPE items with status and expiry information</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportPPEReport('excel')}
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExportPPEReport('pdf')}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Transfer Log Report */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Transfer Log Report</h3>
            <p className="text-slate-600">Complete transfer history with status and dates</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportTransferReport('excel')}
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExportTransferReport('pdf')}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Maintenance History Report */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Maintenance History Report</h3>
            <p className="text-slate-600">Equipment maintenance schedule and completion status</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportMaintenanceReport('excel')}
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExportMaintenanceReport('pdf')}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
