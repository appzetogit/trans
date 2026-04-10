import { apiClient } from './apiClient'

export async function adminListUsers({ role, q } = {}) {
  const params = {}
  if (role) params.role = role
  if (q) params.q = q
  const { data } = await apiClient.get('/admin/users', { params })
  return data
}

export async function adminCreateUser(payload) {
  const { data } = await apiClient.post('/admin/users', payload)
  return data
}

export async function adminUpdateUser(id, patch) {
  const { data } = await apiClient.patch(`/admin/users/${id}`, patch)
  return data
}

export async function adminDeleteUser(id) {
  const { data } = await apiClient.delete(`/admin/users/${id}`)
  return data
}

