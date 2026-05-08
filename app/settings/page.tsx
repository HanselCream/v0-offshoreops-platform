'use client'

import { useState } from 'react'
import { Save, Bell, Lock, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications')
  const [settings, setSettings] = useState({
    emailOnTransferRequest: true,
    emailOnPPEExpiry: true,
    emailOnMaintenanceOverdue: true,
    emailOnApprovalRequest: true,
    expiryAlertDays: '30',
    maintenanceAlertDays: '7',
  })

  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Team Lead' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Field Staff' },
  ])

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSaveSettings = () => {
    console.log('Settings saved:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure system preferences and user management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'text-blue-600 border-b-blue-600'
              : 'text-slate-600 border-b-transparent hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-blue-600'
              : 'text-slate-600 border-b-transparent hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </span>
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailOnTransferRequest}
                  onChange={(e) => handleSettingChange('emailOnTransferRequest', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="font-medium text-slate-900">Transfer Request Notifications</p>
                  <p className="text-sm text-slate-600">Send email when a new transfer request is created</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailOnPPEExpiry}
                  onChange={(e) => handleSettingChange('emailOnPPEExpiry', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="font-medium text-slate-900">PPE Expiry Alerts</p>
                  <p className="text-sm text-slate-600">Send email when PPE items are expiring or expired</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailOnMaintenanceOverdue}
                  onChange={(e) => handleSettingChange('emailOnMaintenanceOverdue', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="font-medium text-slate-900">Maintenance Overdue Alerts</p>
                  <p className="text-sm text-slate-600">Send email when maintenance tasks are overdue</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailOnApprovalRequest}
                  onChange={(e) => handleSettingChange('emailOnApprovalRequest', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="font-medium text-slate-900">Approval Request Notifications</p>
                  <p className="text-sm text-slate-600">Send email when approval is requested</p>
                </div>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PPE Expiry Alert (days before)
                </label>
                <Input
                  type="number"
                  value={settings.expiryAlertDays}
                  onChange={(e) => handleSettingChange('expiryAlertDays', e.target.value)}
                />
                <p className="text-sm text-slate-600 mt-1">Alert when PPE will expire in X days</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maintenance Alert (days before)
                </label>
                <Input
                  type="number"
                  value={settings.maintenanceAlertDays}
                  onChange={(e) => handleSettingChange('maintenanceAlertDays', e.target.value)}
                />
                <p className="text-sm text-slate-600 mt-1">Alert when maintenance is due in X days</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Lock className="w-4 h-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New User</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <Input placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <Input type="email" placeholder="Enter email address" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-white">
                    <option>Admin</option>
                    <option>Team Lead</option>
                    <option>Field Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Initial Password
                  </label>
                  <Input type="password" placeholder="Enter temporary password" />
                </div>
              </div>
              <Button className="w-full">Add User</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
