import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'
import type { UserRole } from '../types'

interface Props {
  children: ReactNode
  requireAdmin?: boolean
  requireRole?: UserRole
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireRole,
}: Props) {
  const { isAuthenticated, isAdmin, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (requireRole && user?.role !== requireRole && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
