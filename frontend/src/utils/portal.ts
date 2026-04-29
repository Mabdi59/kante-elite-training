import type { UserRole } from '../types'

export type PortalDestination = {
  path: string
  navLabel: string
  returnLabel: string
}

export function getPortalDestination(role?: UserRole | null): PortalDestination | null {
  if (!role) return null

  if (role === 'ADMIN') {
    return {
      path: '/admin',
      navLabel: 'Admin',
      returnLabel: 'Back to Admin Dashboard',
    }
  }

  if (role === 'TEAM_CAPTAIN' || role === 'COACH') {
    return {
      path: '/captain/registrations',
      navLabel: 'Team Portal',
      returnLabel: 'Back to Team Portal',
    }
  }

  return {
    path: '/account',
    navLabel: 'Account',
    returnLabel: 'Back to My Account',
  }
}

export function getPostAuthRedirect(role?: UserRole | null) {
  return getPortalDestination(role)?.path ?? '/account'
}
