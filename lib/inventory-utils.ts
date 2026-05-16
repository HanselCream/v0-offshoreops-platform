import { type InventoryItem, type MaintenanceTask } from '@/lib/supabase'

export type ItemStatus = 'ok' | 'low-stock' | 'out-of-stock' | 'expiring-soon' | 'expired'
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'due-soon' | 'due'

/**
 * Calculate inventory item status based on quantity and validity/maintenance dates
 */
export function calculateInventoryStatus(item: InventoryItem): ItemStatus {
  const today = new Date().toISOString().split('T')[0]

  // Check if validity date has passed
  if (item.validityDate && item.validityDate < today) {
    return 'expired'
  }

  // Check if validity date is within 30 days
  if (item.validityDate) {
    const validityDate = new Date(item.validityDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    if (validityDate < thirtyDaysFromNow && validityDate >= new Date(today)) {
      return 'expiring-soon'
    }
  }

  // Check stock levels
  if (item.quantity === 0) {
    return 'out-of-stock'
  }
  if (item.quantity <= item.minStock) {
    return 'low-stock'
  }

  return 'ok'
}

/**
 * Get all items that need maintenance based on schedule date
 */
export function getItemsDueMaintenance(items: InventoryItem[]): InventoryItem[] {
  const today = new Date().toISOString().split('T')[0]
  return items.filter((item) => item.maintenanceScheduleDate && item.maintenanceScheduleDate <= today)
}

/**
 * Get all expired items
 */
export function getExpiredItems(items: InventoryItem[]): InventoryItem[] {
  const today = new Date().toISOString().split('T')[0]
  return items.filter((item) => item.validityDate && item.validityDate < today)
}

/**
 * Get all items expiring soon (within 30 days)
 */
export function getExpiringItems(items: InventoryItem[]): InventoryItem[] {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  return items.filter((item) => {
    if (!item.validityDate) return false
    const validityDate = new Date(item.validityDate)
    return validityDate <= thirtyDaysFromNow && validityDate >= new Date(today)
  })
}

/**
 * Convert inventory item to maintenance task
 */
export function createMaintenanceFromInventory(item: InventoryItem, reason: 'expired' | 'due-maintenance'): MaintenanceTask {
  const today = new Date().toISOString().split('T')[0]

  return {
    id: `maint-${item.id}-${Date.now()}`,
    equipmentId: item.id,
    equipmentName: item.name,
    category: 'ppe',
    location: item.location,
    scheduledDate: today,
status: reason === 'expired' ? 'overdue' : 'pending',
    assignedTo: 'Unassigned',
    expiryDate: item.validityDate,
    ppeStatus: reason === 'expired' ? 'expired' : 'valid',
    notes: `Auto-generated: Item ${reason === 'expired' ? 'has expired' : 'maintenance due'} - SKU: ${item.sku}`,
  }
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Check if date has passed
 */
export function hasDatePassed(dateString: string | undefined): boolean {
  if (!dateString) return false
  const today = new Date().toISOString().split('T')[0]
  return dateString < today
}

/**
 * Get days until date
 */
export function daysUntilDate(dateString: string | undefined): number | null {
  if (!dateString) return null
  const today = new Date()
  const targetDate = new Date(dateString)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: ItemStatus | MaintenanceStatus): string {
  const colorMap: Record<string, string> = {
    'ok': 'bg-green-100 text-green-800',
    'low-stock': 'bg-yellow-100 text-yellow-800',
    'out-of-stock': 'bg-red-100 text-red-800',
    'expiring-soon': 'bg-yellow-100 text-yellow-800',
    'expired': 'bg-red-100 text-red-800',
    'pending': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'due-soon': 'bg-yellow-100 text-yellow-800',
    'due': 'bg-orange-100 text-orange-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}
