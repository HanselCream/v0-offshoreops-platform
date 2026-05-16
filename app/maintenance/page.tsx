'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, AlertCircle, Loader } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchMaintenanceTasks, createMaintenanceTask, updateMaintenanceTask, type MaintenanceTask } from '@/lib/supabase'

const statusColors = {
  pending: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('equipment')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    equipmentName: '',
    location: '',
    scheduledDate: '',
    assignedTo: '',
    releaseDate: '',
    notes: '',
    maintenanceInterval: '',
    lastMaintainedDate: '',
  })

  // Load maintenance tasks
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const tasksData = await fetchMaintenanceTasks()
        setTasks(tasksData)
      } catch (err) {
        console.error('Error loading maintenance tasks:', err)
        setError('Failed to load maintenance tasks. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCreateTask = async () => {
    if (!formData.equipmentName || !formData.location || !formData.scheduledDate) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const newTask: Omit<MaintenanceTask, 'id'> = {
        equipmentId: `eq-${Date.now()}`,
        equipmentName: formData.equipmentName,
        category: activeTab === 'ppe' ? 'ppe' : 'equipment',
        location: formData.location,
        scheduledDate: formData.scheduledDate,
        assignedTo: formData.assignedTo || 'Unassigned',
        status: 'pending',
        releaseDate: activeTab === 'ppe' ? formData.releaseDate : undefined,
        expiryDate: activeTab === 'ppe' && formData.releaseDate ? 
          new Date(new Date(formData.releaseDate).getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
        ppeStatus: activeTab === 'ppe' ? 'valid' : undefined,
        maintenanceInterval: activeTab !== 'ppe' ? parseInt(formData.maintenanceInterval) || undefined : undefined,
        lastMaintainedDate: activeTab !== 'ppe' ? formData.lastMaintainedDate || undefined : undefined,
        notes: formData.notes || undefined,
      }

      const createdTask = await createMaintenanceTask(newTask)
      setTasks([createdTask, ...tasks])
      setFormData({
        equipmentName: '',
        location: '',
        scheduledDate: '',
        assignedTo: '',
        releaseDate: '',
        notes: '',
        maintenanceInterval: '',
        lastMaintainedDate: '',
      })
      setShowModal(false)
    } catch (err) {
      console.error('Error creating maintenance task:', err)
      alert('Failed to create task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: MaintenanceTask['status']) => {
    try {
      const updatedTask = await updateMaintenanceTask(taskId, { status: newStatus })
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
    } catch (err) {
      console.error('Error updating task:', err)
      alert('Failed to update task. Please try again.')
    }
  }

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Filter by tab/category
    if (activeTab === 'ppe') {
      filtered = filtered.filter(t => t.category === 'ppe')
    } else {
      filtered = filtered.filter(t => t.category !== 'ppe')
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      if (activeTab === 'ppe') {
        filtered = filtered.filter(t => t.ppeStatus === selectedStatus)
      } else {
        filtered = filtered.filter(t => t.status === selectedStatus)
      }
    }

    return filtered
  }, [tasks, activeTab, searchTerm, selectedStatus])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600">Loading maintenance tasks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance & PPE</h1>
          <p className="text-slate-600 mt-1">Equipment maintenance tracking and PPE lifecycle management</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'equipment'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Equipment Maintenance
        </button>
        <button
          onClick={() => setActiveTab('ppe')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'ppe'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          PPE Management
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <Input
              placeholder="Search by name or location..."
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
              {activeTab === 'ppe' ? (
                <>
                  <option value="all">All Status</option>
                  <option value="valid">Valid</option>
                  <option value="expiring-soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </>
              ) : (
                <>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </>
              )}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-slate-600">
              Total: <span className="font-bold">{filteredTasks.length}</span> tasks
            </div>
          </div>
        </div>
      </Card>

      {/* Create Task Modal */}
      {showModal && (
        <Card className="p-6 bg-white border-2 border-primary/30">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Task</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Equipment/Item Name *</label>
                <Input
                  placeholder={activeTab === 'ppe' ? 'e.g., Safety Helmet' : 'e.g., Pump A-01'}
                  value={formData.equipmentName}
                  onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                <Input
                  placeholder="e.g., Main Plant"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                <Input
                  placeholder="Technician name"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date *</label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
            </div>

            {activeTab === 'ppe' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Release Date</label>
                <Input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">Expiry will auto-calculate as 5 years from release date</p>
              </div>
            )}

            {activeTab !== 'ppe' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Maintained Date</label>
                    <Input
                      type="date"
                      value={formData.lastMaintainedDate}
                      onChange={(e) => setFormData({ ...formData, lastMaintainedDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Interval (days)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 90"
                      value={formData.maintenanceInterval}
                      onChange={(e) => setFormData({ ...formData, maintenanceInterval: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <Input
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateTask} disabled={submitting} className="flex-1">
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1" disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const displayStatus = activeTab === 'ppe' ? (task.ppeStatus || 'valid') : task.status
          const statusColor = statusColors[displayStatus as keyof typeof statusColors] || statusColors.pending

          return (
            <Card
              key={task.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{task.equipmentName}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColor}`}>
                      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{task.location}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Assigned to:</span>{' '}
                      <span className="font-medium">{task.assignedTo}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Scheduled:</span>{' '}
                      <span className="font-medium">{task.scheduledDate}</span>
                    </div>
                  </div>
                </div>
                {activeTab !== 'ppe' && task.status !== 'completed' && (
                  <div className="flex gap-2 flex-shrink-0">
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(task.id, 'in-progress')
                        }}
                        variant="outline"
                      >
                        Start
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpdateStatus(task.id, 'completed')
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Complete
                    </Button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === task.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
                  {activeTab === 'ppe' && (
                    <>
                      <div>
                        <span className="text-slate-600">Release Date:</span>{' '}
                        <span className="font-medium">{task.releaseDate || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Expiry Date:</span>{' '}
                        <span className="font-medium">{task.expiryDate || '-'}</span>
                      </div>
                    </>
                  )}
                  {activeTab !== 'ppe' && (
                    <>
                      <div>
                        <span className="text-slate-600">Last Maintained:</span>{' '}
                        <span className="font-medium">{task.lastMaintainedDate || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Maintenance Interval:</span>{' '}
                        <span className="font-medium">{task.maintenanceInterval ? `${task.maintenanceInterval} days` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Next Due Date:</span>{' '}
                        <span className="font-medium">{task.nextDueDate || 'TBD'}</span>
                      </div>
                    </>
                  )}
                  {task.notes && (
                    <div>
                      <span className="text-slate-600">Notes:</span>{' '}
                      <span className="font-medium">{task.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
        {filteredTasks.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            No maintenance tasks found matching your filters.
          </Card>
        )}
      </div>
    </div>
  )
}
