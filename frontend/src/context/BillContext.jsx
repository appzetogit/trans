import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import dayjs from 'dayjs'

const BillContext = createContext(null)

const uid = () => `bill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

// Auto-generate invoice number like BP250001
const generateInvoiceNo = (existing = []) => {
  const prefix = 'BP'
  const ym = dayjs().format('YYMM')
  const fullPrefix = `${prefix}${ym}`
  
  // Filter for bills from the current month and extract their numeric counter
  const counters = existing
    .filter(b => b.invoiceNo?.startsWith(fullPrefix))
    .map(b => {
      const counterStr = b.invoiceNo.slice(fullPrefix.length)
      // Ignore corrupted numbers (too long or scientific notation)
      if (counterStr.length > 6 || counterStr.includes('.') || counterStr.includes('e')) return 0
      return parseInt(counterStr) || 0
    })
    .filter(Boolean)

  const next = counters.length ? Math.max(...counters) + 1 : 1
  return `${fullPrefix}${String(next).padStart(3, '0')}`
}

export function BillProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user ? `bills_${user.id}` : null

  const [bills, setBills]   = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setBills(JSON.parse(saved))
    } catch (_) {}
    setLoaded(true)
  }, [storageKey])

  const persist = useCallback((list) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(list))
  }, [storageKey])

  const addBill = useCallback((data) => {
    const newBill = {
      id: uid(),
      invoiceNo: generateInvoiceNo(bills),
      createdAt: new Date().toISOString(),
      status: data.paymentMode === 'paid' ? 'paid' : 'unpaid',
      ...data,
    }
    setBills(prev => {
      const next = [newBill, ...prev]
      persist(next)
      return next
    })
    return newBill
  }, [bills, persist])

  const updateBill = useCallback((id, data) => {
    setBills(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b)
      persist(next)
      return next
    })
  }, [persist])

  const deleteBill = useCallback((id) => {
    setBills(prev => {
      const next = prev.filter(b => b.id !== id)
      persist(next)
      return next
    })
  }, [persist])

  const getBill = useCallback((id) => bills.find(b => b.id === id), [bills])

  const recordPayment = useCallback((billId, amount) => {
    setBills(prev => {
      const next = prev.map(b => {
        if (b.id !== billId) return b
        const currentPaid = parseFloat(b.paidAmount || 0) + parseFloat(amount)
        const total = parseFloat(b.grandTotal || 0)
        let status = 'unpaid'
        if (currentPaid >= total) status = 'paid'
        else if (currentPaid > 0) status = 'partial'
        
        return { ...b, paidAmount: currentPaid, status, updatedAt: new Date().toISOString() }
      })
      persist(next)
      return next
    })
  }, [persist])

  return (
    <BillContext.Provider value={{ bills, loaded, addBill, updateBill, deleteBill, getBill, recordPayment }}>
      {children}
    </BillContext.Provider>
  )
}

export function useBills() {
  const ctx = useContext(BillContext)
  if (!ctx) throw new Error('useBills must be inside <BillProvider>')
  return ctx
}
