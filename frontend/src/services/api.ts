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
  Tournament,
  TeamRegistration,
  TeamRegistrationFormData,
  ContactMessage,
  AdminDashboard,
  AdminUser,
  AuditLog,
  AvailabilityRule,
  BlockedSlot,
  CoachProfile,
  CoachProfileFormData,
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
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      const storedRefresh = localStorage.getItem('refreshToken')
      if (!storedRefresh) {
        // No refresh token — clear session
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
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

        // Flush queued requests
        refreshQueue.forEach((cb) => cb(data.token))
        refreshQueue = []

        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
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

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })
  return res.data.data!
}

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password })
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

export const getAdminTournaments = async (): Promise<Tournament[]> => {
  const res = await api.get<ApiResponse<Tournament[]>>('/tournaments')
  return res.data.data ?? []
}

export const createTournament = async (data: Partial<Tournament>): Promise<Tournament> => {
  const res = await api.post<ApiResponse<Tournament>>('/tournaments', data)
  return res.data.data!
}

export const updateTournament = async (
  id: number,
  data: Partial<Tournament>,
): Promise<Tournament> => {
  const res = await api.put<ApiResponse<Tournament>>(`/tournaments/${id}`, data)
  return res.data.data!
}

export const deleteTournament = async (id: number): Promise<void> => {
  await api.delete(`/tournaments/${id}`)
}

export const getTournamentRegistrations = async (id: number): Promise<TeamRegistration[]> => {
  const res = await api.get<ApiResponse<TeamRegistration[]>>(`/tournaments/${id}/registrations`)
  return res.data.data ?? []
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

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get<ApiResponse<AdminUser[]>>('/admin/users')
  return res.data.data ?? []
}

export const updateUserRole = async (id: number, role: string): Promise<AdminUser> => {
  const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role })
  return res.data.data!
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

// ─── Coach Dashboard ──────────────────────────────────────────────────────────

export const getMyCoachProfile = async (): Promise<CoachProfile> => {
  const res = await api.get<ApiResponse<CoachProfile>>('/coach/profile')
  return res.data.data!
}

export const updateMyCoachProfile = async (data: CoachProfileFormData): Promise<CoachProfile> => {
  const res = await api.put<ApiResponse<CoachProfile>>('/coach/profile', data)
  return res.data.data!
}

export const getMyCoachSessions = async (): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/coach/sessions')
  return res.data.data ?? []
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

export default api
