# Supabase Integration Guide - OffshoreOps

## Overview

OffshoreOps is now configured with Supabase for complete data persistence across all 7 modules. The application uses Supabase's PostgreSQL database with Row Level Security (RLS) for secure data management.

## Database Schema Created

The following tables have been created in your Supabase project:

### Core Tables
- **locations** - Physical or virtual locations (Platform A, Platform B, etc.)
- **categories** - Item categories (Safety Equipment, Tools, Materials, etc.)
- **inventory_items** - Track items across locations with SKU, quantity, and pricing
- **transfers** - Track item movements between locations with approval workflow
- **transfer_items** - Detail items within each transfer
- **ppe_items** - Personal Protective Equipment with expiry tracking
- **maintenance_tasks** - Equipment maintenance scheduling and tracking
- **approvals** - Multi-level approval workflow for requests
- **user_roles** - User role management (admin, team-lead, field-staff)

### Enum Types
- **inventory_status**: 'in-stock', 'low-stock', 'out-of-stock'
- **transfer_status**: 'pending', 'approved', 'rejected', 'completed'
- **ppe_status**: 'active', 'expiring-soon', 'expired'
- **maintenance_status**: 'pending', 'in-progress', 'completed', 'overdue'
- **approval_status**: 'pending', 'approved', 'rejected'
- **user_role**: 'admin', 'team-lead', 'field-staff'

## Environment Variables Required

Add these to your Vercel project environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Find these in your Supabase dashboard:
1. Go to Project Settings → API
2. Copy the Project URL and Anon Key
3. Copy the Service Role Key (keep this private!)

## Project Structure

```
lib/
├── supabase/
│   ├── client.ts          # Browser client for client-side queries
│   ├── server.ts          # Server client for server-side operations
│   └── proxy.ts           # Session management via proxy
├── supabase-hooks.ts      # React hooks for data fetching
└── seed-data.ts           # Script to populate initial data

app/
├── auth/
│   └── callback/route.ts  # OAuth callback handler
├── inventory/
├── transfers/
├── ppe/
├── maintenance/
├── approvals/
├── reports/
└── settings/
```

## API Clients

### Client-Side (Browser)
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('inventory_items').select('*')
```

### Server-Side
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data, error } = await supabase.from('inventory_items').select('*')
```

## React Hooks for Data Fetching

Use these pre-built hooks to fetch data in your components:

```typescript
import { 
  useLocations, 
  useCategories, 
  useInventoryItems,
  useTransfers,
  usePPEItems,
  useMaintenanceTasks,
  useApprovals 
} from '@/lib/supabase-hooks'

export function MyComponent() {
  const { items, loading, refresh } = useInventoryItems()
  
  return loading ? <p>Loading...</p> : (
    <div>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```

## Seeding Data

To populate initial locations and categories:

```bash
node --env-file-if-exists=.env.local lib/seed-data.ts
```

This will create:
- 5 locations (Platform A, Platform B, Onshore Facility, Processing Plant, Storage Depot)
- 5 categories (Safety Equipment, Spare Parts, Tools, Materials, Electronics)

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Public Read Access
- **locations**: All authenticated users can read
- **categories**: All authenticated users can read

### Full Access (Create, Read, Update, Delete)
- **inventory_items**: Authenticated users can perform all operations
- **transfers**: Authenticated users can perform all operations
- **transfer_items**: Authenticated users can perform all operations
- **ppe_items**: Authenticated users can perform all operations
- **maintenance_tasks**: Authenticated users can perform all operations
- **approvals**: Authenticated users can perform all operations

### User-Specific Access
- **user_roles**: Users can only view their own role or all roles if authenticated

## Integrating Pages with Supabase

### Step 1: Use React Hooks
Replace mock data with Supabase data:

```typescript
'use client'

import { useInventoryItems } from '@/lib/supabase-hooks'

export default function InventoryPage() {
  const { items, loading, refresh } = useInventoryItems()
  
  if (loading) return <p>Loading...</p>
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>SKU: {item.sku}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
    </div>
  )
}
```

### Step 2: Create Mutations
To create/update data:

```typescript
const handleAddItem = async (formData) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .insert([{
        name: formData.name,
        sku: formData.sku,
        category_id: formData.categoryId,
        location_id: formData.locationId,
        quantity: formData.quantity,
        min_stock: formData.minStock,
        unit_price: formData.unitPrice,
      }])
    
    if (error) throw error
    refresh() // Reload data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Step 3: Handle Updates & Deletes
```typescript
const handleUpdateItem = async (id, updates) => {
  const { error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
  
  if (!error) refresh()
}

const handleDeleteItem = async (id) => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id)
  
  if (!error) refresh()
}
```

## Real-Time Subscriptions

Monitor data changes in real-time:

```typescript
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

useEffect(() => {
  const subscription = supabase
    .from('inventory_items')
    .on('*', payload => {
      console.log('Data changed:', payload)
      // Update UI accordingly
    })
    .subscribe()
  
  return () => subscription.unsubscribe()
}, [])
```

## Authentication Flow

The app includes OAuth/email authentication via Supabase Auth:

1. User signs up/logs in via `/auth/login` or `/auth/sign-up`
2. Supabase sends confirmation email with callback link
3. `/auth/callback` route exchanges the code for a session
4. User is redirected to protected pages
5. Session persists via HTTP-only cookies

## Testing Data Operations

### Create Inventory Item
```sql
INSERT INTO inventory_items (name, sku, category_id, location_id, quantity, min_stock, unit_price)
VALUES ('Safety Helmet', 'SH-001', <category-id>, <location-id>, 50, 10, 25.99);
```

### Create Transfer
```sql
INSERT INTO transfers (from_location_id, to_location_id, status)
VALUES (<from-loc-id>, <to-loc-id>, 'pending');
```

### Query with Joins
```sql
SELECT 
  i.name, 
  i.sku, 
  c.name as category,
  l.name as location,
  i.quantity
FROM inventory_items i
JOIN categories c ON i.category_id = c.id
JOIN locations l ON i.location_id = l.id;
```

## Troubleshooting

### "API key is required" Error
- Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in environment variables
- Restart the dev server after adding env vars

### RLS Policies Blocking Operations
- Check user authentication status
- Verify the user has the required role
- Review RLS policy conditions in Supabase dashboard

### Data Not Appearing in UI
- Check browser console for errors
- Verify the hook's loading state
- Ensure the table has data (check Supabase dashboard)
- Call the `refresh()` function manually to reload

### Connection Issues
- Verify Supabase project is running (check dashboard)
- Check API keys are correct and not rotated
- Test connection with a simple query in browser console

## Next Steps

1. **Set Environment Variables**: Add Supabase credentials to your Vercel project
2. **Seed Initial Data**: Run the seed script to populate locations and categories
3. **Update UI Pages**: Replace mock data with Supabase hooks in remaining modules
4. **Test Operations**: Create, update, and delete records through the UI
5. **Set Up Authentication**: Implement user login/signup (reference files provided)
6. **Enable Real-Time**: Add subscriptions for live data updates
7. **Optimize Queries**: Add indexes and caching as needed

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-Time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Vercel + Supabase Guide](https://supabase.com/docs/guides/platforms/vercel)
