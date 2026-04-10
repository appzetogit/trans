import { useAuth } from '../../context/AuthContext'
import TransportDashboard from '../transport/TransportDashboard'
import GarageDashboard   from '../garage/GarageDashboard'
import AdminDashboard     from '../admin/AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role

  if (role === 'admin')     return <AdminDashboard />
  if (role === 'garage')    return <GarageDashboard />
  if (role === 'transport') return <TransportDashboard />

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h3>Invalid Role</h3>
      <p>Please contact support or re-login.</p>
    </div>
  )
}
