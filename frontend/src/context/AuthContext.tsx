/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  loginUser: (token: string, refreshToken: string, user: AuthUser) => void
  logoutUser: () => void
  updateTokens: (token: string, refreshToken: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession() {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return { token, refreshToken, user: null as AuthUser | null }
  }

  try {
    return {
      token,
      refreshToken,
      user: JSON.parse(storedUser) as AuthUser,
    }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    return { token: null, refreshToken: null, user: null as AuthUser | null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialSession = readStoredSession()
  const [token, setToken] = useState<string | null>(() => initialSession.token)
  const [refreshToken, setRefreshToken] = useState<string | null>(() => initialSession.refreshToken)
  const [user, setUser] = useState<AuthUser | null>(() => initialSession.user)

  useEffect(() => {
    const syncFromStorage = () => {
      const nextSession = readStoredSession()

      setToken(nextSession.token)
      setRefreshToken(nextSession.refreshToken)
      setUser(nextSession.user)
    }

    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('auth-state-changed', syncFromStorage)

    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('auth-state-changed', syncFromStorage)
    }
  }, [])

  const loginUser = (newToken: string, newRefreshToken: string, newUser: AuthUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setRefreshToken(newRefreshToken)
    setUser(newUser)
  }

  const updateTokens = (newToken: string, newRefreshToken: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    setToken(newToken)
    setRefreshToken(newRefreshToken)
  }

  const logoutUser = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    window.dispatchEvent(new Event('auth-state-changed'))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        loginUser,
        logoutUser,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
