import axios, { type InternalAxiosRequestConfig } from 'axios'
import { refreshAccessToken } from '@/features/auth/api/authApi'

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'https://coms.kru.ac.th/boatapi/api' })
let refreshingToken: Promise<string> | null = null

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function clearSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('authUser')
}

async function getNewAccessToken(): Promise<string> {
  if (refreshingToken) return refreshingToken

  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('ไม่พบ refresh token')

  refreshingToken = refreshAccessToken(refreshToken)
    .then((tokens) => {
      localStorage.setItem('accessToken', tokens.accessToken)
      if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken)
      return tokens.accessToken
    })
    .finally(() => { refreshingToken = null })

  return refreshingToken
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as RetryableRequestConfig | undefined
    const hasAccessToken = Boolean(localStorage.getItem('accessToken'))

    if (error.response?.status !== 401 || !request || request._retriedAfterRefresh || !hasAccessToken) {
      return Promise.reject(error)
    }

    request._retriedAfterRefresh = true
    try {
      const accessToken = await getNewAccessToken()
      request.headers.Authorization = `Bearer ${accessToken}`
      return http(request)
    } catch {
      clearSession()
      if (window.location.pathname !== '/login') window.location.assign('/login')
      return Promise.reject(error)
    }
  },
)

export default http
