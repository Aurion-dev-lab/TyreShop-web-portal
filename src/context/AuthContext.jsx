import { createContext, useContext, useLayoutEffect, useState } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(
    localStorage.getItem('accessToken')
  )
  const isAuthenticated = !!accessToken

  useLayoutEffect(() => {
    const req = api.interceptors.request.use(
      (config) => {
        console.log('🔵 Request URL:', config.url)
        const isAuthRequest = config.url?.includes('/auth/login')

        if (!isAuthRequest && accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    const res = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config
        if (!original) return Promise.reject(error)

        const isAuthRequest = original.url?.includes('/auth/login')

        if (error.response?.status === 401 && !isAuthRequest) {
          logout()
        }

        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.request.eject(req)
      api.interceptors.response.eject(res)
    }
  }, [accessToken])

  const login = async (credentials) => {
    const res = await api.post('auth/login', credentials)
    const token = res.data?.data?.accessToken

    localStorage.setItem('accessToken', token)
    setAccessTokenState(token)
    return res
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setAccessTokenState(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}