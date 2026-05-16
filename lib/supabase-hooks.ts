import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useLocations() {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLocations = async () => {
      const { data } = await supabase.from('locations').select('*')
      if (data) setLocations(data)
      setLoading(false)
    }
    loadLocations()
  }, [])

  return { locations, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
      setLoading(false)
    }
    loadCategories()
  }, [])

  return { categories, loading }
}

export function useInventoryItems() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('inventory_items').select('*')
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  return { items, loading, refresh: loadItems }
}

export function useTransfers() {
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadTransfers = async () => {
    setLoading(true)
    const { data } = await supabase.from('transfers').select('*')
    if (data) setTransfers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadTransfers()
  }, [])

  return { transfers, loading, refresh: loadTransfers }
}

export function usePPEItems() {
  const [ppeItems, setPPEItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPPE = async () => {
    setLoading(true)
    const { data } = await supabase.from('ppe_items').select('*')
    if (data) setPPEItems(data)
    setLoading(false)
  }

  useEffect(() => {
    loadPPE()
  }, [])

  return { ppeItems, loading, refresh: loadPPE }
}

export function useMaintenanceTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = async () => {
    setLoading(true)
    const { data } = await supabase.from('maintenance_tasks').select('*')
    if (data) setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return { tasks, loading, refresh: loadTasks }
}

export function useApprovals() {
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadApprovals = async () => {
    setLoading(true)
    const { data } = await supabase.from('approvals').select('*')
    if (data) setApprovals(data)
    setLoading(false)
  }

  useEffect(() => {
    loadApprovals()
  }, [])

  return { approvals, loading, refresh: loadApprovals }
}
