import React, { useEffect, useMemo, useState } from 'react'
import {
  Users, Search, Filter, UserPlus, X,
  User, Phone, Mail, Shield, Trash2, Edit3,
  ChevronLeft, ChevronRight, CheckCircle, Clock,
  Truck, Wrench, Building2, MoreVertical
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { adminCreateUser, adminDeleteUser, adminListUsers, adminUpdateUser } from '../../api/adminApi'

const ROLES_T = ['Transporter', 'Driver', 'Staff']
const ROLES_G = ['Garage Owner', 'Mechanic', 'Staff']
const ITEMS_PER_PAGE = 8

function toBackendRole(mode) {
  return mode === 'transport' ? 'transport' : 'garage'
}

function fromBackendRole(mode, role) {
  if (mode === 'transport') return role === 'transport' ? 'Transporter' : role
  return role === 'garage' ? 'Garage Owner' : role
}

function toJoinedAt(d) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toISOString().slice(0, 10)
  } catch {
    return '—'
  }
}

function UserModal({ mode, existing, onSave, onClose }) {
  const isTransport = mode === 'transport'
  const roles = isTransport ? ROLES_T : ROLES_G
  const [form, setForm] = useState(existing || {
    name: '', phone: '', email: '', role: roles[0]
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>{existing ? 'Edit User' : `Onboard ${isTransport ? 'Transport' : 'Garage'} User`}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form) }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div className="form-group">
            <label className="form-label">FULL NAME *</label>
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input type="text" className="form-input" placeholder="Name or Business Name" required value={form.name} onChange={set('name')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">PHONE</label>
              <div className="input-group">
                <Phone className="input-icon" size={18} />
                <input type="tel" className="form-input" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={set('email')} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ROLE / TYPE</label>
            <select className="form-input" value={form.role} onChange={set('role')}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-full">{existing ? 'Save Changes' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const { mode } = useAdmin()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'
  const roles = isTransport ? ROLES_T : ROLES_G

  const [users, setUsers] = useState([])
  const [fetching, setFetching] = useState(false)
  const [apiError, setApiError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // null | 'add' | { ...user }

  const loadUsers = async ({ q } = {}) => {
    setFetching(true)
    setApiError('')
    try {
      const res = await adminListUsers({ role: toBackendRole(mode), q })
      if (!res?.success) {
        setApiError(res?.message || 'Failed to load users')
        setUsers([])
        return
      }
      const rows = (res.users || []).map(u => ({
        id: u.id,
        name: u.name || '—',
        phone: u.phone || '—',
        email: u.email || '—',
        role: fromBackendRole(mode, u.role),
        status: u.setupComplete ? 'Active' : 'Inactive',
        joinedAt: toJoinedAt(u.createdAt),
      }))
      setUsers(rows)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load users'
      setApiError(msg)
      setUsers([])
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setSearch('')
    setStatusFilter('All')
    setRoleFilter('All')
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase()
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || u.status === statusFilter
      const matchRole = roleFilter === 'All' || u.role === roleFilter
      return matchSearch && matchStatus && matchRole
    })
  }, [users, search, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSave = async (form) => {
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        role: toBackendRole(mode),
        setupComplete: true,
      }
      if (modal?.id) {
        await adminUpdateUser(modal.id, { name: payload.name, email: payload.email, setupComplete: true })
      } else {
        await adminCreateUser(payload)
      }
      setModal(null)
      setPage(1)
      await loadUsers()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Save failed'
      setApiError(msg)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {isTransport ? <Truck size={16} color={accentColor} /> : <Wrench size={16} color={accentColor} />}
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isTransport ? 'Transport Mode' : 'Garage Mode'} · User Management
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Manage {isTransport ? 'transporters, drivers & staff' : 'garage owners, mechanics & staff'}
          </p>
        </div>
        <button className="btn btn-primary" style={{ background: accentColor, borderColor: accentColor }} onClick={() => setModal('add')}>
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: users.length, color: '#6366F1' },
          { label: 'Active', val: users.filter(u => u.status === 'Active').length, color: '#10B981' },
          { label: 'Inactive', val: users.filter(u => u.status === 'Inactive').length, color: '#EF4444' },
          { label: roles[0] + 's', val: users.filter(u => u.role === roles[0]).length, color: accentColor },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 20px', flex: '1 1 140px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: '2 1 260px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text" className="form-input" placeholder="Search by name, phone, email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: 44, height: 44 }}
            />
          </div>
          <select className="form-input" style={{ height: 44, minWidth: 140, fontWeight: 700 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="form-input" style={{ height: 44, minWidth: 160, fontWeight: 700 }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
            <option value="All">All Roles</option>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {(apiError || fetching) && (
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: apiError ? 'var(--danger)' : 'var(--text-muted)' }}>
              {apiError ? apiError : 'Loading users…'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => loadUsers({ q: search })} disabled={fetching}>
              Refresh
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['User', 'Contact', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${accentColor}20`, fontWeight: 900, color: accentColor, fontSize: '1rem'
                      }}>{(user.name || '?')[0].toUpperCase()}</div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>{user.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{user.phone || '—'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{user.email || '—'}</p>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800, padding: '5px 10px', borderRadius: 99,
                      background: `${accentColor}15`, color: accentColor
                    }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={async () => {
                        try {
                          const nextActive = user.status !== 'Active'
                          await adminUpdateUser(user.id, { setupComplete: nextActive })
                          await loadUsers({ q: search })
                        } catch (e) {
                          const msg = e?.response?.data?.message || e?.message || 'Update failed'
                          setApiError(msg)
                        }
                      }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99,
                        border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase',
                        background: user.status === 'Active' ? 'var(--success-light)' : '#FEE2E2',
                        color: user.status === 'Active' ? 'var(--success)' : 'var(--danger)',
                        transition: 'filter 0.2s'
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: user.status === 'Active' ? 'var(--success)' : 'var(--danger)' }} />
                      {user.status}
                    </button>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {user.joinedAt || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(user)} title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button className="btn btn-sm btn-icon" onClick={async () => {
                        try {
                          await adminDeleteUser(user.id)
                          await loadUsers({ q: search })
                        } catch (e) {
                          const msg = e?.response?.data?.message || e?.message || 'Delete failed'
                          setApiError(msg)
                        }
                      }} style={{ color: 'var(--danger)', background: '#FEE2E2', border: 'none' }} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <Users size={44} color="var(--text-muted)" strokeWidth={1.5} style={{ margin: '0 auto 14px' }} />
                  <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text-secondary)' }}>No users found</h3>
                  <p style={{ margin: '6px 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {users.length === 0 ? `Add your first ${isTransport ? 'transporter' : 'garage owner'}` : 'Try adjusting filters'}
                  </p>
                  {users.length === 0 && (
                    <button className="btn btn-primary" onClick={() => setModal('add')} style={{ background: accentColor, borderColor: accentColor }}>
                      <UserPlus size={16} /> Add First User
                    </button>
                  )}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <b>{paginated.length}</b> of <b>{filtered.length}</b> users
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i + 1)}
                style={page === i + 1 ? { background: accentColor, borderColor: accentColor } : {}}>
                {i + 1}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {modal && (
        <UserModal
          mode={mode}
          existing={modal !== 'add' ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        .animate-scaleIn { animation: scaleIn 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
