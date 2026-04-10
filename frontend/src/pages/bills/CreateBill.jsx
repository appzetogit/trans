import { useAuth } from '../../context/AuthContext'
import TransportBill from './TransportBill'
import GarageBill   from './GarageBill'
import { useNavigate } from 'react-router-dom'
import { Truck, Wrench } from 'lucide-react'
import { useState } from 'react'

export default function CreateBill() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const role = user?.role

  // Admin — Block access (redirect)
  if (role === 'admin') {
    navigate('/admin/dashboard')
    return null
  }

  // Common roles — render directly
  if (role === 'transport') return <TransportBill />
  if (role === 'garage')    return <GarageBill />

  // Admin or no role — show picker
  const [picked, setPicked] = useState(null)
  if (picked === 'transport') return <TransportBill />
  if (picked === 'garage')    return <GarageBill />

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 6, color: '#0F0D2E' }}>New Bill</h2>
      <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 24 }}>Select the type of bill to create</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { type: 'transport', icon: Truck,  label: 'Transport Bill', sub: 'Freight / LR', bg: '#FEF3C7', color: '#D97706' },
          { type: 'garage',    icon: Wrench, label: 'Garage Bill',    sub: 'Service Invoice', bg: '#EDE9FE', color: '#7C3AED' },
        ].map(opt => (
          <button key={opt.type} id={`btn-create-${opt.type}`} onClick={() => setPicked(opt.type)}
            style={{
              background: 'white', border: '2px solid transparent', borderRadius: 20,
              padding: '28px 20px', cursor: 'pointer', textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <opt.icon size={26} color={opt.color} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
