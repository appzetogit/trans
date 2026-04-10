import React from 'react'
import { ArrowLeft, Download, Share2, Copy, Building2, Smartphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function QRCode() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const business = user || {}
  const upiId = business.bankDetails?.upiId || 'yourname@upi'
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(business.businessName || 'Business Owner')}&cu=INR`

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId)
    alert('UPI ID copied to clipboard')
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Business QR Code</h2>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow bg */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 250, height: 250, background: 'radial-gradient(circle, var(--primary-lighter) 0%, transparent 70%)', opacity: 0.5 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="avatar avatar-lg" style={{ width: 64, height: 64, margin: '0 auto 16px', fontSize: '1.25rem' }}>
            {business.businessName ? business.businessName[0] : 'BP'}
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 4 }}>{business.businessName || 'Your Business'}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>Scan to pay via any UPI App</p>

          {/* QR FRAME */}
          <div style={{ 
            background: 'white', padding: 20, borderRadius: 24, margin: '0 auto 24px', width: 220, height: 220,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', border: '1px solid var(--border)'
          }}>
            {/* Mock QR since we don't have a library yet, using a generation API */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`}
              alt="QR Code"
              style={{ width: '100%', height: '100%' }}
            />
            {/* Inner logo icon */}
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              width: 44, height: 44, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <Building2 size={24} color="var(--primary)" />
            </div>
          </div>

          <div style={{ 
            background: 'var(--bg)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 32, border: '1.5px dashed var(--border)'
          }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>UPI ID</p>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{upiId}</p>
            </div>
            <button onClick={copyUpi} className="btn-icon" style={{ borderRadius: 10, background: 'white' }}>
              <Copy size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button className="btn btn-primary">
              <Download size={18} /> Save Image
            </button>
            <button className="btn btn-ghost">
              <Share2 size={18} /> Share QR
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 16 }}>Supported Apps</h4>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', opacity: 0.6 }}>
          {/* Mock icons for PhonePe, GPay, Paytm as text for now */}
          {['GPay', 'PhonePe', 'Paytm', 'Amazon Pay'].map(app => (
            <div key={app} style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <Smartphone size={20} />
              </div>
              {app}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
