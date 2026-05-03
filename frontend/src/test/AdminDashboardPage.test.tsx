import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock API calls before importing the page
vi.mock('../services/api', () => ({
  getAdminDashboard: vi.fn().mockResolvedValue({
    totalRegistrations: 42,
    confirmedRegistrations: 30,
    pendingWaitlistRegistrations: 8,
    cancelledRegistrations: 4,
    activePrograms: 3,
    totalPrograms: 5,
    totalEvents: 7,
    totalTournaments: 2,
    unreadMessages: 1,
    totalUsers: 100,
    totalCoaches: 6,
    totalPlayers: 50,
    totalFamilies: 15,
    totalActiveSeries: 3,
    pendingRegistrations: 5,
    usersWithRoleAdmin: 2,
    usersWithRoleCoach: 6,
    usersWithRoleUser: 92,
  }),
  getRegistrationsOverTime: vi.fn().mockResolvedValue([
    { date: '2026-05-01', count: 2 },
    { date: '2026-05-02', count: 4 },
  ]),
}))

import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the launch dashboard heading', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Run registrations, content, and tournaments from one place.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Launch Dashboard')).toBeInTheDocument()
  })

  it('renders launch operations and business area cards after data loads', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Total Registrations')).toBeInTheDocument()
    expect(screen.getByText('Pending / Waitlisted')).toBeInTheDocument()
    expect(screen.getByText('Registration Trend')).toBeInTheDocument()
    expect(screen.getByText('Tournaments')).toBeInTheDocument()
  })

  it('renders stat values from the API response', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('42')).toBeInTheDocument()
    expect(screen.getByText('3 active')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
