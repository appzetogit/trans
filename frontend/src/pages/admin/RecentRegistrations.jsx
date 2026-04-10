import React, { useMemo } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Building2, User, Phone, MapPin, Calendar, ExternalLink } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export default function RecentRegistrations() {
  const { businesses, mode } = useAdmin()
  const navigate = useNavigate()
  const isTransport = mode === 'transport'

  // Sort and filter for transport only if needed, but Context already handles mode-based separation.
  // We'll show latest 15 registrations sorted by date
  const recentList = useMemo(() => {
    return [...businesses]
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
      .slice(0, 15)
  }, [businesses])

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          style={{ 
            width: 40, height: 40, borderRadius: 12, border: 'none', 
            background: 'white', color: '#111', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Recent Registrations
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
             Tracking latest {isTransport ? 'Transporter' : 'Garage'} registrations
          </p>
        </div>
      </div>

      {/* Summary Chips */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
         <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: 14, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} color="#7C3AED" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Total Registered: {businesses.length}</span>
         </div>
      </div>

      {/* Data Table */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Business Details</th>
              <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Owner / Contact</th>
              <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Registration Date</th>
              <th style={{ padding: '18px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentList.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
                  <Building2 size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <p style={{ fontWeight: 600 }}>No registrations found yet</p>
                </td>
              </tr>
            ) : (
              recentList.map((biz) => (
                <tr key={biz.id} style={{ borderBottom: '1px solid #F1F5F9', transition: '0.2s' }} className="hover:bg-slate-50">
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{biz.name || biz.businessName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={12} /> {biz.city || 'Location Pending'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} color="#94A3B8" /> {biz.ownerName || 'Unknown Owner'}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} color="#94A3B8" /> {biz.phone}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                       <Calendar size={16} color="#94A3B8" />
                       {dayjs(biz.joinedAt || biz.createdAt).format('DD MMM YYYY')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginLeft: 24, marginTop: 2 }}>
                       {dayjs(biz.joinedAt || biz.createdAt).fromNow()}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800,
                      background: biz.status === 'Active' ? '#F0FDF4' : '#FFF7ED',
                      color: biz.status === 'Active' ? '#16A34A' : '#EA580C',
                      border: biz.status === 'Active' ? '1px solid #DCFCE7' : '1px solid #FFEDD5'
                    }}>
                      {biz.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
