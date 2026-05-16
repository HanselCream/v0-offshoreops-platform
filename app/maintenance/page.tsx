'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maintenanceTasks, locations, ppeItems, inventoryItems } from '@/lib/mock-data'
import { getItemsDueMaintenance, getExpiredItems, createMaintenanceFromInventory } from '@/lib/inventory-utils'
import type { MaintenanceTask } from '@/lib/mock-data'

const statusColors = {
  pending: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  due: 'bg-orange-100 text-orange-700',
  'due-soon': 'bg-amber-100 text-amber-700',
  'valid': 'bg-green-100 text-green-700',
  'expiring-soon': 'bg-amber-100 text-amber-700',
  'expired': 'bg-red-100 text-red-700',
}

export default function MaintenancePage() {
  // Auto-populate maintenance tasks from inventory on load
  const generateAutoMaintenanceTasks = () => {
    const autoTasks: MaintenanceTask[] = []
    
    // Add expired items
    const expiredItems = getExpiredItems(inventoryItems)
    expiredItems.forEach(item => {
      autoTasks.push(createMaintenanceFromInventory(item, 'expired'))
    })
    
    // Add items due for maintenance
    const dueTasks = getItemsDueMaintenance(inventoryItems)
    dueTasks.forEach(item => {
      autoTasks.push(createMaintenanceFromInventory(item, 'due-maintenance'))
    })
    
    return autoTasks
  }

  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
    const autoTasks = generateAutoMaintenanceTasks()
    return [...autoTasks, ...maintenanceTasks]
  })
  const [tab, setTab] = useState<'equipment' | 'ppe'>('equipment')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    category: 'equipment' as MaintenanceTask['category'],
    equipmentName: '',
    location: '',
    scheduledDate: '',
    assignedTo: '',
    maintenanceInterval: '',
    lastMaintainedDate: '',
    warrantyDate: '',
    assetTag: '',
    releaseDate: '',
    locationLocked: false,
    notes: '',
  })

  const handleAddTask = () => {
    const requiredFields = tab === 'ppe'
      ? [formData.equipmentName, formData.location, formData.scheduledDate, formData.releaseDate]
      : [formData.equipmentName, formData.location, formData.scheduledDate]

    if (requiredFields.some(f => !f)) {
      alert('Please fill in all required fields')
      return
    }

    const newTask: MaintenanceTask = {
      id: `MT-${Date.now()}`,
      equipmentId: `EQ-${Date.now()}`,
      equipmentName: formData.equipmentName,
      category: tab === 'ppe' ? 'ppe' : 'equipment',
      location: formData.location,
      scheduledDate: formData.scheduledDate,
      status: 'pending',
      assignedTo: formData.assignedTo || 'Unassigned',
      expiryDate: tab === 'ppe' ? new Date(new Date(formData.releaseDate).getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      releaseDate: tab === 'ppe' ? formData.releaseDate : undefined,
      ppeStatus: tab === 'ppe' ? 'valid' : undefined,
      maintenanceInterval: tab !== 'ppe' ? parseInt(formData.maintenanceInterval) : undefined,
      lastMaintainedDate: tab !== 'ppe' ? formData.lastMaintainedDate : undefined,
      warrantyDate: formData.warrantyDate || undefined,
      assetTag: formData.assetTag || undefined,
      locationLocked: tab === 'tools' ? formData.locationLocked : undefined,
      notes: formData.notes || undefined,
    }

    setTasks([...tasks, newTask])
    setFormData({
      category: 'equipment',
      equipmentName: '',
      location: '',
      scheduledDate: '',
      assignedTo: '',
      maintenanceInterval: '',
      lastMaintainedDate: '',
      warrantyDate: '',
      assetTag: '',
      releaseDate: '',
      locationLocked: false,
      notes: '',
    })
    setShowModal(false)
  }

  const handleCompleteTask = (id: string) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: 'completed', completedDate: new Date().toISOString().split('T')[0] } : t
    ))
  }

  const handleStartTask = (id: string) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: 'in-progress' } : t
    ))
  }

  const filteredTasks = useMemo(() => {
    const categoryTasks = tab === 'ppe' ? tasks.filter(t => t.category === 'ppe') : tasks.filter(t => t.category !== 'ppe')
    
    return categoryTasks.filter((task) => {
      const matchesSearch = task.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus || (tab === 'ppe' && task.ppeStatus === selectedStatus)
      const matchesLocation = selectedLocation === 'all' || task.location === selectedLocation

      return matchesSearch && matchesStatus && matchesLocation
    })
  }, [tasks, tab, searchTerm, selectedStatus, selectedLocation])

  const statusList = tab === 'ppe'
    ? ['all', 'valid', 'expiring-soon', 'expired']
    : ['all', 'pending', 'in-progress', 'completed', 'overdue']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance & PPE</h1>
          <p className="text-slate-600">Equipment maintenance tracking and PPE lifecycle management</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Add {tab === 'ppe' ? 'PPE' : 'Equipment'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab('equipment')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'equipment'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Equipment Maintenance
        </button>
        <button
          onClick={() => setTab('ppe')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'ppe'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          PPE Management
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-white"
        >
          {statusList.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-white"
        >
          <option value="all">All Locations</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.name}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No {tab === 'ppe' ? 'PPE' : 'equipment'} found</p>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const status = tab === 'ppe' ? (task.ppeStatus || 'valid') : task.status
            const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.pending

            return (
              <Card
                key={task.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
              >
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900">{task.equipmentName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {task.location} • Assigned to {task.assignedTo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{task.scheduledDate}</p>
                      {tab !== 'ppe' && task.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartTask(task.id)
                            }}
                          >
                            Start Task
                          </Button>
                        </div>
                      )}
                      {tab !== 'ppe' && task.status === 'in-progress' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompleteTask(task.id)
                            }}
                          >
                            Complete Task
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === task.id && (
                  <div className="p-4 bg-slate-50 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {tab === 'ppe' && (
                        <>
                          <div>
                            <p className="text-slate-600">Release Date</p>
                            <p className="font-semibold">{task.releaseDate || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Expiry Date</p>
                            <p className="font-semibold">{task.expiryDate || '-'}</p>
                          </div>
                        </>
                      )}
                      {tab !== 'ppe' && (
                        <>
                          <div>
                            <p className="text-slate-600">Last Maintained</p>
                            <p className="font-semibold">{task.lastMaintainedDate || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Next Due</p>
                            <p className="font-semibold">{task.nextDueDate || 'TBD'}</p>
                          </div>
                          {task.warrantyDate && (
                            <div>
                              <p className="text-slate-600">Warranty Date</p>
                              <p className="font-semibold">{task.warrantyDate}</p>
                            </div>
                          )}
                          {task.assetTag && (
                            <div>
                              <p className="text-slate-600">Asset Tag</p>
                              <p className="font-semibold">{task.assetTag}</p>
                            </div>
                          )}
                        </>
                      )}
                      {task.notes && (
                        <div className="col-span-2">
                          <p className="text-slate-600">Notes</p>
                          <p className="font-semibold">{task.notes}</p>
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add {tab === 'ppe' ? 'PPE' : 'Equipment'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name
                </label>
                <Input
                  placeholder={tab === 'ppe' ? 'e.g. Safety Helmet' : 'e.g. Pump A-01'}
                  value={formData.equipmentName}
                  onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white"
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assigned To
                </label>
                <Input
                  placeholder="Officer name"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>

              {tab === 'ppe' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Release Date
                    </label>
                    <Input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    />
                  </div>
                  <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
                    Expiry date will auto-calculate as 5 years from release date
                  </div>
                </>
              )}

              {tab !== 'ppe' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Last Maintained Date
                    </label>
                    <Input
                      type="date"
                      value={formData.lastMaintainedDate}
                      onChange={(e) => setFormData({ ...formData, lastMaintainedDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Maintenance Interval (days)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 90"
                      value={formData.maintenanceInterval}
                      onChange={(e) => setFormData({ ...formData, maintenanceInterval: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scheduled Date
                </label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddTask} className="flex-1">
                  Add {tab === 'ppe' ? 'PPE' : 'Equipment'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
