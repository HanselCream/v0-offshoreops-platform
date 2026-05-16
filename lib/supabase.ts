import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database tables
export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  location: string
  quantity: number
  minStock: number
  maxThreshold: number
  unitPrice: number
  validityDate?: string
  maintenanceScheduleDate?: string
  status: 'ok' | 'low-stock' | 'out-of-stock' | 'expired' | 'expiring-soon'
  lastUpdated: string
  created_at?: string
  updated_at?: string
}

export interface Transfer {
  id: string
  status: 'pending' | 'pending-approval1' | 'pending-approval2' | 'completed' | 'rejected'
  category: 'tools' | 'it-equipment' | 'ppe' | 'consumable' | 'other'
  createdBy: string
  createdDate: string
  approver1?: string
  approver1Status?: 'pending' | 'approved' | 'rejected'
  approver1Date?: string
  approver2?: string
  approver2Status?: 'pending' | 'approved' | 'rejected'
  approver2Date?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface TransferItem {
  id: string
  transfer_id: string
  item_id: string
  itemName: string
  category: string
  quantity: number
  unitType: 'pcs' | 'sets' | 'boxes' | 'kg' | 'liters'
  fromLocation: string
  toLocation: string
  status: 'pending' | 'approved' | 'rejected'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  quantityReceived?: number
  discrepancy?: string
  created_at?: string
  updated_at?: string
}

export interface MaintenanceTask {
  id: string
  equipmentId: string
  equipmentName: string
  category: 'ppe' | 'equipment' | 'tools' | 'it-asset' | 'other'
  location: string
  scheduledDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  assignedTo: string
  completedDate?: string
  releaseDate?: string
  expiryDate?: string
  ppeStatus?: 'valid' | 'expiring-soon' | 'expired'
  maintenanceInterval?: number
  lastMaintainedDate?: string
  nextDueDate?: string
  locationLocked?: boolean
  warrantyDate?: string
  assetTag?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Approval {
  id: string
  transferId: string
  requestType: 'transfer' | 'maintenance' | 'equipment'
  status: 'pending' | 'approved' | 'rejected'
  approverLevel: 1 | 2
  approverId: string
  approverName: string
  submittedBy: string
  submittedDate: string
  approvedDate?: string
  rejectionReason?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface Location {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface UserRole {
  id: string
  userId: string
  name: string
  role: 'admin' | 'approver_level_1' | 'approver_level_2' | 'operator' | 'viewer'
  created_at?: string
  updated_at?: string
}

// API functions for Inventory
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inventory items:', error)
    throw error
  }
  return data || []
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .insert([{ ...item, lastUpdated: new Date().toISOString() }])
    .select()
    .single()

  if (error) {
    console.error('Error creating inventory item:', error)
    throw error
  }
  return data
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .update({ ...updates, lastUpdated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating inventory item:', error)
    throw error
  }
  return data
}

// API functions for Transfers
export async function fetchTransfers(): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transfers:', error)
    throw error
  }
  return data || []
}

export async function fetchTransferDetails(transferId: string): Promise<{ transfer: Transfer; items: TransferItem[] }> {
  const [transferRes, itemsRes] = await Promise.all([
    supabase.from('transfers').select('*').eq('id', transferId).single(),
    supabase.from('transfer_line_items').select('*').eq('transfer_id', transferId),
  ])

  if (transferRes.error) throw transferRes.error
  if (itemsRes.error) throw itemsRes.error

  return { transfer: transferRes.data, items: itemsRes.data || [] }
}

export async function createTransfer(transfer: Omit<Transfer, 'id'>, items: Omit<TransferItem, 'id' | 'transfer_id'>[]): Promise<Transfer> {
  const { data: transferData, error: transferError } = await supabase
    .from('transfers')
    .insert([transfer])
    .select()
    .single()

  if (transferError) throw transferError

  // Insert transfer items
  const itemsToInsert = items.map((item) => ({ ...item, transfer_id: transferData.id }))
  const { error: itemsError } = await supabase.from('transfer_line_items').insert(itemsToInsert)

  if (itemsError) throw itemsError

  return transferData
}

export async function updateTransferStatus(transferId: string, updates: Partial<Transfer>): Promise<Transfer> {
  const { data, error } = await supabase
    .from('transfers')
    .update(updates)
    .eq('id', transferId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function approveTransferLine(itemId: string, approverLevel: 1 | 2, approverId: string): Promise<TransferItem> {
  const { data, error } = await supabase
    .from('transfer_line_items')
    .update({ [`approver${approverLevel}Status`]: 'approved' })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function rejectTransferLine(itemId: string, reason: string): Promise<TransferItem> {
  const { data, error } = await supabase
    .from('transfer_line_items')
    .update({ approvalStatus: 'rejected', rejectionReason: reason })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

// API functions for Maintenance
export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
  const { data, error } = await supabase
    .from('maintenance')
    .select('*')
    .order('scheduled_date', { ascending: true })

  if (error) {
    console.error('Error fetching maintenance tasks:', error)
    throw error
  }
  return data || []
}

export async function createMaintenanceTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
  const { data, error } = await supabase
    .from('maintenance')
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  const { data, error } = await supabase
    .from('maintenance')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// API functions for Approvals
export async function fetchApprovals(approverId?: string): Promise<Approval[]> {
  let query = supabase.from('approvals').select('*')

  if (approverId) {
    query = query.eq('approver_id', approverId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function approveRequest(approvalId: string, approverId: string): Promise<Approval> {
  const { data, error } = await supabase
    .from('approvals')
    .update({ status: 'approved', approval_date: new Date().toISOString() })
    .eq('id', approvalId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function rejectRequest(approvalId: string, reason: string): Promise<Approval> {
  const { data, error } = await supabase
    .from('approvals')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', approvalId)
    .select()
    .single()

  if (error) throw error
  return data
}

// API functions for Categories and Locations
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*')

  if (error) throw error
  return data || []
}

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from('locations').select('*')

  if (error) throw error
  return data || []
}

// lib/supabase.ts
export async function fetchUserRoles(): Promise<UserRole[]> {
  const { data, error } = await supabase.from('user_roles').select('*')

  if (error) {
    console.warn('user_roles fetch failed (check RLS):', error)
    return []   // ← return empty instead of throwing
  }
  return data || []
}
