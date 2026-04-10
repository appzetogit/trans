import { useNavigate } from 'react-router-dom'
import { Wrench, Plus, ArrowRight } from 'lucide-react'

const SERVICE_CATS = [
  { label: 'Oil Service',    emoji: '🛢️',  color: '#D97706', bg: '#FEF3C7' },
  { label: 'Tyre Change',    emoji: '🔄',  color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Brake Service',  emoji: '🛑',  color: '#DC2626', bg: '#FEE2E2' },
  { label: 'Battery',        emoji: '🔋',  color: '#2563EB', bg: '#DBEAFE' },
  { label: 'AC Service',     emoji: '❄️',  color: '#0891B2', bg: '#E0F2FE' },
  { label: 'General Repair', emoji: '🔧',  color: '#16A34A', bg: '#DCFCE7' },
  { label: 'Spare Parts',    emoji: '⚙️',  color: '#6B7280', bg: '#F3F4F6' },
  { label: 'Custom',         emoji: '✏️',  color: '#9333EA', bg: '#F3E8FF' },
]

export default function GarageServices() {
  const navigate = useNavigate()

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', marginBottom: 2 }}>Services</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Manage vehicle services</p>
        </div>
        <button id="btn-add-service" className="btn btn-primary btn-sm" onClick={() => navigate('/bills/new')}>
          <Plus size={16} /> New Service Bill
        </button>
      </div>

      {/* Service category quick select */}
      <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16, border: '1px solid rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', marginBottom: 14 }}>Service Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {SERVICE_CATS.map(cat => (
            <button
              key={cat.label}
              id={`btn-service-${cat.label.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => navigate('/bills/new')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 6px', borderRadius: 14,
                background: cat.bg, border: 'none', cursor: 'pointer',
                transition: 'transform 0.15s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <span style={{ fontSize: '1.375rem' }}>{cat.emoji}</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: cat.color, textAlign: 'center', lineHeight: 1.2 }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent services empty state */}
      <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E' }}>Recent Services</h3>
          <button onClick={() => navigate('/bills')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            All Bills <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '28px 16px', background: '#FAFAFA', borderRadius: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Wrench size={22} color="#7C3AED" />
          </div>
          <p style={{ fontWeight: 600, color: '#0F0D2E', marginBottom: 4 }}>No services yet</p>
          <p style={{ fontSize: '0.8125rem', color: '#6B7280' }}>Service bills will appear here once added</p>
        </div>
      </div>
    </div>
  )
}
