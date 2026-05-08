import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../services/api', () => ({
  getCoachProgressNotes: vi.fn().mockResolvedValue([
    {
      id: 1,
      playerEmail: 'alex@example.com',
      playerName: 'Alex Smith',
      coachEmail: 'coach@example.com',
      sessionDate: '2026-05-01',
      title: 'Great first touch',
      content: 'Showed excellent ball control during the warmup drills.',
      noteType: 'Technical',
      rating: 4,
      visibleToParent: true,
      createdAt: '2026-05-01T12:00:00Z',
    },
    {
      id: 2,
      playerEmail: 'jordan@example.com',
      playerName: 'Jordan Lee',
      coachEmail: 'coach@example.com',
      sessionDate: '2026-05-02',
      title: 'Positioning needs work',
      content: 'Struggled to hold defensive shape when tracking runners.',
      noteType: 'Tactical',
      rating: 3,
      visibleToParent: false,
      createdAt: '2026-05-02T12:00:00Z',
    },
  ]),
  getAttendanceByRange: vi.fn().mockResolvedValue([
    {
      id: 1,
      bookingId: 10,
      playerEmail: 'alex@example.com',
      playerName: 'Alex Smith',
      status: 'PRESENT',
      sessionDate: '2026-05-01',
      createdAt: '2026-05-01T12:00:00Z',
    },
    {
      id: 2,
      bookingId: 11,
      playerEmail: 'jordan@example.com',
      playerName: 'Jordan Lee',
      status: 'LATE',
      sessionDate: '2026-05-02',
      createdAt: '2026-05-02T12:00:00Z',
    },
    {
      id: 3,
      bookingId: 12,
      playerEmail: 'taylor@example.com',
      playerName: 'Taylor Brown',
      status: 'ABSENT',
      sessionDate: '2026-04-30',
      createdAt: '2026-04-30T12:00:00Z',
    },
  ]),
  createProgressNote: vi.fn(),
  updateProgressNote: vi.fn(),
  deleteProgressNote: vi.fn(),
  upsertAttendance: vi.fn(),
  deleteAttendanceRecord: vi.fn(),
}))

import CoachDashboardPage from '../pages/CoachDashboardPage'

describe('CoachDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard heading', async () => {
    render(
      <MemoryRouter>
        <CoachDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Coach Dashboard')).toBeInTheDocument()
  })

  it('displays attendance summary counts', async () => {
    render(
      <MemoryRouter>
        <CoachDashboardPage />
      </MemoryRouter>,
    )

    // Wait for data to load
    await screen.findByText('Coach Dashboard')

    // Attendance stats: 1 present, 1 late, 1 absent
    const presentLinks = await screen.findAllByText('1')
    expect(presentLinks.length).toBeGreaterThan(0)
  })

  it('shows recent progress notes', async () => {
    render(
      <MemoryRouter>
        <CoachDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Great first touch')).toBeInTheDocument()
    expect(screen.getByText('Positioning needs work')).toBeInTheDocument()
  })

  it('shows quick action buttons', async () => {
    render(
      <MemoryRouter>
        <CoachDashboardPage />
      </MemoryRouter>,
    )

    await screen.findByText('Coach Dashboard')
    expect(screen.getByText('+ New Progress Note')).toBeInTheDocument()
    expect(screen.getByText('+ Record Attendance')).toBeInTheDocument()
  })
})
