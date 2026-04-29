import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock API calls before importing the page
vi.mock('../services/api', () => ({
  getAdminDashboard: vi.fn().mockResolvedValue({
    totalBookings: 42,
    confirmedBookings: 30,
    pendingBookings: 8,
    cancelledBookings: 4,
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
  }),
  getBookingsOverTime: vi.fn().mockResolvedValue([
    { date: '2026-04-01', count: 5 },
    { date: '2026-04-02', count: 8 },
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
      await screen.findByText('Run bookings, content, and tournaments from one place.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Launch Dashboard')).toBeInTheDocument()
  })

  it('renders launch operations and business area cards after data loads', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Total Bookings')).toBeInTheDocument()
    expect(screen.getByText('Pending Bookings')).toBeInTheDocument()
    expect(screen.getByText('Pending Team Registrations')).toBeInTheDocument()
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
