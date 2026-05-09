import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

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
    usersWithRoleAdmin: 2,
    usersWithRoleCoach: 6,
    usersWithRoleUser: 40,
  }),
  getAdminBookings: vi.fn().mockResolvedValue([
    {
      id: 1,
      programId: 10,
      programName: 'Elite Group',
      programSlug: 'elite-group',
      bookingDate: '2026-05-01',
      bookingTime: '18:00',
      playerName: 'Alex',
      email: 'alex@example.com',
      phone: '123',
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: '2026-05-01T12:00:00Z',
    },
    {
      id: 2,
      programId: 11,
      programName: 'Speed Clinic',
      programSlug: 'speed-clinic',
      bookingDate: '2026-05-02',
      bookingTime: '19:00',
      playerName: 'Jordan',
      email: 'jordan@example.com',
      phone: '456',
      paymentStatus: 'PENDING',
      bookingStatus: 'RESERVED',
      createdAt: '2026-05-02T12:00:00Z',
    },
    {
      id: 3,
      programId: 10,
      programName: 'Elite Group',
      programSlug: 'elite-group',
      bookingDate: '2026-05-03',
      bookingTime: '17:00',
      playerName: 'Taylor',
      email: 'taylor@example.com',
      phone: '789',
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: '2026-05-03T12:00:00Z',
    },
  ]),
  getAdminPrograms: vi.fn().mockResolvedValue([
    {
      id: 10,
      name: 'Elite Group',
      slug: 'elite-group',
      description: '',
      shortDescription: '',
      price: 120,
      priceLabel: '$120',
      durationMinutes: 60,
      features: [],
      icon: 'star',
      whoItsFor: '',
      displayOrder: 1,
    },
    {
      id: 11,
      name: 'Speed Clinic',
      slug: 'speed-clinic',
      description: '',
      shortDescription: '',
      price: 90,
      priceLabel: '$90',
      durationMinutes: 60,
      features: [],
      icon: 'bolt',
      whoItsFor: '',
      displayOrder: 2,
    },
  ]),
  getAttendanceByRange: vi.fn().mockResolvedValue([
    {
      id: 1,
      bookingId: 1,
      playerEmail: 'alex@example.com',
      playerName: 'Alex',
      status: 'PRESENT',
      sessionDate: '2026-05-01',
      createdAt: '2026-05-01T12:00:00Z',
    },
    {
      id: 2,
      bookingId: 2,
      playerEmail: 'jordan@example.com',
      playerName: 'Jordan',
      status: 'LATE',
      sessionDate: '2026-05-02',
      createdAt: '2026-05-02T12:00:00Z',
    },
    {
      id: 3,
      bookingId: 3,
      playerEmail: 'taylor@example.com',
      playerName: 'Taylor',
      status: 'ABSENT',
      sessionDate: '2026-05-03',
      createdAt: '2026-05-03T12:00:00Z',
    },
  ]),
  getBookingsOverTime: vi.fn().mockResolvedValue([
    { date: '2026-04-01', count: 4 },
    { date: '2026-04-02', count: 6 },
  ]),
}))

import AdminReportsPage from '../pages/admin/AdminReportsPage'

describe('AdminReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the reports heading and primary sections', async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Track bookings, attendance, and launch performance.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Booking Trend')).toBeInTheDocument()
    expect(screen.getByText('Program Popularity')).toBeInTheDocument()
    expect(screen.getByText('Account Mix')).toBeInTheDocument()
  })

  it('renders derived summary values from the mocked data', async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>,
    )

    expect((await screen.findAllByText('$240')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('$90')).length).toBeGreaterThan(0)
    expect(screen.getByText('67%')).toBeInTheDocument()
    expect(screen.getByText('Elite Group')).toBeInTheDocument()
  })
})
