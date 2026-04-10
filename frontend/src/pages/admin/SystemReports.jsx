import React from 'react'
import {
  ShieldAlert, Settings, Bell, HelpCircle,
  Activity, Map, Filter, Download,
  ExternalLink, ArrowUpRight, TrendingUp, IndianRupee
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

// Shared Placeholder Component for Reports/Security/etc.
export default function AdminReports() {
  const { mode, stats } = useAdmin()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, margin: 0 }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Deep insights into system usage and revenue streams</p>
        </div>
        <button className="btn btn-primary" style={{ background: accentColor, borderColor: accentColor }}><Download size={18} /> Download Full Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <TrendingUp size={20} color={accentColor} />
            <h3 style={{ margin: 0, fontWeight: 900 }}>Financial performance</h3>
          </div>
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <IndianRupee size={48} color="var(--text-muted)" strokeWidth={1} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: 12 }}>₹{stats.totalRevenue.toLocaleString()}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net collections (Mode: {isTransport ? 'Transport' : 'Garage'})</p>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Activity size={20} color={accentColor} />
            <h3 style={{ margin: 0, fontWeight: 900 }}>User Activity Heatmap</h3>
          </div>
          <div style={{
            height: 160, borderRadius: 12, background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Analytics visualization loading...</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 900 }}>Top Performing Regions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Delhi NCR', 'Mumbai', 'Bangalore', 'Pune'].map(city => (
            <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, fontSize: '0.8125rem', fontWeight: 800 }}>{city}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 4 }}>
                <div style={{ width: Math.random() * 80 + '%', height: '100%', background: accentColor, borderRadius: 4 }} />
              </div>
              <div style={{ width: 40, textAlign: 'right', fontSize: '0.75rem', fontWeight: 700 }}>{Math.floor(Math.random() * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
