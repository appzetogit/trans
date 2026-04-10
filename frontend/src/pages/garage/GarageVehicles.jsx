import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Wrench, Plus, Trash2, CheckCircle2, Loader2, ArrowLeft, ChevronDown } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'

const CAR_TYPES = ['Car', 'SUV', 'Bike', 'Truck', 'Bus', 'Auto', 'Van', 'Other']
const COMPANIES  = ['Maruti', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Ford', 'Kia', 'MG', 'Renault', 'Volkswagen', 'Skoda', 'Other']

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

const VCard = ({ v, onDelete }) => (
  <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(0,0,0,0.04)' }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Wrench size={18} color="#7C3AED" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F0D2E' }}>{v.company} {v.model}</div>
      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{v.vehicleNumber} • {v.kmReading} km</div>
      {v.nextServiceKm && <div style={{ fontSize: '0.6875rem', color: '#D97706', marginTop: 2 }}>⚠ Next service: {v.nextServiceKm} km</div>}
    </div>
    <button onClick={() => onDelete(v.id)} style={{ width: 28, height: 28, border: 'none', background: '#FEE2E2', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Trash2 size={13} color="#DC2626" />
    </button>
  </div>
)

export default function GarageVehicles() {
  const { vehicles, addVehicle, deleteVehicle } = useVehicles()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { vehicleNumber: '', company: 'Maruti', model: '', vehicleType: 'Car', kmReading: '', nextServiceKm: '', customerName: '', customerPhone: '' }
  })

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 300))
    addVehicle({ ...data, garageVehicle: true })
    reset()
    setShowForm(false)
  }

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', marginBottom: 2 }}>Customer Vehicles</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{vehicles.length} vehicles registered</p>
        </div>
        <button id="btn-add-garage-vehicle" className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 16, boxShadow: '0 4px 20px rgba(124,58,237,0.1)', border: '1.5px solid #EDE9FE', animation: 'fadeInUp 0.2s ease both' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', marginBottom: 16 }}>New Vehicle</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Car Company">
                <div style={{ position: 'relative' }}>
                  <select {...register('company')} className="form-input" style={{ appearance: 'none', paddingRight: 32 }}>
                    {COMPANIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
              </Field>
              <Field label="Model" error={errors.model} required>
                <input {...register('model', { required: 'Required' })} placeholder="e.g. Swift, i20" className={`form-input ${errors.model ? 'error' : ''}`} />
              </Field>
              <Field label="Vehicle Number" error={errors.vehicleNumber} required>
                <input {...register('vehicleNumber', { required: 'Required' })} placeholder="GJ15AB1234" className={`form-input ${errors.vehicleNumber ? 'error' : ''}`} style={{ textTransform: 'uppercase' }} />
              </Field>
              <Field label="Current KM" error={errors.kmReading} required>
                <input {...register('kmReading', { required: 'Required' })} type="number" placeholder="45000" className={`form-input ${errors.kmReading ? 'error' : ''}`} inputMode="numeric" />
              </Field>
              <Field label="Next Service KM">
                <input {...register('nextServiceKm')} type="number" placeholder="50000" className="form-input" inputMode="numeric" />
              </Field>
              <Field label="Customer Name">
                <input {...register('customerName')} placeholder="Owner name" className="form-input" />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={15} className="spin" /> Saving…</> : <><CheckCircle2 size={15} /> Add Vehicle</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {vehicles.length === 0 && !showForm ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Wrench size={28} color="#7C3AED" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#0F0D2E' }}>No vehicles yet</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 20 }}>Add customer vehicles to track service history</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Vehicle</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vehicles.map(v => <VCard key={v.id} v={v} onDelete={deleteVehicle} />)}
        </div>
      )}
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
