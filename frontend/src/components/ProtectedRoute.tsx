import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'
import type { UserRole } from '../types'

interface Props {
  children: ReactNode
  requireAdmin?: boolean
  requireRole?: UserRole
  requireRoles?: UserRole[]
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireRole,
  requireRoles,
}: Props) {
  const location = useLocation()
  const { isAuthenticated, isAdmin, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireRole && user?.role !== requireRole && !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireRoles && !requireRoles.includes(user?.role as UserRole) && !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
