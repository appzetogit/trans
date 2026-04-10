import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const VehicleContext = createContext(null)
const uid = () => `vehicle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export function VehicleProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user ? `vehicles_${user.id}` : null

  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setVehicles(JSON.parse(saved))
    } catch (_) {}
  }, [storageKey])

  const persist = useCallback((list) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(list))
  }, [storageKey])

  const addVehicle = useCallback((data) => {
    const v = { id: uid(), ...data, createdAt: new Date().toISOString() }
    setVehicles(prev => { const n = [v, ...prev]; persist(n); return n })
    return v
  }, [persist])

  const updateVehicle = useCallback((id, data) => {
    setVehicles(prev => { const n = prev.map(v => v.id === id ? { ...v, ...data } : v); persist(n); return n })
  }, [persist])

  const deleteVehicle = useCallback((id) => {
    setVehicles(prev => { const n = prev.filter(v => v.id !== id); persist(n); return n })
  }, [persist])

  return (
    <VehicleContext.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicles() {
  const ctx = useContext(VehicleContext)
  if (!ctx) throw new Error('useVehicles must be inside <VehicleProvider>')
  return ctx
}
