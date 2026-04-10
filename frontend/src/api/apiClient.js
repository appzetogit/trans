import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (_) {
    // ignore
  }
  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  // Use a separate client without interceptors to avoid infinite loops.
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })
  const { data } = await client.post('/auth/refresh')
  return data
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config
    if (!originalRequest) throw error

    if (status !== 401 || originalRequest._retry) {
      throw error
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
      }
      const refreshed = await refreshPromise
      if (refreshed?.accessToken) {
        localStorage.setItem('access_token', refreshed.accessToken)
        if (refreshed?.user) localStorage.setItem('billing_user', JSON.stringify(refreshed.user))
      }

      originalRequest.headers = originalRequest.headers || {}
      const token = localStorage.getItem('access_token')
      if (token) originalRequest.headers.Authorization = `Bearer ${token}`

      return apiClient(originalRequest)
    } catch (e) {
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('billing_user')
      } catch (_) {
        // ignore
      }
      // Ensure we land on an auth entrypoint (framework-agnostic).
      // Important: do NOT kick users off public auth routes like /admin.
      const path = window.location.pathname
      const isPublicAuthRoute =
        path === '/login' ||
        path === '/admin' ||
        path === '/admin-login' ||
        path === '/otp' ||
        path === '/role-select' ||
        path.startsWith('/register/')

      if (!isPublicAuthRoute) window.location.href = '/login'
      throw e
    }
  }
)

