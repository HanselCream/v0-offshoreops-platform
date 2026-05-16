// Mock data for all modules - Replace with real Supabase data when integrated

export interface Location {
  id: string
  name: string
  code: string
}

export interface Category {
  id: string
  name: string
}

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
  status: 'ok' | 'low-stock' | 'out-of-stock'
  lastUpdated: string
}

export interface PPEItem {
  id: string
  name: string
  type: string
  location: string
  quantity: number
  expiryDate: string
  status: 'active' | 'expiring-soon' | 'expired'
  lastUpdated: string
}

export interface TransferLineItem {
  id: string
  itemId: string
  itemName: string
  category: string
  quantity: number
  unitType: 'pcs' | 'sets' | 'boxes' | 'kg' | 'liters'
  fromLocation: string
  toLocation: string
  stockByLocation: { [location: string]: number }
  status: 'pending' | 'approved' | 'rejected'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  quantityReceived?: number
  discrepancy?: string
}

export interface Transfer {
  id: string
  status: 'pending' | 'pending-approval1' | 'pending-approval2' | 'completed' | 'rejected'
  lineItems: TransferLineItem[]
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
  chainOfCustody?: Array<{
    timestamp: string
    action: string
    user: string
    location: string
  }>
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
  // PPE fields
  releaseDate?: string
  expiryDate?: string
  ppeStatus?: 'valid' | 'expiring-soon' | 'expired'
  // Equipment fields
  maintenanceInterval?: number
  lastMaintainedDate?: string
  nextDueDate?: string
  // Tools fields
  locationLocked?: boolean
  // IT Asset fields
  warrantyDate?: string
  assetTag?: string
  // Other fields
  notes?: string
}

export interface Approval {
  id: string
  type: 'transfer' | 'ppe-disposal' | 'maintenance'
  requestId: string
  status: 'pending' | 'approved' | 'rejected'
  requestedBy: string
  requestedDate: string
  approverLevel: number
  approvedBy?: string
  approvalDate?: string
  notes?: string
}

// Locations
export const locations: Location[] = [
  { id: '1', name: 'Main Plant', code: 'MP' },
  { id: '2', name: 'Offshore Rig A', code: 'ORA' },
  { id: '3', name: 'Offshore Rig B', code: 'ORB' },
  { id: '4', name: 'Port Facility', code: 'PF' },
  { id: '5', name: 'Warehouse', code: 'WH' },
]

// Categories
export const categories: Category[] = [
  { id: '1', name: 'Safety Equipment' },
  { id: '2', name: 'Tools' },
  { id: '3', name: 'Parts & Supplies' },
  { id: '4', name: 'PPE' },
  { id: '5', name: 'Documentation' },
]

// Inventory Items
export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Hard Hat - Yellow',
    sku: 'PPE-001',
    category: 'PPE',
    location: 'Main Plant',
    quantity: 245,
    minStock: 50,
    maxThreshold: 500,
    unitPrice: 25.99,
    validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maintenanceScheduleDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ok',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Safety Glasses',
    sku: 'PPE-002',
    category: 'PPE',
    location: 'Offshore Rig A',
    quantity: 180,
    minStock: 100,
    maxThreshold: 400,
    unitPrice: 15.50,
    validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maintenanceScheduleDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ok',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Steel-toe Boots',
    sku: 'PPE-003',
    category: 'PPE',
    location: 'Warehouse',
    quantity: 89,
    minStock: 30,
    maxThreshold: 200,
    unitPrice: 89.99,
    validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maintenanceScheduleDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ok',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'First Aid Kit',
    sku: 'SAFETY-001',
    category: 'Safety Equipment',
    location: 'Port Facility',
    quantity: 23,
    minStock: 10,
    maxThreshold: 50,
    unitPrice: 49.99,
    validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maintenanceScheduleDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ok',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Wrench Set',
    sku: 'TOOLS-001',
    category: 'Tools',
    location: 'Offshore Rig B',
    quantity: 12,
    minStock: 5,
    maxThreshold: 25,
    unitPrice: 129.99,
    validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maintenanceScheduleDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'low-stock',
    lastUpdated: new Date().toISOString(),
  },
]

// PPE Items
export const ppeItems: PPEItem[] = [
  {
    id: '1',
    name: 'Hard Hat - Red',
    type: 'Head Protection',
    location: 'Main Plant',
    quantity: 50,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Life Jacket',
    type: 'Life Safety',
    location: 'Offshore Rig A',
    quantity: 100,
    expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'expiring-soon',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Gas Detector',
    type: 'Detection Equipment',
    location: 'Offshore Rig B',
    quantity: 15,
    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'expired',
    lastUpdated: new Date().toISOString(),
  },
]

// Transfers
export const transfers: Transfer[] = [
  {
    id: '1',
    status: 'pending-approval1',
    lineItems: [
      {
        id: 'li-1',
        itemId: '1',
        itemName: 'Hard Hat - Yellow',
        category: 'PPE',
        quantity: 50,
        unitType: 'pcs',
        fromLocation: 'Warehouse',
        toLocation: 'Main Plant',
        stockByLocation: { 'Warehouse': 245, 'Main Plant': 120, 'Offshore Rig A': 0 },
        status: 'pending',
        approvalStatus: 'pending',
      },
      {
        id: 'li-2',
        itemId: '3',
        itemName: 'Steel-toe Boots',
        category: 'PPE',
        quantity: 20,
        unitType: 'pcs',
        fromLocation: 'Warehouse',
        toLocation: 'Main Plant',
        stockByLocation: { 'Warehouse': 89, 'Main Plant': 45, 'Offshore Rig A': 0 },
        status: 'pending',
        approvalStatus: 'pending',
      },
    ],
    category: 'ppe',
    createdBy: 'John Doe',
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approver1: 'Manager A',
    approver1Status: 'pending',
    approver2: 'Receiving Officer A',
    approver2Status: 'pending',
  },
  {
    id: '2',
    status: 'pending-approval2',
    lineItems: [
      {
        id: 'li-3',
        itemId: '2',
        itemName: 'Safety Glasses',
        category: 'PPE',
        quantity: 30,
        unitType: 'sets',
        fromLocation: 'Main Plant',
        toLocation: 'Offshore Rig A',
        stockByLocation: { 'Main Plant': 180, 'Offshore Rig A': 45, 'Warehouse': 0 },
        status: 'approved',
        approvalStatus: 'approved',
        quantityReceived: 30,
      },
    ],
    category: 'ppe',
    createdBy: 'Jane Smith',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approver1: 'Manager A',
    approver1Status: 'approved',
    approver1Date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approver2: 'Receiving Officer A',
    approver2Status: 'pending',
  },
  {
    id: '3',
    status: 'completed',
    lineItems: [
      {
        id: 'li-4',
        itemId: '4',
        itemName: 'First Aid Kit',
        category: 'Safety Equipment',
        quantity: 15,
        unitType: 'boxes',
        fromLocation: 'Offshore Rig A',
        toLocation: 'Port Facility',
        stockByLocation: { 'Offshore Rig A': 23, 'Port Facility': 12, 'Warehouse': 0 },
        status: 'approved',
        approvalStatus: 'approved',
        quantityReceived: 15,
        discrepancy: 'All items received in good condition',
      },
    ],
    category: 'consumable',
    createdBy: 'Mike Johnson',
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approver1: 'Supervisor',
    approver1Status: 'approved',
    approver1Date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approver2: 'Receiving Officer B',
    approver2Status: 'approved',
    approver2Date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
]

// Maintenance Tasks
export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: '1',
    equipmentId: '5',
    equipmentName: 'Pump A-01',
    type: 'Preventive Maintenance',
    location: 'Main Plant',
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    assignedTo: 'Tom Brown',
  },
  {
    id: '2',
    equipmentId: '6',
    equipmentName: 'Compressor B-02',
    type: 'Corrective Maintenance',
    location: 'Offshore Rig A',
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'overdue',
    assignedTo: 'Sarah Wilson',
  },
  {
    id: '3',
    equipmentId: '7',
    equipmentName: 'Generator C-03',
    type: 'Routine Inspection',
    location: 'Port Facility',
    scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    assignedTo: 'Robert Davis',
    completedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
]

// Approvals
export const approvals: Approval[] = [
  {
    id: '1',
    type: 'transfer',
    requestId: '1',
    status: 'pending',
    requestedBy: 'John Doe',
    requestedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approverLevel: 1,
  },
  {
    id: '2',
    type: 'ppe-disposal',
    requestId: '3',
    status: 'approved',
    requestedBy: 'Jane Smith',
    requestedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approverLevel: 1,
    approvedBy: 'Manager',
    approvalDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: '3',
    type: 'maintenance',
    requestId: '2',
    status: 'pending',
    requestedBy: 'Mike Johnson',
    requestedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approverLevel: 2,
  },
]
