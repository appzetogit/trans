import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const FinanceContext = createContext(null)

const uid = () => `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

export function FinanceProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user ? `finance_${user.id}` : null

  const [transactions, setTransactions] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setTransactions(JSON.parse(saved))
    } catch (_) {}
    setLoaded(true)
  }, [storageKey])

  const persist = useCallback((list) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(list))
    }
  }, [storageKey])

  const addTransaction = useCallback((data) => {
    const newTx = {
      id: uid(),
      createdAt: new Date().toISOString(),
      date: data.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(data.amount || 0),
      type: data.type || 'income', // income (receive) or expense (pay)
      partyId: data.partyId || null,
      billId: data.billId || null,
      paymentMode: data.paymentMode || 'cash',
      category: data.category || 'general',
      notes: data.notes || '',
    }
    setTransactions(prev => {
      const next = [newTx, ...prev]
      persist(next)
      return next
    })
    return newTx
  }, [persist])

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => {
      const next = prev.filter(tx => tx.id !== id)
      persist(next)
      return next
    })
  }, [persist])

  return (
    <FinanceContext.Provider value={{ transactions, loaded, addTransaction, deleteTransaction }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be inside <FinanceProvider>')
  return ctx
}
