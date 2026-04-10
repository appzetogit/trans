import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminLogin } from '../../api/authApi'
import logo from '../../assets/trans-logo.png'

const ADMIN_OTP_PHONE = '7610416911'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState('')
  
  const { login, sendOTP, verifyOTP, sendingOTP, verifying } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!otpMode) return
    setOtp('')
  }, [otpMode])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await adminLogin(email, password)
      if (!res?.success) {
        setError(res?.message || 'System Access Denied: Invalid credentials')
        return
      }

      if (res?.accessToken) localStorage.setItem('access_token', res.accessToken)
      const admin = res?.admin
      await login({
        id: admin?.id,
        role: 'admin',
        email: admin?.email || email,
      })
      navigate('/admin/dashboard', { replace: true })
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'System Access Denied: Invalid credentials'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminOtpStart = async () => {
    setOtpMode(true)
    setError('')
    const res = await sendOTP(ADMIN_OTP_PHONE)
    if (!res?.success) {
      setError(res?.message || 'Could not send OTP. Please try again.')
    }
  }

  const handleAdminOtpVerify = async () => {
    const code = String(otp || '').replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setError('')
    const res = await verifyOTP(ADMIN_OTP_PHONE, code)
    if (!res?.success) {
      setError(res?.message || 'Invalid OTP')
      return
    }

    // ensure local session is admin even if backend dto changes
    await login({
      id: res?.user?.id,
      role: 'admin',
      phone: ADMIN_OTP_PHONE,
      name: res?.user?.name || null,
      businessName: res?.user?.businessName || null,
    })

    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <div className="animate-fadeIn">
      {/* Branding / Header */}
      <div className="auth-card-header" style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          padding: 10
        }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h2 className="auth-card-title" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.04em', marginBottom: 8 }}>Admin Portal</h2>
        <p className="auth-card-subtitle" style={{ fontSize: '0.875rem', color: '#6B7280', maxWidth: '340px', margin: '0 auto 32px', lineHeight: 1.5 }}>
          Authorized personnel only. Enter your secure administrative credentials to access the console.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#4B5563' }}>
            Work Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type="email" 
              placeholder="admin@trans.com"
              value={email}
              onChange={e => {setEmail(e.target.value); if(error) setError('')}}
              required
              className="form-input"
              style={{ paddingLeft: 44, height: 48, borderRadius: 12, border: error ? '2px solid #EF4444' : '1.5px solid #E5E7EB' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#4B5563' }}>
            Secret Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={e => {setPassword(e.target.value); if(error) setError('')}}
              required
              className="form-input"
              style={{ paddingLeft: 44, paddingRight: 44, height: 48, borderRadius: 12, border: error ? '2px solid #EF4444' : '1.5px solid #E5E7EB' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', 
            borderRadius: 10, background: '#FEF2F2', border: '1px solid #FEE2E2',
            color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button 
          className="btn btn-primary btn-lg btn-full" 
          type="submit"
          disabled={loading}
          style={{ 
            height: 52, borderRadius: 12, fontSize: '1rem', fontWeight: 700,
            background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            border: 'none', marginTop: 8
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Loader2 size={20} className="spin" />
              Verifying...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Unlock Dashboard <ArrowRight size={20} />
            </div>
          )}
        </button>
      </form>

      {/* Alternative Login */}
      <div style={{ 
        marginTop: 32, padding: '24px 20px', borderRadius: 20, 
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
        textAlign: 'center', border: '1px solid #E2E8F0'
      }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Are you a business owner?
        </p>

        {!otpMode ? (
          <button 
            onClick={handleAdminOtpStart}
            disabled={sendingOTP}
            style={{ 
              width: '100%', height: 44, borderRadius: 12, background: 'white',
              border: '1px solid #E2E8F0', color: '#4F46E5', fontSize: '0.875rem',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              opacity: sendingOTP ? 0.7 : 1
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.background = '#F5F3FF'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
          >
            {sendingOTP ? 'Sending OTP…' : 'User OTP Login'}
          </button>
        ) : (
          <div style={{ marginTop: 14, textAlign: 'left' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={16} color="#4F46E5" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F2937' }}>
                  +91 {ADMIN_OTP_PHONE.slice(0,5)} {ADMIN_OTP_PHONE.slice(5)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setOtpMode(false); setError('') }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', fontWeight: 700 }}
              >
                Cancel
              </button>
            </div>

            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#4B5563' }}>
              Enter OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError('') }}
              className="form-input"
              placeholder="Enter 6-digit OTP"
              style={{ height: 48, borderRadius: 12, border: error ? '2px solid #EF4444' : '1.5px solid #E5E7EB', fontWeight: 800, letterSpacing: '0.2em', textAlign: 'center' }}
            />

            <button
              type="button"
              onClick={handleAdminOtpVerify}
              disabled={verifying || String(otp).replace(/\D/g, '').length !== 6}
              className="btn btn-primary btn-lg btn-full"
              style={{
                marginTop: 12,
                height: 46,
                borderRadius: 12,
                fontSize: '0.95rem',
                fontWeight: 800,
                background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.18)',
                border: 'none',
              }}
            >
              {verifying ? 'Verifying…' : 'Verify OTP'}
            </button>
          </div>
        )}
      </div>

      {/* Security Disclaimer */}
      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9CA3AF', marginBottom: 8 }}>
           <ShieldCheck size={12} />
           <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Secure Environment</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#9CA3AF', lineHeight: 1.5, padding: '0 20px', margin: 0 }}>
          All administrative actions are logged and strictly monitored. Unauthorized access attempts will be permanently blocked.
        </p>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
