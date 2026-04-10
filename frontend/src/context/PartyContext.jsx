import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const PartyContext = createContext(null)

// Generate simple unique IDs
const uid = () => `party_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export function PartyProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user ? `parties_${user.id}` : null

  const [parties, setParties] = useState([])
  const [loaded, setLoaded]   = useState(false)

  // Hydrate from localStorage when user available
  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setParties(JSON.parse(saved))
    } catch (_) {}
    setLoaded(true)
  }, [storageKey])

  // Persist on every change
  const persist = useCallback((list) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(list))
  }, [storageKey])

  // ── CRUD ─────────────────────────────────────────────
  const addParty = useCallback((data) => {
    const newParty = {
      id: uid(),
      ...data,
      balance: 0,
      totalBills: 0,
      createdAt: new Date().toISOString(),
    }
    setParties(prev => {
      const next = [newParty, ...prev]
      persist(next)
      return next
    })
    return newParty
  }, [persist])

  const updateParty = useCallback((id, data) => {
    setParties(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
      persist(next)
      return next
    })
  }, [persist])

  const deleteParty = useCallback((id) => {
    setParties(prev => {
      const next = prev.filter(p => p.id !== id)
      persist(next)
      return next
    })
  }, [persist])

  const getParty = useCallback((id) => parties.find(p => p.id === id), [parties])

  return (
    <PartyContext.Provider value={{ parties, loaded, addParty, updateParty, deleteParty, getParty }}>
      {children}
    </PartyContext.Provider>
  )
}

export function useParties() {
  const ctx = useContext(PartyContext)
  if (!ctx) throw new Error('useParties must be inside <PartyProvider>')
  return ctx
}
