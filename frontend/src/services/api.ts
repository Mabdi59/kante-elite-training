import axios from 'axios'
import type {
  ApiResponse,
  Program,
  Event,
  Testimonial,
  Booking,
  AvailabilityData,
  BookingFormData,
  ContactFormData,
  AuthResponse,
  UserRole,
  Tournament,
  TournamentMatch,
  TournamentMatchFormData,
  TournamentWorkflow,
  TeamRegistration,
  TeamPlayer,
  TeamPlayerFormData,
  TeamRegistrationFormData,
  AdminTeamRegistrationFormData,
  TournamentRegistrationDashboard,
  TournamentPaymentCheckout,
  ManualTournamentPaymentFormData,
  ContactMessage,
  AdminDashboard,
  StaffDashboard,
  CaptainDashboard,
  AdminUser,
  AdminUserFormData,
  AuditLog,
  AvailabilityRule,
  BlockedSlot,
  CoachProfile,
  CoachProfileFormData,
  AdminPlayerFormData,
  PlayerProfile,
  PlayerProfileFormData,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Auth Request Interceptor ─────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── 401 Response Interceptor (auto-refresh) ─────────────────────────────────

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (
      (status === 401 || status === 403) &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      const storedRefresh = localStorage.getItem('refreshToken')
      if (!storedRefresh) {
        // No refresh token, clear session
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth-state-changed'))
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(api(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post<ApiResponse<AuthResponse>>('/api/auth/refresh', {
          refreshToken: storedRefresh,
        })
        const data = res.data.data!
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem(
          'user',
          JSON.stringify({ email: data.email, name: data.name, role: data.role }),
        )
        window.dispatchEvent(new Event('auth-state-changed'))

        // Flush queued requests
        refreshQueue.forEach((cb) => cb(data.token))
        refreshQueue = []

        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth-state-changed'))
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

// ─── Programs ─────────────────────────────────────────────────────────────────

export const getPrograms = async (): Promise<Program[]> => {
  const res = await api.get<ApiResponse<Program[]>>('/programs')
  return res.data.data ?? []
}

export const getProgramById = async (id: number): Promise<Program> => {
  const res = await api.get<ApiResponse<Program>>(`/programs/${id}`)
  return res.data.data!
}

// ─── Events ───────────────────────────────────────────────────────────────────

export const getEvents = async (): Promise<Event[]> => {
  const res = await api.get<ApiResponse<Event[]>>('/events')
  return res.data.data ?? []
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const res = await api.get<ApiResponse<Testimonial[]>>('/testimonials')
  return res.data.data ?? []
}

export const getFeaturedTestimonials = async (): Promise<Testimonial[]> => {
  const res = await api.get<ApiResponse<Testimonial[]>>('/testimonials/featured')
  return res.data.data ?? []
}

// ─── Availability ─────────────────────────────────────────────────────────────

export const getAvailability = async (
  programId: number,
  date: string,
): Promise<AvailabilityData> => {
  const res = await api.get<ApiResponse<AvailabilityData>>('/availability', {
    params: { programId, date },
  })
  return res.data.data!
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const createBooking = async (formData: BookingFormData): Promise<Booking> => {
  const res = await api.post<ApiResponse<Booking>>('/bookings', formData)
  if (!res.data.data) throw new Error('No booking data returned')
  return res.data.data
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export const submitContact = async (data: ContactFormData): Promise<string> => {
  const res = await api.post<ApiResponse<null>>('/contact', data)
  return res.data.message ?? 'Message sent successfully.'
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (
  email: string,
  password: string,
  requestedRole?: UserRole,
): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
    email,
    password,
    requestedRole,
  })
  return res.data.data!
}

export const register = async (
  name: string,
  email: string,
  password: string,
  requestedRole?: UserRole,
): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    name,
    email,
    password,
    requestedRole,
  })
  return res.data.data!
}

export const claimTeamCaptainAccess = async (): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/claim-team-captain', {})
  return res.data.data!
}

export const refreshTokens = async (refreshToken: string): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken })
  return res.data.data!
}

export const logoutApi = async (refreshToken: string): Promise<void> => {
  await api.post('/auth/logout', { refreshToken })
}

export const forgotPassword = async (email: string): Promise<string> => {
  const res = await api.post<ApiResponse<null>>('/auth/forgot-password', { email })
  return res.data.message ?? 'If that email is registered, a reset link has been sent.'
}

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  const res = await api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword })
  return res.data.message ?? 'Password reset successful.'
}

// ─── User Account ─────────────────────────────────────────────────────────────

export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/account/bookings')
  return res.data.data ?? []
}

export const cancelMyBooking = async (id: number): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/account/bookings/${id}/cancel`, {})
  return res.data.data!
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export const getTournaments = async (): Promise<Tournament[]> => {
  const res = await api.get<ApiResponse<Tournament[]>>('/tournaments')
  return res.data.data ?? []
}

export const getTournamentById = async (id: number): Promise<Tournament> => {
  const res = await api.get<ApiResponse<Tournament>>(`/tournaments/${id}`)
  return res.data.data!
}

export const registerTeam = async (data: TeamRegistrationFormData): Promise<TeamRegistration> => {
  const res = await api.post<ApiResponse<TeamRegistration>>('/teams/register', data)
  return res.data.data!
}

export const getPublicTournamentRegistration = async (
  token: string,
): Promise<TournamentRegistrationDashboard> => {
  const res = await api.get<ApiResponse<TournamentRegistrationDashboard>>(
    `/tournaments/registrations/access/${token}`,
  )
  return res.data.data!
}

export const submitTournamentRoster = async (
  token: string,
  payload: { rosterText?: string; rosterFile?: File | null },
): Promise<TournamentRegistrationDashboard> => {
  const formData = new FormData()
  if (payload.rosterText?.trim()) {
    formData.append('rosterText', payload.rosterText.trim())
  }
  if (payload.rosterFile) {
    formData.append('rosterFile', payload.rosterFile)
  }

  const res = await api.post<ApiResponse<TournamentRegistrationDashboard>>(
    `/tournaments/registrations/access/${token}/roster`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return res.data.data!
}

export const submitTournamentManualPayment = async (
  token: string,
  data: ManualTournamentPaymentFormData,
): Promise<TournamentRegistrationDashboard> => {
  const res = await api.post<ApiResponse<TournamentRegistrationDashboard>>(
    `/tournaments/registrations/access/${token}/payment/manual`,
    data,
  )
  return res.data.data!
}

export const createTournamentPaymentCheckout = async (
  token: string,
): Promise<TournamentPaymentCheckout> => {
  const res = await api.post<ApiResponse<TournamentPaymentCheckout>>(
    `/tournaments/registrations/access/${token}/payment/checkout`,
    {},
  )
  return res.data.data!
}

export const getCaptainDashboard = async (): Promise<CaptainDashboard> => {
  const res = await api.get<ApiResponse<CaptainDashboard>>('/captain/dashboard')
  return res.data.data!
}

export const getCaptainRegistrations = async (): Promise<TeamRegistration[]> => {
  const res = await api.get<ApiResponse<TeamRegistration[]>>('/captain/registrations')
  return res.data.data ?? []
}

export const createCaptainRegistration = async (
  data: TeamRegistrationFormData,
): Promise<TeamRegistration> => {
  const res = await api.post<ApiResponse<TeamRegistration>>('/captain/registrations', data)
  return res.data.data!
}

export const updateCaptainRegistration = async (
  id: number,
  data: TeamRegistrationFormData,
): Promise<TeamRegistration> => {
  const res = await api.put<ApiResponse<TeamRegistration>>(`/captain/registrations/${id}`, data)
  return res.data.data!
}

export const deleteCaptainRegistration = async (id: number): Promise<void> => {
  await api.delete(`/captain/registrations/${id}`)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const res = await api.get<ApiResponse<AdminDashboard>>('/admin/dashboard')
  return res.data.data!
}

export const getAdminBookings = async (params?: {
  status?: string
  date?: string
}): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/admin/bookings', { params })
  return res.data.data ?? []
}

export const updateBookingStatus = async (id: number, status: string): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/admin/bookings/${id}/status`, { status })
  return res.data.data!
}

export const rescheduleBooking = async (
  id: number,
  newDate: string,
  newTime: string,
): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/admin/bookings/${id}/reschedule`, {
    newDate,
    newTime,
  })
  return res.data.data!
}

export const getAdminPrograms = async (): Promise<Program[]> => {
  const res = await api.get<ApiResponse<Program[]>>('/admin/programs')
  return res.data.data ?? []
}

export const createProgram = async (data: Partial<Program>): Promise<Program> => {
  const res = await api.post<ApiResponse<Program>>('/admin/programs', data)
  return res.data.data!
}

export const updateProgram = async (id: number, data: Partial<Program>): Promise<Program> => {
  const res = await api.put<ApiResponse<Program>>(`/admin/programs/${id}`, data)
  return res.data.data!
}

export const deleteProgram = async (id: number): Promise<void> => {
  await api.delete(`/admin/programs/${id}`)
}

export const getAdminEvents = async (): Promise<Event[]> => {
  const res = await api.get<ApiResponse<Event[]>>('/admin/events')
  return res.data.data ?? []
}

export const createEvent = async (data: Partial<Event>): Promise<Event> => {
  const res = await api.post<ApiResponse<Event>>('/admin/events', data)
  return res.data.data!
}

export const updateEvent = async (id: number, data: Partial<Event>): Promise<Event> => {
  const res = await api.put<ApiResponse<Event>>(`/admin/events/${id}`, data)
  return res.data.data!
}

export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete(`/admin/events/${id}`)
}

export const getAdminTestimonials = async (): Promise<Testimonial[]> => {
  const res = await api.get<ApiResponse<Testimonial[]>>('/admin/testimonials')
  return res.data.data ?? []
}

export const createTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
  const res = await api.post<ApiResponse<Testimonial>>('/admin/testimonials', data)
  return res.data.data!
}

export const updateTestimonial = async (
  id: number,
  data: Partial<Testimonial>,
): Promise<Testimonial> => {
  const res = await api.put<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, data)
  return res.data.data!
}

export const deleteTestimonial = async (id: number): Promise<void> => {
  await api.delete(`/admin/testimonials/${id}`)
}

export const getAdminMessages = async (): Promise<ContactMessage[]> => {
  const res = await api.get<ApiResponse<ContactMessage[]>>('/admin/messages')
  return res.data.data ?? []
}

export const markMessageAsRead = async (id: number): Promise<ContactMessage> => {
  const res = await api.patch<ApiResponse<ContactMessage>>(`/admin/messages/${id}/read`, {})
  return res.data.data!
}

export const deleteAdminMessage = async (id: number): Promise<void> => {
  await api.delete(`/admin/messages/${id}`)
}

export const getAdminTournaments = async (): Promise<Tournament[]> => {
  const res = await api.get<ApiResponse<Tournament[]>>('/admin/tournaments')
  return res.data.data ?? []
}

export const getAdminTournamentWorkflow = async (id: number): Promise<TournamentWorkflow> => {
  const res = await api.get<ApiResponse<TournamentWorkflow>>(`/admin/tournaments/${id}/workflow`)
  return res.data.data!
}

export const createTournament = async (data: Partial<Tournament>): Promise<Tournament> => {
  const res = await api.post<ApiResponse<Tournament>>('/admin/tournaments', data)
  return res.data.data!
}

export const updateTournament = async (
  id: number,
  data: Partial<Tournament>,
): Promise<Tournament> => {
  const res = await api.put<ApiResponse<Tournament>>(`/admin/tournaments/${id}`, data)
  return res.data.data!
}

export const duplicateTournament = async (
  id: number,
  includeData: boolean,
): Promise<Tournament> => {
  const res = await api.post<ApiResponse<Tournament>>(
    `/admin/tournaments/${id}/duplicate`,
    undefined,
    { params: { includeData } },
  )
  return res.data.data!
}

export const deleteTournament = async (id: number): Promise<void> => {
  await api.delete(`/admin/tournaments/${id}`)
}

export const getTournamentRegistrations = async (id: number): Promise<TeamRegistration[]> => {
  const res = await api.get<ApiResponse<TeamRegistration[]>>(`/tournaments/${id}/registrations`)
  return res.data.data ?? []
}

export const createAdminTournamentRegistration = async (
  data: AdminTeamRegistrationFormData,
): Promise<TeamRegistration> => {
  const res = await api.post<ApiResponse<TeamRegistration>>('/admin/tournaments/registrations', data)
  return res.data.data!
}

export const updateAdminTournamentRegistration = async (
  regId: number,
  data: AdminTeamRegistrationFormData,
): Promise<TeamRegistration> => {
  const res = await api.put<ApiResponse<TeamRegistration>>(
    `/admin/tournaments/registrations/${regId}`,
    data,
  )
  return res.data.data!
}

export const deleteAdminTournamentRegistration = async (regId: number): Promise<void> => {
  await api.delete(`/admin/tournaments/registrations/${regId}`)
}

export const updateRegistrationStatus = async (
  regId: number,
  status: string,
): Promise<TeamRegistration> => {
  const res = await api.patch<ApiResponse<TeamRegistration>>(
    `/admin/tournaments/registrations/${regId}/status`,
    { status },
  )
  return res.data.data!
}

export const updateRegistrationPaymentStatus = async (
  regId: number,
  paymentStatus: string,
): Promise<TeamRegistration> => {
  const res = await api.patch<ApiResponse<TeamRegistration>>(
    `/admin/tournaments/registrations/${regId}/payment`,
    { paymentStatus },
  )
  return res.data.data!
}

export const createTournamentTeamPlayer = async (
  tournamentId: number,
  teamId: number,
  data: TeamPlayerFormData,
): Promise<TeamPlayer> => {
  const res = await api.post<ApiResponse<TeamPlayer>>(
    `/admin/tournaments/${tournamentId}/teams/${teamId}/players`,
    data,
  )
  return res.data.data!
}

export const updateTournamentTeamPlayer = async (
  tournamentId: number,
  teamId: number,
  playerId: number,
  data: TeamPlayerFormData,
): Promise<TeamPlayer> => {
  const res = await api.put<ApiResponse<TeamPlayer>>(
    `/admin/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
    data,
  )
  return res.data.data!
}

export const deleteTournamentTeamPlayer = async (
  tournamentId: number,
  teamId: number,
  playerId: number,
): Promise<void> => {
  await api.delete(`/admin/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`)
}

export const createTournamentMatch = async (
  tournamentId: number,
  data: TournamentMatchFormData,
): Promise<TournamentMatch> => {
  const payload = {
    ...data,
    homeScore: data.homeScore === '' ? undefined : data.homeScore,
    awayScore: data.awayScore === '' ? undefined : data.awayScore,
  }
  const res = await api.post<ApiResponse<TournamentMatch>>(
    `/admin/tournaments/${tournamentId}/matches`,
    payload,
  )
  return res.data.data!
}

export const updateTournamentMatch = async (
  tournamentId: number,
  matchId: number,
  data: TournamentMatchFormData,
): Promise<TournamentMatch> => {
  const payload = {
    ...data,
    homeScore: data.homeScore === '' ? undefined : data.homeScore,
    awayScore: data.awayScore === '' ? undefined : data.awayScore,
  }
  const res = await api.put<ApiResponse<TournamentMatch>>(
    `/admin/tournaments/${tournamentId}/matches/${matchId}`,
    payload,
  )
  return res.data.data!
}

export const deleteTournamentMatch = async (tournamentId: number, matchId: number): Promise<void> => {
  await api.delete(`/admin/tournaments/${tournamentId}/matches/${matchId}`)
}

export const generateTournamentSchedule = async (
  tournamentId: number,
  overwrite = false,
): Promise<TournamentMatch[]> => {
  const res = await api.post<ApiResponse<TournamentMatch[]>>(
    `/admin/tournaments/${tournamentId}/matches/generate`,
    undefined,
    { params: { overwrite } },
  )
  return res.data.data ?? []
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get<ApiResponse<AdminUser[]>>('/admin/users')
  return res.data.data ?? []
}

export const createAdminUser = async (data: AdminUserFormData): Promise<AdminUser> => {
  const res = await api.post<ApiResponse<AdminUser>>('/admin/users', data)
  return res.data.data!
}

export const updateAdminUser = async (
  id: number,
  data: AdminUserFormData,
): Promise<AdminUser> => {
  const res = await api.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data)
  return res.data.data!
}

export const updateUserRole = async (id: number, role: string): Promise<AdminUser> => {
  const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role })
  return res.data.data!
}

export const deleteAdminUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`)
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const res = await api.get<ApiResponse<AuditLog[]>>('/admin/audit-logs')
  return res.data.data ?? []
}

// ─── Admin Availability ───────────────────────────────────────────────────────

export const getAvailabilityRules = async (): Promise<AvailabilityRule[]> => {
  const res = await api.get<ApiResponse<AvailabilityRule[]>>('/admin/availability/rules')
  return res.data.data ?? []
}

export const createAvailabilityRule = async (
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.post<ApiResponse<AvailabilityRule>>('/admin/availability/rules', data)
  return res.data.data!
}

export const updateAvailabilityRule = async (
  id: number,
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.put<ApiResponse<AvailabilityRule>>(`/admin/availability/rules/${id}`, data)
  return res.data.data!
}

export const deleteAvailabilityRule = async (id: number): Promise<void> => {
  await api.delete(`/admin/availability/rules/${id}`)
}

export const getBlockedSlots = async (): Promise<BlockedSlot[]> => {
  const res = await api.get<ApiResponse<BlockedSlot[]>>('/admin/availability/blocked')
  return res.data.data ?? []
}

export const createBlockedSlot = async (data: Partial<BlockedSlot>): Promise<BlockedSlot> => {
  const res = await api.post<ApiResponse<BlockedSlot>>('/admin/availability/blocked', data)
  return res.data.data!
}

export const updateBlockedSlot = async (
  id: number,
  data: Partial<BlockedSlot>,
): Promise<BlockedSlot> => {
  const res = await api.put<ApiResponse<BlockedSlot>>(`/admin/availability/blocked/${id}`, data)
  return res.data.data!
}

export const deleteBlockedSlot = async (id: number): Promise<void> => {
  await api.delete(`/admin/availability/blocked/${id}`)
}

// ─── Admin Coaches ────────────────────────────────────────────────────────────

export const getAdminCoaches = async (): Promise<CoachProfile[]> => {
  const res = await api.get<ApiResponse<CoachProfile[]>>('/admin/coaches')
  return res.data.data ?? []
}

export const createCoachProfile = async (
  userId: number,
  data: CoachProfileFormData,
): Promise<CoachProfile> => {
  const res = await api.post<ApiResponse<CoachProfile>>(`/admin/coaches/${userId}`, data)
  return res.data.data!
}

export const updateCoachProfile = async (
  id: number,
  data: CoachProfileFormData,
): Promise<CoachProfile> => {
  const res = await api.put<ApiResponse<CoachProfile>>(`/admin/coaches/${id}`, data)
  return res.data.data!
}

export const deleteCoachProfile = async (id: number): Promise<void> => {
  await api.delete(`/admin/coaches/${id}`)
}

// ─── Admin Players ────────────────────────────────────────────────────────────

export const getAdminPlayers = async (): Promise<PlayerProfile[]> => {
  const res = await api.get<ApiResponse<PlayerProfile[]>>('/admin/players')
  return res.data.data ?? []
}

export const createAdminPlayer = async (
  data: AdminPlayerFormData,
): Promise<PlayerProfile> => {
  const res = await api.post<ApiResponse<PlayerProfile>>('/admin/players', data)
  return res.data.data!
}

export const updateAdminPlayer = async (
  id: number,
  data: AdminPlayerFormData,
): Promise<PlayerProfile> => {
  const res = await api.put<ApiResponse<PlayerProfile>>(`/admin/players/${id}`, data)
  return res.data.data!
}

export const deleteAdminPlayer = async (id: number): Promise<void> => {
  await api.delete(`/admin/players/${id}`)
}

// ─── Coach Dashboard ──────────────────────────────────────────────────────────

export const getMyCoachProfile = async (): Promise<CoachProfile | null> => {
  const res = await api.get<ApiResponse<CoachProfile>>('/coach/profile')
  return res.data.data ?? null
}

export const updateMyCoachProfile = async (data: CoachProfileFormData): Promise<CoachProfile> => {
  const res = await api.put<ApiResponse<CoachProfile>>('/coach/profile', data)
  return res.data.data!
}

export const getMyCoachSessions = async (): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/coach/sessions')
  return res.data.data ?? []
}

export const updateCoachSessionStatus = async (
  id: number,
  status: string,
): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/coach/sessions/${id}/status`, { status })
  return res.data.data!
}

export const rescheduleCoachSession = async (
  id: number,
  newDate: string,
  newTime: string,
): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/coach/sessions/${id}/reschedule`, {
    newDate,
    newTime,
  })
  return res.data.data!
}

export const getCoachAvailabilityRules = async (): Promise<AvailabilityRule[]> => {
  const res = await api.get<ApiResponse<AvailabilityRule[]>>('/coach/availability/rules')
  return res.data.data ?? []
}

export const createCoachAvailabilityRule = async (
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.post<ApiResponse<AvailabilityRule>>('/coach/availability/rules', data)
  return res.data.data!
}

export const updateCoachAvailabilityRule = async (
  id: number,
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.put<ApiResponse<AvailabilityRule>>(`/coach/availability/rules/${id}`, data)
  return res.data.data!
}

export const deleteCoachAvailabilityRule = async (id: number): Promise<void> => {
  await api.delete(`/coach/availability/rules/${id}`)
}

export const getCoachBlockedSlots = async (): Promise<BlockedSlot[]> => {
  const res = await api.get<ApiResponse<BlockedSlot[]>>('/coach/availability/blocked')
  return res.data.data ?? []
}

export const createCoachBlockedSlot = async (
  data: Partial<BlockedSlot>,
): Promise<BlockedSlot> => {
  const res = await api.post<ApiResponse<BlockedSlot>>('/coach/availability/blocked', data)
  return res.data.data!
}

export const updateCoachBlockedSlot = async (
  id: number,
  data: Partial<BlockedSlot>,
): Promise<BlockedSlot> => {
  const res = await api.put<ApiResponse<BlockedSlot>>(`/coach/availability/blocked/${id}`, data)
  return res.data.data!
}

export const deleteCoachBlockedSlot = async (id: number): Promise<void> => {
  await api.delete(`/coach/availability/blocked/${id}`)
}

// ─── Account Player Profiles ──────────────────────────────────────────────────

export const getMyPlayers = async (): Promise<PlayerProfile[]> => {
  const res = await api.get<ApiResponse<PlayerProfile[]>>('/account/players')
  return res.data.data ?? []
}

export const addPlayerProfile = async (data: PlayerProfileFormData): Promise<PlayerProfile> => {
  const res = await api.post<ApiResponse<PlayerProfile>>('/account/players', data)
  return res.data.data!
}

export const updatePlayerProfile = async (
  id: number,
  data: PlayerProfileFormData,
): Promise<PlayerProfile> => {
  const res = await api.put<ApiResponse<PlayerProfile>>(`/account/players/${id}`, data)
  return res.data.data!
}

export const removePlayerProfile = async (id: number): Promise<void> => {
  await api.delete(`/account/players/${id}`)
}

export const getStaffDashboard = async (): Promise<StaffDashboard> => {
  const res = await api.get<ApiResponse<StaffDashboard>>('/staff/dashboard')
  return res.data.data!
}

export const getStaffBookings = async (): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/staff/bookings')
  return res.data.data ?? []
}

export const createStaffBooking = async (data: BookingFormData): Promise<Booking> => {
  const res = await api.post<ApiResponse<Booking>>('/staff/bookings', data)
  return res.data.data!
}

export const updateStaffBookingStatus = async (id: number, status: string): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/staff/bookings/${id}/status`, { status })
  return res.data.data!
}

export const rescheduleStaffBooking = async (
  id: number,
  newDate: string,
  newTime: string,
): Promise<Booking> => {
  const res = await api.patch<ApiResponse<Booking>>(`/staff/bookings/${id}/reschedule`, {
    newDate,
    newTime,
  })
  return res.data.data!
}

export const getStaffMessages = async (): Promise<ContactMessage[]> => {
  const res = await api.get<ApiResponse<ContactMessage[]>>('/staff/messages')
  return res.data.data ?? []
}

export const markStaffMessageAsRead = async (id: number): Promise<ContactMessage> => {
  const res = await api.patch<ApiResponse<ContactMessage>>(`/staff/messages/${id}/read`, {})
  return res.data.data!
}

export const deleteStaffMessage = async (id: number): Promise<void> => {
  await api.delete(`/staff/messages/${id}`)
}

export const getStaffAvailabilityRules = async (): Promise<AvailabilityRule[]> => {
  const res = await api.get<ApiResponse<AvailabilityRule[]>>('/staff/availability/rules')
  return res.data.data ?? []
}

export const createStaffAvailabilityRule = async (
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.post<ApiResponse<AvailabilityRule>>('/staff/availability/rules', data)
  return res.data.data!
}

export const updateStaffAvailabilityRule = async (
  id: number,
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.put<ApiResponse<AvailabilityRule>>(`/staff/availability/rules/${id}`, data)
  return res.data.data!
}

export const deleteStaffAvailabilityRule = async (id: number): Promise<void> => {
  await api.delete(`/staff/availability/rules/${id}`)
}

export const getStaffBlockedSlots = async (): Promise<BlockedSlot[]> => {
  const res = await api.get<ApiResponse<BlockedSlot[]>>('/staff/availability/blocked')
  return res.data.data ?? []
}

export const createStaffBlockedSlot = async (data: Partial<BlockedSlot>): Promise<BlockedSlot> => {
  const res = await api.post<ApiResponse<BlockedSlot>>('/staff/availability/blocked', data)
  return res.data.data!
}

export const updateStaffBlockedSlot = async (
  id: number,
  data: Partial<BlockedSlot>,
): Promise<BlockedSlot> => {
  const res = await api.put<ApiResponse<BlockedSlot>>(`/staff/availability/blocked/${id}`, data)
  return res.data.data!
}

export const deleteStaffBlockedSlot = async (id: number): Promise<void> => {
  await api.delete(`/staff/availability/blocked/${id}`)
}

export const getStaffTournaments = async (): Promise<Tournament[]> => {
  const res = await api.get<ApiResponse<Tournament[]>>('/staff/tournaments')
  return res.data.data ?? []
}

export const getStaffTournamentRegistrations = async (id: number): Promise<TeamRegistration[]> => {
  const res = await api.get<ApiResponse<TeamRegistration[]>>(`/staff/tournaments/${id}/registrations`)
  return res.data.data ?? []
}

export const updateStaffRegistrationStatus = async (
  regId: number,
  status: string,
): Promise<TeamRegistration> => {
  const res = await api.patch<ApiResponse<TeamRegistration>>(
    `/staff/tournaments/registrations/${regId}/status`,
    { status },
  )
  return res.data.data!
}

export const updateStaffRegistrationPaymentStatus = async (
  regId: number,
  paymentStatus: string,
): Promise<TeamRegistration> => {
  const res = await api.patch<ApiResponse<TeamRegistration>>(
    `/staff/tournaments/registrations/${regId}/payment`,
    { paymentStatus },
  )
  return res.data.data!
}

export const getStaffPlayers = async (): Promise<PlayerProfile[]> => {
  const res = await api.get<ApiResponse<PlayerProfile[]>>('/staff/players')
  return res.data.data ?? []
}

export default api
