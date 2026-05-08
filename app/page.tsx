'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, TrendingUp, Shield, Wrench, CheckCircle2, FileText, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { 
      label: 'Total Inventory', 
      value: '2,847', 
      icon: Package,
      trend: '+5.2% this month',
      color: 'from-primary/20 to-accent/20 text-primary'
    },
    { 
      label: 'Transfers (Pending)', 
      value: '12', 
      icon: TrendingUp,
      trend: '2 awaiting approval',
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400'
    },
    { 
      label: 'PPE Items (Expired)', 
      value: '5', 
      icon: Shield,
      trend: 'Requires attention',
      color: 'from-red-500/20 to-orange-500/20 text-red-400'
    },
    { 
      label: 'Maintenance (Overdue)', 
      value: '3', 
      icon: Wrench,
      trend: 'Schedule immediately',
      color: 'from-orange-500/20 to-yellow-500/20 text-orange-400'
    },
  ]

  const modules = [
    {
      title: 'Inventory',
      description: 'Manage items across all locations with real-time tracking',
      href: '/inventory',
      icon: Package,
      color: 'from-primary/20 to-accent/20',
      accentColor: 'text-primary',
    },
    {
      title: 'Transfers',
      description: 'Track transfers with approval workflows and proof of delivery',
      href: '/transfers',
      icon: TrendingUp,
      color: 'from-blue-500/20 to-cyan-500/20',
      accentColor: 'text-blue-400',
    },
    {
      title: 'PPE Monitoring',
      description: 'Automated expiry tracking with compliance alerts',
      href: '/ppe',
      icon: Shield,
      color: 'from-amber-500/20 to-orange-500/20',
      accentColor: 'text-amber-400',
    },
    {
      title: 'Maintenance',
      description: 'Schedule and track equipment maintenance tasks',
      href: '/maintenance',
      icon: Wrench,
      color: 'from-purple-500/20 to-pink-500/20',
      accentColor: 'text-purple-400',
    },
    {
      title: 'Approvals',
      description: 'Multi-level workflow management and status tracking',
      href: '/approvals',
      icon: CheckCircle2,
      color: 'from-green-500/20 to-emerald-500/20',
      accentColor: 'text-green-400',
    },
    {
      title: 'Reports',
      description: 'Advanced filtering and PDF/Excel export capabilities',
      href: '/reports',
      icon: FileText,
      color: 'from-indigo-500/20 to-blue-500/20',
      accentColor: 'text-indigo-400',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-primary/20 to-accent/20 group">
        <Image
          src="/hero-offshore.jpg"
          alt="Offshore Operations Platform"
          fill
          className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">OffshoreOps Hub</h1>
          <p className="text-lg text-foreground/80 max-w-2xl">Unified compliance management for your offshore operations</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`relative rounded-2xl border border-border/50 bg-gradient-to-br ${stat.color} p-6 backdrop-blur-md overflow-hidden group hover:border-primary/50 transition-all duration-300`}
            >
              {/* Background glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl`} />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground/70 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-foreground/50">{stat.trend}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon
            return (
              <Link key={index} href={module.href}>
                <div className={`relative h-full rounded-2xl border border-border/50 bg-gradient-to-br ${module.color} p-6 backdrop-blur-md overflow-hidden group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300`}>
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10 blur-3xl`} />
                  </div>

                  <div className="relative z-10 space-y-4 h-full flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${module.accentColor}`} />
                      </div>
                      <ArrowRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{module.title}</h3>
                      <p className="text-sm text-foreground/60">{module.description}</p>
                    </div>

                    <div className="pt-4 border-t border-border/30">
                      <span className="text-xs font-medium text-primary group-hover:text-accent transition-colors">
                        Access Module →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-12 text-base bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all">
            <Link href="/inventory?action=add" className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Add New Item
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-base hover:bg-primary/10 hover:border-primary/50 transition-all">
            <Link href="/transfers?action=new" className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Create Transfer
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-base hover:bg-primary/10 hover:border-primary/50 transition-all">
            <Link href="/reports" className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
