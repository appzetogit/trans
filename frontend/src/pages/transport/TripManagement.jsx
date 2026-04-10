import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Truck, MapPin, Plus, Calendar, Trash2, 
  Search, ArrowLeft, Loader2, CheckCircle2,
  Navigation, Hash, ArrowRight, Camera, Image as ImageIcon, X, Eye, Upload,
  FileText, User, ExternalLink
} from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { useParties } from '../../context/PartyContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { uploadSingleFile } from '../../api/uploadApi'

export default function TripManagement() {
  const { vehicles } = useVehicles()
  const { parties } = useParties()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  // Local state for trips (since "no backend changes" requested)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Photo states
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    vehicleId: '',
    partyId: '',
    fromLocation: '',
    toLocation: '',
    numberOfTrips: '',
    amount: ''
  })

  // Load trips from localStorage for persistence
  useEffect(() => {
    const saved = localStorage.getItem('transport_trips')
    if (saved) {
      try {
        setTrips(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse trips", e)
      }
    }
    setLoading(false)
  }, [])

  // Persist trips
  const saveTrips = (newList) => {
    setTrips(newList)
    localStorage.setItem('transport_trips', JSON.stringify(newList))
  }

  const handleAddTrip = (e) => {
    e.preventDefault()
    if (!formData.fromLocation || !formData.toLocation || !formData.vehicleId || !formData.partyId) {
      alert("Please fill in main fields including Account/Party")
      return
    }

    const vehicle = vehicles.find(v => v.id === formData.vehicleId)
    const party = parties.find(p => p.id === formData.partyId)
    const newTrip = {
      id: `trip_${Date.now()}`,
      ...formData,
      numberOfTrips: formData.numberOfTrips || '1',
      vehicleNumber: vehicle?.vehicleNumber || 'Unknown',
      partyName: party?.name || 'Unknown',
      billed: false,
      createdAt: new Date().toISOString(),
      chalanImage: null // Initialize with no image
    }

    saveTrips([newTrip, ...trips])
    setShowForm(false)
    setFormData({
      date: dayjs().format('YYYY-MM-DD'),
      vehicleId: '',
      partyId: '',
      fromLocation: '',
      toLocation: '',
      numberOfTrips: '',
      amount: ''
    })
  }

  const handleDelete = (id) => {
    const idsToDelete = id.split(',')
    if (window.confirm(`Delete ${idsToDelete.length > 1 ? 'this group of trips' : 'this trip'}?`)) {
      saveTrips(trips.filter(t => !idsToDelete.includes(t.id)))
    }
  }

  // Photo handlers
  const handlePhotoCapture = (tripId) => {
    setSelectedTripId(tripId)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const folder = 'trans/chalan'
      const up = await uploadSingleFile(file, { folder })
      const url = up?.url || null
      const updatedTrips = trips.map(t =>
        selectedTripId.split(',').includes(t.id) ? { ...t, chalanImage: url } : t
      )
      saveTrips(updatedTrips)
    } catch (err) {
      alert('Upload failed. Please try again.')
    } finally {
      setSelectedTripId(null)
      e.target.value = ''
    }
  }

  const removePhoto = (e, tripId) => {
    e.stopPropagation()
    const idsToRemove = tripId.split(',')
    if (window.confirm("Remove this Chalan photo?")) {
      const updatedTrips = trips.map(t => 
        idsToRemove.includes(t.id) ? { ...t, chalanImage: null } : t
      )
      saveTrips(updatedTrips)
    }
  }

  // Filter & Search (Mock)
  const [search, setSearch] = useState('')
  const filteredTrips = useMemo(() => {
    // Group by date, vehicle, party
    const groups = {}
    trips.forEach(t => {
      const key = `${t.date}_${t.vehicleId}_${t.partyId}`
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })

    const grouped = Object.values(groups).map(group => {
      // Sort by creation time to get the sequence
      const sorted = [...group].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      
      // Combine routes: "A to B + C"
      let displayFrom = sorted[0].fromLocation
      let displayTo = sorted[0].toLocation
      
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i-1]
        const curr = sorted[i]
        // If the current trip starts where the previous one ended, just add the new destination
        if (curr.fromLocation.toLowerCase().trim() === prev.toLocation.toLowerCase().trim()) {
           displayTo += ` + ${curr.toLocation}`
        } else {
           displayTo += ` + ${curr.fromLocation} to ${curr.toLocation}`
        }
      }

      const totalAmount = sorted.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      const totalCount = sorted.reduce((sum, t) => sum + (parseInt(t.numberOfTrips) || 1), 0)
      const allBilled = sorted.every(t => t.billed)
      
      // For photo, use the first available chalan image
      const photo = sorted.find(t => t.chalanImage)?.chalanImage || null

      return {
        ...sorted[0], // base info
        id: sorted.map(t => t.id).join(','), // Combined ID for local state tracking
        amount: totalAmount,
        numberOfTrips: totalCount,
        fromLocation: displayFrom,
        toLocation: displayTo,
        billed: allBilled,
        chalanImage: photo,
        memberIds: sorted.map(t => t.id)
      }
    })

    if (!search) return grouped
    const s = search.toLowerCase()
    return grouped.filter(t => 
      t.fromLocation.toLowerCase().includes(s) || 
      t.toLocation.toLowerCase().includes(s) ||
      t.vehicleNumber.toLowerCase().includes(s) ||
      t.partyName?.toLowerCase().includes(s)
    )
  }, [trips, search])

  return (
    <div className="page-wrapper animate-fadeIn trip-mgmt-container">
      
      {/* Header section */}
      <div className="trip-header">
        <div className="trip-header-info">
          <h1 className="trip-title">Detailed Trip Management</h1>
          <p className="trip-subtitle">Track and manage route-wise operations</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.open('https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollectionMainOnline.xhtml#', '_blank')}
            className="btn btn-ghost"
            title="Redirects to official government portal for tax payment"
            style={{ height: 44, borderRadius: 12, padding: '0 14px', fontWeight: 700, fontSize: '0.8rem', border: '1.5px solid #FDE68A', background: '#FFFBEB', color: '#B45309', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ExternalLink size={15} /> Pay Checkpost Tax
          </button>
          <button onClick={() => navigate('/bills/new?type=transport')} className="btn btn-ghost" style={{ height: 44, borderRadius: 12, padding: '0 16px', fontWeight: 700, fontSize: '0.875rem', border: '1.5px solid #F1F5F9' }}>
            <FileText size={18} /> Generate Bill
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary add-trip-btn">
            {showForm ? <><ArrowLeft size={18} /> Cancel</> : <><Plus size={18} /> Log New Trip</>}
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!showForm && (
        <div className="stats-grid-compact">
          <div className="stat-card">
            <div className="stat-label">Total Trips</div>
            <div className="stat-value">{trips.length}</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Pending Trips</div>
            <div className="stat-value">{trips.filter(t => !t.billed).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Billed Trips</div>
            <div className="stat-value">{trips.filter(t => t.billed).length}</div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="animate-fadeInUp trip-form-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Navigation size={22} color="var(--primary)" /> Add Trip Details
          </h2>
          <form onSubmit={handleAddTrip} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} className="form-input" required>
                  <option value="">— Select —</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.vehicleType})</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Account / Party</label>
              <select value={formData.partyId} onChange={e => setFormData({...formData, partyId: e.target.value})} className="form-input" required>
                <option value="">— Select Account —</option>
                {parties.map(p => {
                  const pendingCount = trips.filter(t => t.partyId === p.id && !t.billed).length
                  return <option key={p.id} value={p.id}>{p.name} {pendingCount > 0 ? `(${pendingCount} pending)` : ''}</option>
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">From Location</label>
                <input value={formData.fromLocation} onChange={e => setFormData({...formData, fromLocation: e.target.value})} placeholder="e.g., Ahmedabad" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">To Location</label>
                <input value={formData.toLocation} onChange={e => setFormData({...formData, toLocation: e.target.value})} placeholder="e.g., Surat" className="form-input" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Number of Trips</label>
                <input type="number" value={formData.numberOfTrips} onChange={e => setFormData({...formData, numberOfTrips: e.target.value})} placeholder="1" className="form-input" min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="1500" className="form-input" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 10, height: 50, borderRadius: 16, fontWeight: 800 }}>
              Save Trip Record
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="search-container">
            <Search size={20} color="#9CA3AF" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by location or vehicle..." 
              className="search-input"
            />
          </div>

          {/* Trips List */}
          <div className="trips-list">
            {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
              <div key={trip.id} className="animate-fadeInUp trip-card-mobile">
                <div className="trip-card-main">
                  <div className="trip-route">
                    <span className="location">{trip.fromLocation}</span>
                    <ArrowRight size={14} className="route-arrow" />
                    <span className="location">{trip.toLocation}</span>
                  </div>
                  
                  <div className="trip-meta-grid">
                    <div className="meta-item"><Hash size={12} /> {trip.vehicleNumber}</div>
                    <div className="meta-item"><User size={12} /> {trip.partyName}</div>
                    <div className="meta-item"><Calendar size={12} /> {dayjs(trip.date).format('DD MMM')}</div>
                    <div className="trip-badge">{trip.numberOfTrips} TRIP(S)</div>
                    <div style={{ 
                      fontSize: '0.65rem', fontWeight: 900, 
                      padding: '2px 8px', borderRadius: 6,
                      background: trip.billed ? '#DCFCE7' : '#FEF3C7',
                      color: trip.billed ? '#16A34A' : '#D97706'
                    }}>
                      {trip.billed ? 'BILLED' : 'PENDING'}
                    </div>
                  </div>
                </div>

                <div className="trip-card-actions">
                  <div className="action-left">
                    {trip.chalanImage ? (
                      <div className="chalan-thumb" onClick={() => { setPreviewImage(trip.chalanImage); setIsPreviewOpen(true); }}>
                        <img src={trip.chalanImage} alt="Chalan" />
                        <button className="remove-photo-btn" onClick={(e) => removePhoto(e, trip.id)} aria-label="Remove photo">
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <button className="upload-chalan-btn" onClick={() => handlePhotoCapture(trip.id)}>
                        <Camera size={16} />
                        <span>CHALAN</span>
                      </button>
                    )}
                    {trip.amount && <div className="trip-amount">₹{parseFloat(trip.amount).toLocaleString()}</div>}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => window.open('https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollectionMainOnline.xhtml#', '_blank')}
                      title="Pay checkpost tax for this trip on the official government portal"
                      style={{ height: 34, borderRadius: 9, padding: '0 10px', border: '1.5px solid #FDE68A', background: '#FFFBEB', color: '#B45309', fontWeight: 800, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <ExternalLink size={12} /> PAY TAX
                    </button>
                    <button className="delete-trip-btn" onClick={() => handleDelete(trip.id)} aria-label="Delete trip">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <Truck size={48} className="empty-icon" />
                <div className="empty-title">No trips recorded yet</div>
                <p className="empty-subtitle">Start by logging a new trip today</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Photo Preview Modal */}
      {isPreviewOpen && (
        <div className="preview-modal" onClick={() => setIsPreviewOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-preview-btn" onClick={() => setIsPreviewOpen(false)}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="Chalan Preview" className="preview-img" />
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" capture="environment" onChange={onFileChange} />

      <style>{`
        .trip-mgmt-container { padding-bottom: 24px; }
        .trip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .trip-title { fontSize: 1.25rem; font-weight: 900; color: #0F0D2E; margin: 0; }
        .trip-subtitle { color: #6B7280; font-size: 0.8125rem; margin-top: 2px; }
        .add-trip-btn { height: 44px; border-radius: 12px; padding: 0 16px; display: flex; alignItems: center; gap: 8px; font-weight: 700; font-size: 0.875rem; }
        
        .stats-grid-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .stat-card { background: white; border-radius: 18px; padding: 16px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .stat-card.accent { background: #EEF2FF; border-color: #E0E7FF; }
        .stat-label { color: #6B7280; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
        .accent .stat-label { color: #4F46E5; }
        .stat-value { font-size: 1.25rem; font-weight: 900; color: #0F0D2E; }
        .accent .stat-value { color: #4338CA; }

        .search-container { background: white; border-radius: 16px; padding: 0 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border: 1.5px solid #F1F5F9; }
        .search-input { border: none; background: transparent; flex: 1; height: 44px; outline: none; font-size: 0.875rem; font-weight: 500; }
        
        .trips-list { display: flex; flex-direction: column; gap: 12px; }
        .trip-card-mobile { background: white; border-radius: 20px; padding: 16px; border: 1px solid #F1F5F9; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .trip-card-main { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #F1F5F9; }
        .trip-route { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .location { font-size: 0.9375rem; font-weight: 800; color: #0F0D2E; }
        .route-arrow { color: #94A3B8; }
        
        .trip-meta-grid { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
        .meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #64748B; font-weight: 600; }
        .trip-badge { background: #F8FAFC; color: #475569; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 0.625rem; letter-spacing: 0.02em; }
        
        .trip-card-actions { display: flex; align-items: center; justify-content: space-between; }
        .action-left { display: flex; align-items: center; gap: 12px; }
        .chalan-thumb { width: 42px; height: 42px; border-radius: 10px; overflow: hidden; position: relative; border: 1.5px solid #7C3AED; }
        .chalan-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .remove-photo-btn { position: absolute; top: 0; right: 0; background: #EF4444; border: none; color: white; border-radius: 0 0 0 4px; padding: 1px 2px; }
        
        .upload-chalan-btn { height: 42px; border-radius: 10px; padding: 0 10px; border: 1.5px dashed #CBD5E1; background: #F8FAFC; color: #64748B; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
        .upload-chalan-btn span { font-size: 0.5rem; font-weight: 800; }
        
        .trip-amount { font-size: 0.9375rem; font-weight: 900; color: #0F0D2E; }
        .delete-trip-btn { color: #FDA4AF; padding: 8px; transition: 0.2s; border: none; background: transparent; }
        .delete-trip-btn:active { color: #EF4444; transform: scale(0.9); }
        
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-icon { opacity: 0.1; margin-bottom: 8px; color: #0F0D2E; }
        .empty-title { font-size: 0.9375rem; font-weight: 700; color: #334155; }
        .empty-subtitle { font-size: 0.8125rem; color: #64748B; margin-top: 4px; }
        
        .preview-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .modal-content { position: relative; width: 100%; max-width: 400px; }
        .preview-img { width: 100%; border-radius: 16px; border: 3px solid white; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .close-preview-btn { position: absolute; top: -50px; right: 0; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .trip-form-card { background: white; border-radius: 24px; padding: 20px; border: 1px solid #F1F5F9; }
      `}</style>
    </div>
  )
}
