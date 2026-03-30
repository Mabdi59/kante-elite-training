import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isCoach: boolean
  isStaff: boolean
  isPlayer: boolean
  loginUser: (token: string, refreshToken: string, user: AuthUser) => void
  logoutUser: () => void
  updateTokens: (token: string, refreshToken: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem('refreshToken'),
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? (JSON.parse(stored) as AuthUser) : null
  })

  useEffect(() => {
    const syncFromStorage = () => {
      const nextToken = localStorage.getItem('token')
      const nextRefreshToken = localStorage.getItem('refreshToken')
      const storedUser = localStorage.getItem('user')

      setToken(nextToken)
      setRefreshToken(nextRefreshToken)
      setUser(storedUser ? (JSON.parse(storedUser) as AuthUser) : null)
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
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        isCoach: user?.role === 'COACH' || user?.role === 'ADMIN',
        isStaff: user?.role === 'STAFF' || user?.role === 'ADMIN',
        isPlayer: user?.role === 'PLAYER' || user?.role === 'ADMIN',
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
