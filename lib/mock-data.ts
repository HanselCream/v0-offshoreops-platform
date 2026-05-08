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
  unitPrice: number
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

export interface Transfer {
  id: string
  fromLocation: string
  toLocation: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  items: { itemId: string; quantity: number }[]
  createdBy: string
  createdDate: string
  approvedBy?: string
  approvalDate?: string
  completedDate?: string
}

export interface MaintenanceTask {
  id: string
  equipmentId: string
  equipmentName: string
  type: string
  location: string
  scheduledDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  assignedTo: string
  completedDate?: string
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
    sku: 'HC-001',
    category: 'PPE',
    location: 'Main Plant',
    quantity: 245,
    minStock: 50,
    unitPrice: 25.99,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Safety Glasses',
    sku: 'SG-001',
    category: 'PPE',
    location: 'Offshore Rig A',
    quantity: 180,
    minStock: 100,
    unitPrice: 15.50,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Steel-toe Boots',
    sku: 'STB-001',
    category: 'PPE',
    location: 'Warehouse',
    quantity: 89,
    minStock: 30,
    unitPrice: 89.99,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'First Aid Kit',
    sku: 'FK-001',
    category: 'Safety Equipment',
    location: 'Port Facility',
    quantity: 23,
    minStock: 10,
    unitPrice: 49.99,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Wrench Set',
    sku: 'WS-001',
    category: 'Tools',
    location: 'Offshore Rig B',
    quantity: 12,
    minStock: 5,
    unitPrice: 129.99,
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
    fromLocation: 'Warehouse',
    toLocation: 'Main Plant',
    status: 'pending',
    items: [
      { itemId: '1', quantity: 50 },
      { itemId: '3', quantity: 20 },
    ],
    createdBy: 'John Doe',
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: '2',
    fromLocation: 'Main Plant',
    toLocation: 'Offshore Rig A',
    status: 'approved',
    items: [
      { itemId: '2', quantity: 30 },
    ],
    createdBy: 'Jane Smith',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approvedBy: 'Manager',
    approvalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: '3',
    fromLocation: 'Offshore Rig A',
    toLocation: 'Port Facility',
    status: 'completed',
    items: [
      { itemId: '4', quantity: 15 },
    ],
    createdBy: 'Mike Johnson',
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approvedBy: 'Supervisor',
    approvalDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
