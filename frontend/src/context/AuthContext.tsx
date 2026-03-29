import { createContext, useContext, useState, type ReactNode } from 'react'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem('refreshToken'),
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? (JSON.parse(stored) as AuthUser) : null
  })

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
