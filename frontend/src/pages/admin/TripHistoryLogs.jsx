import React, { useState, useMemo } from 'react'
import { MapPin, Search, Filter, Calendar, Truck, ArrowRight, User, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

const ITEMS_PER_PAGE = 8

export default function TripHistoryLogs() {
  const { mode } = useAdmin()
  const accentColor = '#7C3AED'
  
  // Sample trip data for admin view
  const [trips, setTrips] = useState([
    { id: 'T-1001', businessName: 'Mahakal Logistics', vehicleNo: 'GJ15AB1001', route: 'Ahmedabad → Mumbai', driver: 'Rahul S.', status: 'Completed', date: '2026-04-01', amount: 45000 },
    { id: 'T-1002', businessName: 'RK Transport', vehicleNo: 'DL01BK4422', route: 'Delhi → Jaipur', driver: 'Mukesh K.', status: 'In Transit', date: '2026-04-01', amount: 18000 },
    { id: 'T-1003', businessName: 'Mahakal Logistics', vehicleNo: 'GJ15XY9988', route: 'Surat → Indore', driver: 'Suresh V.', status: 'Pending', date: '2026-03-31', amount: 22500 }
  ])

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return trips.filter(t => 
      !q || t.businessName?.toLowerCase().includes(q) || 
      t.vehicleNo?.toLowerCase().includes(q) || 
      t.route?.toLowerCase().includes(q)
    )
  }, [trips, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const getStatusColor = (s) => {
     if (s === 'Completed') return { bg: '#DCFCE7', text: '#16A34A', icon: CheckCircle2 }
     if (s === 'In Transit') return { bg: '#DBEAFE', text: '#2563EB', icon: Truck }
     return { bg: '#FEF3C7', text: '#D97706', icon: Clock }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <MapPin size={18} color={accentColor} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
               Trip Management · Logistics Oversight
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>Global Trip History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Monitor all cross-platform trips and logistics operations
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <Search className="input-icon" size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by trip route, vehicle, or business..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1) }} 
              style={{ paddingLeft: 44, height: 44 }} 
            />
          </div>
          <button className="btn btn-ghost" style={{ height: 44 }}><Filter size={18} /> Filters</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Trip ID / Date', 'Business / Logistics', 'Vehicle & Route', 'Driver', 'Status', 'Total Value'].map(h => (
                   <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(trip => {
                const colors = getStatusColor(trip.status)
                return (
                  <tr key={trip.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem' }}>{trip.id}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{trip.date}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{trip.businessName}</div>
                      <div style={{ fontSize: '0.7rem', color: accentColor, fontWeight: 700 }}>PARTNER LOGISTICS</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <Truck size={16} color="var(--text-muted)" />
                         <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{trip.vehicleNo}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                         <ArrowRight size={10} /> {trip.route}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 600 }}>{trip.driver}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99,
                        background: colors.bg, color: colors.text, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                      }}>
                        <colors.icon size={12} />
                        {trip.status}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 900, fontSize: '1rem', color: '#111' }}>
                       ₹{trip.amount.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                   <td colSpan="6" style={{ padding: '80px 24px', textAlign: 'center' }}>
                      <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3 style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>No trip records found</h3>
                      <p style={{ color: 'var(--text-muted)' }}>Trip data will appear once transporters log their route information.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Trip Logs: {filtered.length}</p>
           <div style={{ display: 'flex', gap: 8 }}>
             <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
             <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>
    </div>
  )
}
