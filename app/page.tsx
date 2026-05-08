'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const stats = [
    { label: 'Total Inventory', value: '2,847', color: 'bg-blue-100 text-blue-700' },
    { label: 'Transfers (Pending)', value: '12', color: 'bg-amber-100 text-amber-700' },
    { label: 'PPE Items (Expired)', value: '5', color: 'bg-red-100 text-red-700' },
    { label: 'Maintenance (Overdue)', value: '3', color: 'bg-orange-100 text-orange-700' },
  ]

  const modules = [
    {
      title: 'Inventory',
      description: 'Manage items across all locations',
      href: '/inventory',
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Transfers',
      description: 'Track item transfers between locations',
      href: '/transfers',
      icon: '🚚',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'PPE',
      description: 'Monitor PPE expiry and compliance',
      href: '/ppe',
      icon: '🦺',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Maintenance',
      description: 'Schedule and track equipment maintenance',
      href: '/maintenance',
      icon: '🔧',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Approvals',
      description: 'Manage approval workflows',
      href: '/approvals',
      icon: '✓',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Reports',
      description: 'Generate and export reports',
      href: '/reports',
      icon: '📈',
      color: 'from-pink-500 to-pink-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to OffshoreOps - Compliance Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link key={index} href={module.href}>
              <Card className="h-full p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`inline-block text-4xl mb-4 p-3 rounded-lg bg-gradient-to-br ${module.color}`}>
                  {module.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{module.title}</h3>
                <p className="text-slate-600 mb-4">{module.description}</p>
                <Button variant="outline" className="w-full">
                  View Module
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-12 text-base">
            <Link href="/inventory?action=add">Add New Item</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-base">
            <Link href="/transfers?action=new">Create Transfer</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-base">
            <Link href="/reports">View Reports</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
