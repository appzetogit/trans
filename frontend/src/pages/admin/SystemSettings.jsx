import React from 'react'
import {
  Settings, Globe, Shield, Bell,
  Save, Database, Trash2, Smartphone,
  Monitor, Truck, Wrench, IndianRupee, Layers
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function SystemSettings() {
  const { mode, switchMode } = useAdmin()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, margin: 0 }}>System Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Configure global parameters and application behaviors</p>
        </div>
        <button className="btn btn-primary" style={{ background: accentColor, borderColor: accentColor }}><Save size={18} /> Save Settings</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
             <h3 style={{ margin: 0, fontWeight: 900 }}>Configuration Menu</h3>
          </div>
          <div style={{ padding: '8px' }}>
            {[
              { icon: Globe, label: 'General Configuration', active: true },
              { icon: Shield, label: 'Security & Auth' },
              { icon: Bell, label: 'Push Notifications' },
              { icon: Database, label: 'Data Management' },
              { icon: Smartphone, label: 'Mobile App Settings' },
              { icon: Layers, label: 'API Integrations' },
            ].map(item => (
              <button key={item.label} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                background: item.active ? 'rgba(0,0,0,0.04)' : 'transparent', border: 'none',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                color: item.active ? accentColor : 'var(--text-secondary)', fontWeight: 800,
                fontSize: '0.875rem', transition: '0.2s'
              }}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, margin: '0 0 16px' }}>Master Switch</h3>
            <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                  <p style={{ margin: 0, fontWeight: 800 }}>Default Platform Mode</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose the module that loads by default for new administrators</p>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => switchMode('transport')} style={{ padding: '8px 14px', borderRadius: 8, fontStyle: 'none', border: isTransport ? `2px solid ${accentColor}` : '1px solid var(--border)', background: isTransport ? 'white' : 'transparent', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}>TRANSPORT</button>
                  <button onClick={() => switchMode('garage')} style={{ padding: '8px 14px', borderRadius: 8, fontStyle: 'none', border: !isTransport ? '2px solid #7C3AED' : '1px solid var(--border)', background: !isTransport ? 'white' : 'transparent', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}>GARAGE</button>
               </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SYSTEM CURRENCY</label>
            <div style={{ display: 'flex', gap: 12 }}>
               <select className="form-input" style={{ flex: 1 }} defaultValue="INR"><option value="INR">Indian Rupee (₹)</option><option value="USD">US Dollar ($)</option></select>
               <select className="form-input" style={{ flex: 1 }} defaultValue="UTC+5:30"><option value="UTC+5:30">New Delhi (GMT+5:30)</option></select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ADMIN CONSOLE EMAIL</label>
            <input type="email" className="form-input" placeholder="admin@trans-billing.com" defaultValue="admin@trans-billing.com" />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Trash2 size={16} /> Danger Zone: Factory Reset
             </p>
             <button className="btn btn-ghost" style={{ color: 'var(--danger)', fontStyle: 'none' }}>Nuclear Action</button>
          </div>
        </div>
      </div>
    </div>
  )
}
