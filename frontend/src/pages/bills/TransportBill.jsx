import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  Truck, MapPin, User, Package, Plus, Trash2,
  CheckCircle2, Loader2, ArrowLeft, ChevronDown, FileText, Calendar
} from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useParties } from '../../context/PartyContext'
import { useVehicles } from '../../context/VehicleContext'
import dayjs from 'dayjs'

function Field({ label, error, children, required, style }) {
  return (
    <div className="form-group" style={style}>
      <label className="form-label">
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 14,
      border: '1px solid rgba(0,0,0,0.04)',
      width: '100%', boxSizing: 'border-box', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={iconColor} />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

const PAYMENT_MODES = [
  { val: 'topay',   label: 'To Pay',   color: '#DC2626', bg: '#FEE2E2' },
  { val: 'paid',    label: 'Paid',     color: '#16A34A', bg: '#DCFCE7' },
  { val: 'tbb',     label: 'TBB',      color: '#D97706', bg: '#FEF3C7' },
]

export default function TransportBill() {
  const { addBill } = useBills()
  const { parties } = useParties()
  const { vehicles } = useVehicles()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [savedBill, setSavedBill] = useState(null)
  
  // Account-based billing states
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'))
  const [hasLoadedTrips, setHasLoadedTrips] = useState(false)

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      billDate: dayjs().format('YYYY-MM-DD'),
      partyId: '',
      billedToName: '',
      billedToPhone: '',
      billedToEmail: '',
      billedToAddress: '',
      billedToCity: '',
      billedToState: '',
      billedToPincode: '',
      billedToGstin: '',
      billedToPan: '',
      items: [
        { date: dayjs().format('YYYY-MM-DD'), companyFrom: '', companyTo: '', chalanNo: '', amount: '' }
      ],
      loadingCharge: '0', unloadingCharge: '0',
      detentionCharge: '0', otherCharge: '0',
      gstPercent: '0', gstType: 'CGST+SGST',
      paymentMode: 'topay',
      notes: 'Grateful for Moving What Matters to You!',
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const watchedItems = watch('items')
  const paymentMode = watch('paymentMode')
  const loadingCharge   = watch('loadingCharge')
  const unloadingCharge = watch('unloadingCharge')
  const detentionCharge = watch('detentionCharge')
  const otherCharge     = watch('otherCharge')
  const gstPercent      = watch('gstPercent')

  // Auto-fill party details
  const partyId = watch('partyId')
  useEffect(() => {
    if (!partyId) return
    const p = parties.find(x => x.id === partyId)
    if (p) {
      setValue('billedToName', p.name)
      setValue('billedToPhone', p.phone || '')
      setValue('billedToEmail', p.email || '')
      setValue('billedToAddress', p.address || '')
      setValue('billedToCity', p.city || '')
      setValue('billedToState', p.state || '')
      setValue('billedToPincode', p.pincode || '')
      setValue('billedToGstin', p.gstin || '')
      setValue('billedToPan', p.pan || '')
    }
  }, [partyId, parties, setValue])

  // Totals calculation
  const itemsTotal = (watchedItems || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const otherChargesTotal = [loadingCharge, unloadingCharge, detentionCharge, otherCharge]
    .reduce((s, v) => s + (parseFloat(v) || 0), 0)
  
  const subtotal = itemsTotal + otherChargesTotal
  const gstAmount = subtotal * (parseFloat(gstPercent) || 0) / 100
  const grandTotal = subtotal + gstAmount

  const loadPendingTrips = () => {
    if (!partyId) {
      alert("Please select a party first")
      return
    }
    const saved = localStorage.getItem('transport_trips')
    if (!saved) {
      alert("No trips found in system")
      return
    }
    try {
      const allTrips = JSON.parse(saved)
      const filtered = allTrips.filter(t => 
        t.partyId === partyId && 
        !t.billed &&
        dayjs(t.date).isAfter(dayjs(fromDate).subtract(1, 'day')) &&
        dayjs(t.date).isBefore(dayjs(toDate).add(1, 'day'))
      )
      
      if (filtered.length === 0) {
        alert("No pending trips found for this party in the selected date range.")
        return
      }

      // Grouping logic for combined billing
      const groups = {}
      filtered.forEach(t => {
        const key = `${t.date}_${t.vehicleId}`
        if (!groups[key]) groups[key] = []
        groups[key].push(t)
      })

      const formatted = Object.values(groups).map(group => {
        const sorted = [...group].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        
        let displayFrom = sorted[0].fromLocation
        let displayTo = sorted[0].toLocation
        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i-1]
          const curr = sorted[i]
          if (curr.fromLocation.toLowerCase().trim() === prev.toLocation.toLowerCase().trim()) {
             displayTo += ` + ${curr.toLocation}`
          } else {
             displayTo += ` + ${curr.fromLocation} to ${curr.toLocation}`
          }
        }

        const totalAmount = sorted.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
        
        return {
          date: sorted[0].date,
          companyFrom: displayFrom,
          companyTo: displayTo,
          chalanNo: '',
          amount: totalAmount.toString(),
          tripId: sorted.map(s => s.id).join(',') 
        }
      })
      
      setValue('items', formatted)
      setHasLoadedTrips(true)
    } catch (e) {
      console.error("Failed to load trips", e)
    }
  }

  const onSubmit = async (data) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    const bill = addBill({
      type: 'transport',
      ...data,
      subtotal, 
      gstAmount, 
      grandTotal,
      status: data.paymentMode === 'paid' ? 'paid' : 'unpaid',
    })

    // Mark trips as billed in localStorage
    try {
      const saved = localStorage.getItem('transport_trips')
      if (saved) {
        const allTrips = JSON.parse(saved)
        const billedTripIds = data.items.reduce((acc, it) => {
          if (it.tripId) {
            const ids = it.tripId.includes(',') ? it.tripId.split(',') : [it.tripId]
            return [...acc, ...ids]
          }
          return acc
        }, [])
        if (billedTripIds.length > 0) {
          const updated = allTrips.map(t => billedTripIds.includes(t.id) ? { ...t, billed: true } : t)
          localStorage.setItem('transport_trips', JSON.stringify(updated))
        }
      }
    } catch (e) {
      console.error("Failed to mark trips as billed", e)
    }

    setSaving(false)
    setSavedBill(bill)
  }

  if (savedBill) return (
    <div className="page-wrapper animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ width: 68, height: 68, borderRadius: 20, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 0.3s ease both' }}>
        <CheckCircle2 size={36} color="#16A34A" />
      </div>
      <h2 style={{ fontWeight: 800, color: '#0F0D2E' }}>Bill Created!</h2>
      <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Invoice #{savedBill.invoiceNo} generated and saved.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => navigate(`/bills/${savedBill.id}`)}>
          <FileText size={16} /> View Invoice
        </button>
        <button className="btn btn-ghost" onClick={() => { setSavedBill(null); navigate('/bills/new'); }}>
          <Plus size={16} /> Create Another
        </button>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/bills')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', margin: 0 }}>Transport Bill</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Consolidated Billing Summary</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <input type="date" {...register('billDate')} className="form-input" style={{ fontSize: '0.85rem', padding: '8px 12px', borderRadius: 12, background: 'white' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Billed To (Party) ── */}
        <SectionCard icon={User} iconBg="#EDE9FE" iconColor="#7C3AED" title="Billed To (Customer)">
          <div className="grid grid-cols-1 gap-4" style={{ width: '100%', minWidth: 0 }}>
            <Field label="Select Party (Quick Fill)">
              <div style={{ position: 'relative', width: '100%' }}>
                <select {...register('partyId')} className="form-input" style={{ appearance: 'none', paddingRight: 36, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <option value="">— Select party —</option>
                  {parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </Field>
            <div className="grid md-grid-cols-2 gap-3" style={{ width: '100%', minWidth: 0 }}>
              <Field label="Business Name" error={errors.billedToName} required>
                <input {...register('billedToName', { required: 'Required' })} placeholder="Party Name" className="form-input" />
              </Field>
              <Field label="Phone" error={errors.billedToPhone}>
                <input {...register('billedToPhone')} placeholder="Phone" className="form-input" />
              </Field>
              <Field label="Email" error={errors.billedToEmail}>
                <input {...register('billedToEmail')} placeholder="Email" className="form-input" />
              </Field>
              <Field label="Address">
                <input {...register('billedToAddress')} placeholder="Party Address" className="form-input" />
              </Field>
              <Field label="City">
                <input {...register('billedToCity')} placeholder="City" className="form-input" />
              </Field>
              <Field label="State">
                <input {...register('billedToState')} placeholder="State" className="form-input" />
              </Field>
              <Field label="Pincode">
                <input {...register('billedToPincode')} placeholder="Pincode" className="form-input" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="GSTIN">
                  <input {...register('billedToGstin')} placeholder="GSTIN" className="form-input" />
                </Field>
                <Field label="PAN" error={errors.billedToPan}>
                  <input 
                    {...register('billedToPan', { 
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN (e.g. ABCDE1234F)' } 
                    })} 
                    onInput={e => e.target.value = e.target.value.toUpperCase()}
                    placeholder="PAN Number" 
                    className="form-input" 
                    style={{ textTransform: 'uppercase' }}
                  />
                </Field>
              </div>
            </div>

            {partyId && (
              <div style={{ marginTop: 16, marginBottom: 8, padding: '16px', background: '#F0F9FF', borderRadius: 20, border: '1.5px solid #BAE6FD', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)', width: '100%', boxSizing: 'border-box' }} className="animate-fadeIn">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Package size={18} color="#0284C7" />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0369A1' }}>Fetch Pending Trips (Account Billing)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="From Date">
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="form-input" style={{ height: 38, fontSize: '0.8rem' }} />
                  </Field>
                  <Field label="To Date">
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="form-input" style={{ height: 38, fontSize: '0.8rem' }} />
                  </Field>
                </div>
                <button type="button" onClick={loadPendingTrips} className="btn btn-primary" style={{ height: 40, width: '100%', fontSize: '0.85rem', background: '#0284C7' }}>
                  Load Entries for this Period
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Billing Summary (Multiple Items) ── */}
        <SectionCard icon={Truck} iconBg="#FEF3C7" iconColor="#D97706" title="Billing Summary (Trips / Chalans)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map((field, index) => (
              <div key={field.id} className="animate-fadeInUp" style={{ 
                background: '#F8FAFC', padding: '16px', borderRadius: 20, 
                border: '1.5px solid #F1F5F9', position: 'relative',
                animationDelay: `${index * 0.05}s`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                {/* Trip Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: '1px dashed #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#7C3AED', background: '#EDE9FE', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trip #{index + 1}</span>
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, padding: 4 }}>
                      <Trash2 size={14} /> <span className="hidden-xs">Remove</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                  <Field label="Date" style={{ gridColumn: 'span 2' }}>
                    <div className="input-group">
                      <span className="input-prefix" style={{ left: 12 }}><Calendar size={14} /></span>
                      <input type="date" {...register(`items.${index}.date`)} className="form-input" style={{ fontSize: '0.875rem', height: 42 }} />
                    </div>
                  </Field>

                  <Field label="From (Origin)" style={{ gridColumn: 'span 1' }}>
                    <div className="input-group">
                      <span className="input-prefix" style={{ left: 12 }}><MapPin size={14} /></span>
                      <input {...register(`items.${index}.companyFrom`)} placeholder="Origin" className="form-input" style={{ fontSize: '0.875rem', height: 42 }} />
                    </div>
                  </Field>

                  <Field label="To (Destination)" style={{ gridColumn: 'span 1' }}>
                    <div className="input-group">
                      <span className="input-prefix" style={{ left: 12 }}><MapPin size={14} /></span>
                      <input {...register(`items.${index}.companyTo`)} placeholder="Destination" className="form-input" style={{ fontSize: '0.875rem', height: 42 }} />
                    </div>
                  </Field>

                  <Field label="Chalan No." style={{ gridColumn: 'span 1' }}>
                    <div className="input-group">
                      <span className="input-prefix" style={{ left: 12 }}><FileText size={14} /></span>
                      <input {...register(`items.${index}.chalanNo`)} placeholder="e.g. 5642" className="form-input" style={{ fontSize: '0.875rem', height: 42 }} />
                    </div>
                  </Field>

                  <Field label="Amount (₹)" style={{ gridColumn: 'span 1' }}>
                    <div className="input-group">
                      <span className="input-prefix" style={{ left: 14, fontWeight: 800, color: '#374151', fontSize: '0.9rem' }}>₹</span>
                      <input type="number" {...register(`items.${index}.amount`)} placeholder="0.00" className="form-input" style={{ fontSize: '0.875rem', height: 42 }} />
                    </div>
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => append({ date: dayjs().format('YYYY-MM-DD'), companyFrom: '', companyTo: '', chalanNo: '', amount: '' })} 
            style={{ 
              marginTop: 12, width: '100%', padding: '12px', borderRadius: 12, border: '2px dashed #E5E7EB', 
              background: '#F9FAFB', fontWeight: 700, fontSize: '0.875rem', color: '#4F46E5', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
            <Plus size={18} /> Add Another Trip
          </button>
        </SectionCard>

        {/* ── Other Charges & GST ── */}
        <div className="grid md-grid-cols-2 gap-4">
          <SectionCard icon={FileText} iconBg="#FEE2E2" iconColor="#DC2626" title="Extra Charges">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'loadingCharge',   label: 'Loading' },
                { name: 'unloadingCharge', label: 'Unloading' },
                { name: 'detentionCharge', label: 'Detention' },
                { name: 'otherCharge',     label: 'Other' },
              ].map(c => (
                <Field key={c.name} label={`${c.label} (₹)`}>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <input {...register(c.name)} type="number" placeholder="0" className="form-input" />
                  </div>
                </Field>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={FileText} iconBg="#DCFCE7" iconColor="#16A34A" title="Taxes & Totals">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="GST %">
                <select {...register('gstPercent')} className="form-input">
                  {['0','5','12','18'].map(g => <option key={g} value={g}>{g}%</option>)}
                </select>
              </Field>
              <Field label="GST Type">
                <select {...register('gstType')} className="form-input">
                  {['CGST+SGST','IGST'].map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            
            <div style={{ background: '#1E1B4B', borderRadius: 16, padding: '16px', color: 'white', boxShadow: '0 8px 20px rgba(30, 27, 75, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                <span>GST Amount</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 10, fontWeight: 800, fontSize: '1.25rem' }}>
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Payment & Notes ── */}
        <div className="grid md-grid-cols-2 gap-4 mb-6">
          <SectionCard icon={Calendar} iconBg="#EDE9FE" iconColor="#7C3AED" title="Payment Mode">
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_MODES.map(pm => {
                const isActive = paymentMode === pm.val
                return (
                  <button key={pm.val} type="button" onClick={() => setValue('paymentMode', pm.val)}
                    style={{
                      padding: '12px 4px', borderRadius: 12, border: isActive ? `2px solid ${pm.color}` : '2px solid transparent',
                      background: isActive ? pm.bg : '#F3F4F6', color: isActive ? pm.color : '#6B7280',
                      fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', transition: '0.2s'
                    }}
                  >{pm.label}</button>
                )
              })}
            </div>
            <input type="hidden" {...register('paymentMode')} />
          </SectionCard>

          <div style={{ background: 'white', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <Field label="Notes / Slogan">
              <textarea {...register('notes')} className="form-input" style={{ minHeight: 60, fontSize: '0.875rem' }} />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="btn-group btn-group-mobile-col" style={{ marginBottom: 40 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/bills')} style={{ height: 52 }}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} style={{ height: 52 }}>
            {saving ? <><Loader2 size={18} className="spin" /> Generating…</> : <><FileText size={18} /> Generate Bill</>}
          </button>
        </div>
      </form>

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
