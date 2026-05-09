import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  try {
    console.log('Seeding locations...')
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('id')
      .limit(1)

    if (!locError && locations?.length === 0) {
      const { error } = await supabase.from('locations').insert([
        { name: 'Platform A', region: 'North Sea' },
        { name: 'Platform B', region: 'Gulf of Mexico' },
        { name: 'Onshore Facility', region: 'Texas' },
        { name: 'Processing Plant', region: 'Louisiana' },
        { name: 'Storage Depot', region: 'Middle East' },
      ])

      if (error) throw error
      console.log('✓ Locations seeded')
    }

    console.log('Seeding categories...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .limit(1)

    if (!catError && categories?.length === 0) {
      const { error } = await supabase.from('categories').insert([
        { name: 'Safety Equipment', description: 'PPE and safety gear' },
        { name: 'Spare Parts', description: 'Equipment spare parts' },
        { name: 'Tools', description: 'Hand and power tools' },
        { name: 'Materials', description: 'Raw materials and supplies' },
        { name: 'Electronics', description: 'Electronic components' },
      ])

      if (error) throw error
      console.log('✓ Categories seeded')
    }

    console.log('✓ Seed data complete!')
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
