'use client'

import { useState, useMemo } from 'react'
import { Plus, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maintenanceTasks, locations } from '@/lib/mock-data'

const statusColors = {
  pending: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  'in-progress': <Clock className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  overdue: <AlertCircle className="w-4 h-4" />,
}

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter((task) => {
      const matchesSearch =
        task.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
      const matchesLocation = selectedLocation === 'all' || task.location === selectedLocation

      return matchesSearch && matchesStatus && matchesLocation
    })
  }, [searchTerm, selectedStatus, selectedLocation])

  const handleExport = () => {
    const csv = [
      ['Equipment', 'Type', 'Location', 'Scheduled Date', 'Status', 'Assigned To'],
      ...filteredTasks.map((task) => [
        task.equipmentName,
        task.type,
        task.location,
        task.scheduledDate,
        task.status,
        task.assignedTo,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maintenance-tasks.csv'
    a.click()
  }

  const overdueCount = maintenanceTasks.filter((task) => task.status === 'overdue').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-600 mt-1">Schedule and track equipment maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Task</span>
          </Button>
        </div>
      </div>

      {/* Alert Card */}
      {overdueCount > 0 && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Overdue Maintenance</h3>
              <p className="text-red-700 text-sm mt-1">
                {overdueCount} task{overdueCount !== 1 ? 's' : ''} {overdueCount === 1 ? 'is' : 'are'} overdue and require immediate attention
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <Input
              placeholder="Equipment or type..."
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
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
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
        Showing {filteredTasks.length} of {maintenanceTasks.length} tasks
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{task.equipmentName}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[task.status]} flex items-center gap-1`}>
                      {statusIcons[task.status]}
                      {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>{task.type} • {task.location}</p>
                    <p className="mt-1">Assigned to: {task.assignedTo}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">{task.scheduledDate}</p>
                  {task.status === 'pending' && (
                    <Button size="sm" variant="outline" className="mt-2">
                      Start Task
                    </Button>
                  )}
                  {task.status === 'in-progress' && (
                    <Button size="sm" variant="outline" className="mt-2">
                      Complete Task
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === task.id && (
              <div className="border-t border-border p-4 bg-slate-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Equipment ID</p>
                    <p className="font-semibold text-slate-900">{task.equipmentId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Type</p>
                    <p className="font-semibold text-slate-900">{task.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Location</p>
                    <p className="font-semibold text-slate-900">{task.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Scheduled Date</p>
                    <p className="font-semibold text-slate-900">{task.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Assigned To</p>
                    <p className="font-semibold text-slate-900">{task.assignedTo}</p>
                  </div>
                  {task.completedDate && (
                    <div>
                      <p className="text-slate-600">Completed</p>
                      <p className="font-semibold text-slate-900">{task.completedDate}</p>
                    </div>
                  )}
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Schedule Maintenance Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Equipment Name
                </label>
                <Input placeholder="Enter equipment name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maintenance Type
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md bg-white">
                  <option>Preventive Maintenance</option>
                  <option>Corrective Maintenance</option>
                  <option>Routine Inspection</option>
                </select>
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
                    Scheduled Date
                  </label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Assign To
                  </label>
                  <Input placeholder="Technician name" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowModal(false)} className="flex-1">
                  Schedule Task
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
