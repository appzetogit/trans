import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike, Car, Truck, Heart, Users, Plane, Shield, ArrowRight, ChevronRight, FileText } from 'lucide-react'

export default function InsuranceHome() {
  const navigate = useNavigate()

  const categories = [
    { id: 'bike', title: 'Bike', price: '₹538/year', icon: Bike, color: '#7C3AED', bg: '#F5F3FF', tag: 'Lowest Price' },
    { id: 'car', title: 'Car', price: '₹2094/year', icon: Car, color: '#3B82F6', bg: '#EFF6FF', tag: 'Secure Plan' },
    { id: 'truck', title: 'Truck/Fleet', price: '₹4999/year', icon: Truck, color: '#F59E0B', bg: '#FFFBEB', tag: 'Commercial' },
    { id: 'health', title: 'Health', price: '₹224/month', icon: Heart, color: '#EF4444', bg: '#FEF2F2', tag: 'Top Rated' },
    { id: 'life', title: 'Life', price: '₹1 Crore Cover', icon: Users, color: '#10B981', bg: '#ECFDF5', tag: 'Peace of Mind' },
    { id: 'travel', title: 'Travel', price: '₹199/trip', icon: Plane, color: '#6366F1', bg: '#EEF2FF', tag: 'Holiday Ready' },
  ]

  return (
    <div className="page-wrapper animate-fadeIn" style={{ background: '#F9FAFB', minHeight: '100vh', padding: '20px 16px' }}>
      {/* Header Banner (PhonePe Style) */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4C1D95, #7C3AED)', 
        borderRadius: 28, 
        padding: '32px 24px', 
        color: 'white', 
        marginBottom: 24, 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(124, 58, 237, 0.25)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, marginBottom: 12, display: 'inline-block' }}>Insurance Service</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Choose from <br/> 30+ plans</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: 8, maxWidth: '60%' }}>Secure your vehicle and family with verified insurers.</p>
          
          <button 
            style={{ 
              marginTop: 18, 
              background: 'white', 
              color: '#7C3AED', 
              border: 'none', 
              padding: '10px 18px', 
              borderRadius: 14, 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              cursor: 'pointer'
            }}
          >
            Explore Now <ArrowRight size={14} />
          </button>
        </div>
        
        {/* Decorative elements */}
        <Shield size={120} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', bottom: -20, right: -10 }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', margin: 0 }}>Insurance</h2>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>Secure what you love</p>
        </div>
        <button style={{ border: '1.5px solid #E5E7EB', background: 'white', borderRadius: 14, padding: '8px 14px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} /> My Policies
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            onClick={() => navigate(`/insurance/form/${cat.id}`)}
            style={{ 
              background: 'white', 
              borderRadius: 24, 
              padding: '18px', 
              border: '1px solid #F1F5F9',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 16, background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <cat.icon size={22} />
            </div>
            
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1F2937' }}>{cat.title}</div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 4 }}>Starts @ {cat.price}</div>
            
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '3px 8px', borderRadius: 100, background: cat.bg, color: cat.color, textTransform: 'uppercase' }}>
                 {cat.tag}
               </span>
               <ChevronRight size={14} color="#D1D5DB" />
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 30 }} />
    </div>
  )
}
