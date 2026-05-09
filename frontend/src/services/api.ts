import axios from 'axios'
import type {
  ApiResponse,
  Program,
  ProgramWorkflow,
  Event,
  EventWorkflow,
  Testimonial,
  Booking,
  AvailabilityData,
  BookingFormData,
  ContactFormData,
  AuthResponse,
  UserRole,
  ForgotPasswordResult,
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
  AdminUser,
  AdminUserFormData,
  AvailabilityConflict,
  AvailabilityRule,
  BlockedTime,
  BlockedSlot,
  PlayerProfile,
  PlayerProfileFormData,
  ParticipantAssignmentFormData,
  ManagedParticipant,
  Registration,
  Session,
  SessionPreview,
  MediaPost,
  MediaCategory,
  MediaPostUpdateFormData,
  StandingEntry,
  WebsiteContent,
  WebsiteContentFormData,
  EventRegistrationFormData,
  Notification,
  AttendanceRecord,
  AttendanceFormData,
  WaiverTemplate,
  WaiverTemplateFormData,
  SignedWaiver,
  SignWaiverFormData,
  PlayerDocument,
  DocumentType,
  PlayerProgressNote,
  PlayerProgressNoteFormData,
} from '../types'

const configuredApiUrl = (import.meta.env.VITE_API_URL ?? '').trim()
const normalizedApiBaseUrl = configuredApiUrl
  ? `${configuredApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/api`
  : '/api'

export const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedApiBaseUrl}${normalizedPath}`
}

const api = axios.create({
  baseURL: normalizedApiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

const clearStoredSession = (redirectToLogin = false) => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('auth-state-changed'))

  if (redirectToLogin && window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

const storeAuthSession = (data: AuthResponse) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem(
    'user',
    JSON.stringify({ email: data.email, name: data.name, role: data.role }),
  )
  window.dispatchEvent(new Event('auth-state-changed'))
}

const readJwtExpiry = (token: string): number | null => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = JSON.parse(atob(padded)) as { exp?: number }
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

const tokenExpiresSoon = (token: string, skewMs = 30_000) => {
  const expiry = readJwtExpiry(token)
  if (!expiry) return false
  return expiry - Date.now() <= skewMs
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise

  const storedRefresh = localStorage.getItem('refreshToken')
  if (!storedRefresh) return null

  refreshPromise = axios
    .post<ApiResponse<AuthResponse>>(`${normalizedApiBaseUrl}/auth/refresh`, {
      refreshToken: storedRefresh,
    })
    .then((res) => {
      const data = res.data.data
      if (!data?.token || !data.refreshToken) {
        clearStoredSession()
        return null
      }

      storeAuthSession(data)
      return data.token
    })
    .catch(() => {
      clearStoredSession()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

// ─── Auth Request Interceptor ─────────────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  if (config.url?.includes('/auth/')) return config

  let token = localStorage.getItem('token')
  const storedRefresh = localStorage.getItem('refreshToken')

  if (token && !storedRefresh && tokenExpiresSoon(token)) {
    clearStoredSession()
    token = null
  }

  if (storedRefresh && (!token || tokenExpiresSoon(token))) {
    token = await refreshAccessToken()
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─── 401 Response Interceptor (auto-refresh) ─────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (
      !original ||
      original._retry ||
      original.url?.includes('/auth/') ||
      (status !== 401 && status !== 403)
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    const newToken = await refreshAccessToken()
    if (!newToken) {
      clearStoredSession(true)
      return Promise.reject(error)
    }

    original.headers = original.headers ?? {}
    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  },
)

// ─── Programs ─────────────────────────────────────────────────────────────────

export const getPrograms = async (): Promise<Program[]> => {
  const res = await api.get<ApiResponse<Program[]>>('/programs')
  return res.data.data ?? []
}

export const getProgramSessions = async (programId: number): Promise<Session[]> => {
  const res = await api.get<ApiResponse<Session[]>>(`/programs/${programId}/sessions`)
  return res.data.data ?? []
}

// ─── Events ───────────────────────────────────────────────────────────────────

export const getEvents = async (): Promise<Event[]> => {
  const res = await api.get<ApiResponse<Event[]>>('/events')
  return res.data.data ?? []
}

export const getEventSessions = async (eventId: number): Promise<Session[]> => {
  const res = await api.get<ApiResponse<Session[]>>(`/events/${eventId}/sessions`)
  return res.data.data ?? []
}

export const getUpcomingSessions = async (): Promise<Session[]> => {
  const res = await api.get<ApiResponse<Session[]>>('/sessions/upcoming')
  return res.data.data ?? []
}

export const createEventRegistration = async (
  eventId: number,
  data: EventRegistrationFormData,
): Promise<void> => {
  await api.post(`/events/${eventId}/register`, {
    name: data.playerName.trim(),
    email: data.email.trim(),
  })
}

export const getMediaPosts = async (): Promise<MediaPost[]> => {
  const res = await api.get<ApiResponse<MediaPost[]>>('/media')
  return res.data.data ?? []
}

export const getWebsiteContent = async (): Promise<WebsiteContent> => {
  const res = await api.get<ApiResponse<WebsiteContent>>('/content')
  return res.data.data!
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

export const getBookingById = async (bookingId: number): Promise<Booking | null> => {
  const res = await api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`)
  return res.data.data ?? null
}

export const getPaymentsEnabled = async (): Promise<boolean> => {
  try {
    const res = await api.get<ApiResponse<{ enabled: boolean }>>('/payments/status')
    return res.data.data?.enabled === true
  } catch {
    return false
  }
}

export const createBookingCheckout = async (formData: BookingFormData): Promise<string> => {
  const res = await api.post<ApiResponse<{ url: string }>>('/payments/checkout', formData)
  const url = res.data.data?.url
  if (!url) throw new Error('No checkout URL returned')
  return url
}

export const getBookingByStripeSession = async (sessionId: string): Promise<Booking | null> => {
  const res = await api.get<ApiResponse<Booking>>(`/bookings/by-stripe-session/${sessionId}`)
  return res.data.data ?? null
}

export const getAdminPayments = async (): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/admin/payments')
  return Array.isArray(res.data.data) ? res.data.data : []
}

export const refundAdminBooking = async (bookingId: number): Promise<Booking> => {
  const res = await api.post<ApiResponse<Booking>>(`/admin/payments/refund/${bookingId}`)
  return res.data.data as Booking
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
    email: email.trim(),
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
    email: email.trim(),
    password,
    requestedRole,
  })
  return res.data.data!
}

export const claimTeamCaptainAccess = async (): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/claim-team-captain', {})
  return res.data.data!
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResult> => {
  const res = await api.post<ApiResponse<boolean>>('/auth/forgot-password', { email: email.trim() })
  return {
    message:
      res.data.message ??
      'If that email is registered, a reset link has been sent.',
    emailDeliveryAvailable: res.data.data === true,
  }
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

export const getPublicTournamentView = async (id: number): Promise<TournamentWorkflow> => {
  const res = await api.get<ApiResponse<TournamentWorkflow>>(`/tournaments/${id}/public`)
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

export const buildTournamentRosterDownloadUrl = (token: string) =>
  buildApiUrl(`/tournaments/registrations/access/${token}/roster/download`)

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

export const getBookingsOverTime = async (days = 30): Promise<{ date: string; count: number }[]> => {
  const res = await api.get<ApiResponse<{ date: string; count: number }[]>>(`/admin/reports/bookings-over-time?days=${days}`)
  return res.data.data ?? []
}

export const createMediaPost = async (
  file: File,
  caption: string,
  category?: MediaCategory,
  altText?: string,
): Promise<MediaPost> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('caption', caption.trim())
  if (altText?.trim()) {
    formData.append('altText', altText.trim())
  }
  if (category) {
    formData.append('category', category)
  }

  const res = await api.post<ApiResponse<MediaPost>>('/admin/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data!
}

export const updateMediaPost = async (
  id: number,
  data: MediaPostUpdateFormData,
): Promise<MediaPost> => {
  const res = await api.put<ApiResponse<MediaPost>>(`/admin/media/${id}`, data)
  return res.data.data!
}

export const deleteMediaPost = async (id: number): Promise<void> => {
  await api.delete(`/admin/media/${id}`)
}

export const getAdminWebsiteContent = async (): Promise<WebsiteContent> => {
  const res = await api.get<ApiResponse<WebsiteContent>>('/admin/content')
  return res.data.data!
}

export const updateWebsiteContent = async (
  data: WebsiteContentFormData,
): Promise<WebsiteContent> => {
  const res = await api.put<ApiResponse<WebsiteContent>>('/admin/content', data)
  return res.data.data!
}

export const getAdminBookings = async (params?: {
  status?: string
  date?: string
  from?: string
  to?: string
}): Promise<Booking[]> => {
  const res = await api.get<ApiResponse<Booking[]>>('/admin/bookings', { params })
  return res.data.data ?? []
}

export const createAdminBooking = async (data: BookingFormData): Promise<Booking> => {
  const res = await api.post<ApiResponse<Booking>>('/admin/bookings', data)
  return res.data.data!
}

export const updateAdminBooking = async (id: number, data: BookingFormData): Promise<Booking> => {
  const res = await api.put<ApiResponse<Booking>>(`/admin/bookings/${id}`, data)
  return res.data.data!
}

export const deleteAdminBooking = async (id: number): Promise<void> => {
  await api.delete(`/admin/bookings/${id}`)
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

export const getAdminProgramWorkflow = async (id: number): Promise<ProgramWorkflow> => {
  const res = await api.get<ApiResponse<ProgramWorkflow>>(`/admin/programs/${id}/workflow`)
  return res.data.data!
}

export const createProgram = async (data: Partial<Program>): Promise<Program> => {
  const payload = {
    ...data,
    features: Array.isArray(data.features) ? data.features.join('|') : data.features,
    scheduleRules: data.scheduleRules,
  }
  const res = await api.post<ApiResponse<Program>>('/admin/programs', payload)
  return res.data.data!
}

export const updateProgram = async (id: number, data: Partial<Program>): Promise<Program> => {
  const payload = {
    ...data,
    features: Array.isArray(data.features) ? data.features.join('|') : data.features,
    scheduleRules: data.scheduleRules,
  }
  const res = await api.put<ApiResponse<Program>>(`/admin/programs/${id}`, payload)
  return res.data.data!
}

export const previewProgramSessions = async (data: Partial<Program>): Promise<SessionPreview[]> => {
  const payload = {
    ...data,
    features: Array.isArray(data.features) ? data.features.join('|') : data.features,
    scheduleRules: data.scheduleRules,
  }
  const res = await api.post<ApiResponse<SessionPreview[]>>('/admin/programs/preview-sessions', payload)
  return res.data.data ?? []
}

export const getAdminProgramSessions = async (programId: number): Promise<Session[]> => {
  const res = await api.get<ApiResponse<Session[]>>(`/admin/programs/${programId}/sessions`)
  return res.data.data ?? []
}

export const deleteProgram = async (id: number): Promise<void> => {
  await api.delete(`/admin/programs/${id}`)
}

export const addAdminProgramParticipant = async (
  programId: number,
  data: ParticipantAssignmentFormData,
) : Promise<ManagedParticipant> => {
  const res = await api.post<ApiResponse<ManagedParticipant>>(`/admin/programs/${programId}/participants`, data)
  return res.data.data!
}

export const removeAdminProgramParticipant = async (
  programId: number,
  participantId: number,
): Promise<void> => {
  await api.delete(`/admin/programs/${programId}/participants/${participantId}`)
}

export const getAdminEvents = async (): Promise<Event[]> => {
  const res = await api.get<ApiResponse<Event[]>>('/admin/events')
  return res.data.data ?? []
}

export const getAdminEventWorkflow = async (id: number): Promise<EventWorkflow> => {
  const res = await api.get<ApiResponse<EventWorkflow>>(`/admin/events/${id}/workflow`)
  return res.data.data!
}

export const createEvent = async (data: Partial<Event>): Promise<Event> => {
  const res = await api.post<ApiResponse<Event>>('/admin/events', { ...data, scheduleRules: data.scheduleRules })
  return res.data.data!
}

export const updateEvent = async (id: number, data: Partial<Event>): Promise<Event> => {
  const res = await api.put<ApiResponse<Event>>(`/admin/events/${id}`, { ...data, scheduleRules: data.scheduleRules })
  return res.data.data!
}

export const previewEventSessions = async (data: Partial<Event>): Promise<SessionPreview[]> => {
  const res = await api.post<ApiResponse<SessionPreview[]>>('/admin/events/preview-sessions', {
    ...data,
    scheduleRules: data.scheduleRules,
  })
  return res.data.data ?? []
}

export const getAdminEventSessions = async (eventId: number): Promise<Session[]> => {
  const res = await api.get<ApiResponse<Session[]>>(`/admin/events/${eventId}/sessions`)
  return res.data.data ?? []
}

export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete(`/admin/events/${id}`)
}

export const addAdminEventParticipant = async (
  eventId: number,
  data: ParticipantAssignmentFormData,
) : Promise<ManagedParticipant> => {
  const res = await api.post<ApiResponse<ManagedParticipant>>(`/admin/events/${eventId}/participants`, data)
  return res.data.data!
}

export const removeAdminEventParticipant = async (
  eventId: number,
  participantId: number,
): Promise<void> => {
  await api.delete(`/admin/events/${eventId}/participants/${participantId}`)
}

export const getAdminSessions = async (): Promise<Session[]> => {
  const res = await api.get<ApiResponse<Session[]>>('/admin/sessions')
  return res.data.data ?? []
}

export const cancelAdminSession = async (sessionId: number): Promise<Session> => {
  const res = await api.patch<ApiResponse<Session>>(`/admin/sessions/${sessionId}/cancel`, {})
  return res.data.data!
}

export const getAdminRegistrations = async (): Promise<Registration[]> => {
  const res = await api.get<ApiResponse<Registration[]>>('/admin/registrations')
  return res.data.data ?? []
}

export const getAdminSessionRegistrations = async (sessionId: number): Promise<Registration[]> => {
  const res = await api.get<ApiResponse<Registration[]>>(`/admin/sessions/${sessionId}/registrations`)
  return res.data.data ?? []
}

export const updateAdminRegistrationStatus = async (
  registrationId: number,
  status: string,
): Promise<Registration> => {
  const res = await api.patch<ApiResponse<Registration>>(`/admin/registrations/${registrationId}/status`, {
    status,
  })
  return res.data.data!
}

export const deleteAdminRegistration = async (registrationId: number): Promise<void> => {
  await api.delete(`/admin/registrations/${registrationId}`)
}

export const createRegistration = async (
  sessionId: number,
  data: { playerProfileId?: number; notes?: string },
): Promise<Registration> => {
  const res = await api.post<ApiResponse<Registration>>('/registrations', data, { params: { sessionId } })
  return res.data.data!
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

export const seedTournamentKnockoutBracket = async (tournamentId: number): Promise<TournamentMatch[]> => {
  const res = await api.post<ApiResponse<TournamentMatch[]>>(
    `/admin/tournaments/${tournamentId}/bracket/seed`,
  )
  return res.data.data ?? []
}

export const getAdminTournamentStandings = async (tournamentId: number): Promise<StandingEntry[]> => {
  const res = await api.get<ApiResponse<StandingEntry[]>>(`/admin/tournaments/${tournamentId}/standings`)
  return res.data.data ?? []
}

export const bulkCreateTournamentTeamPlayers = async (
  tournamentId: number,
  teamId: number,
  lines: string[],
): Promise<TeamPlayer[]> => {
  const res = await api.post<ApiResponse<TeamPlayer[]>>(
    `/admin/tournaments/${tournamentId}/teams/${teamId}/players/bulk`,
    lines,
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

// ─── Admin Availability ───────────────────────────────────────────────────────

export const getAvailabilityRules = async (): Promise<AvailabilityRule[]> => {
  const res = await api.get<ApiResponse<AvailabilityRule[]>>('/admin/availability')
  return res.data.data ?? []
}

export const createAvailabilityRule = async (
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.post<ApiResponse<AvailabilityRule>>('/admin/availability', data)
  return res.data.data!
}

export const updateAvailabilityRule = async (
  id: number,
  data: Partial<AvailabilityRule>,
): Promise<AvailabilityRule> => {
  const res = await api.put<ApiResponse<AvailabilityRule>>(`/admin/availability/${id}`, data)
  return res.data.data!
}

export const deleteAvailabilityRule = async (id: number): Promise<void> => {
  await api.delete(`/admin/availability/${id}`)
}

export const checkAvailabilityConflicts = async (
  coachId: number,
  start: string,
  end: string,
): Promise<AvailabilityConflict> => {
  const res = await api.get<ApiResponse<AvailabilityConflict>>('/admin/availability/conflicts', {
    params: { coachId, start, end },
  })
  return res.data.data ?? { hasConflict: false, reasons: [] }
}

export const getBlockedTimes = async (coachId?: number): Promise<BlockedTime[]> => {
  const res = await api.get<ApiResponse<BlockedTime[]>>('/admin/availability/blocked-times', {
    params: coachId ? { coachId } : undefined,
  })
  return res.data.data ?? []
}

export const createBlockedTime = async (data: Partial<BlockedTime>): Promise<BlockedTime> => {
  const res = await api.post<ApiResponse<BlockedTime>>('/admin/availability/blocked-times', data)
  return res.data.data!
}

export const updateBlockedTime = async (id: number, data: Partial<BlockedTime>): Promise<BlockedTime> => {
  const res = await api.put<ApiResponse<BlockedTime>>(`/admin/availability/blocked-times/${id}`, data)
  return res.data.data!
}

export const deleteBlockedTime = async (id: number): Promise<void> => {
  await api.delete(`/admin/availability/blocked-times/${id}`)
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

// ─── Admin Players ────────────────────────────────────────────────────────────

export const getAdminPlayers = async (): Promise<PlayerProfile[]> => {
  const res = await api.get<ApiResponse<PlayerProfile[]>>('/admin/players')
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
// ── Account: Change Password ─────────────────────────────────────────────────
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.patch('/account/password', { currentPassword, newPassword })
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotificationUnreadCount = async (): Promise<number> => {
  const res = await api.get<ApiResponse<number>>('/notifications/unread-count')
  return res.data.data ?? 0
}

export const getNotificationsUnread = async (): Promise<Notification[]> => {
  const res = await api.get<ApiResponse<Notification[]>>('/notifications/unread')
  return res.data.data ?? []
}

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`, {})
}

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all', {})
}

// ─── Waivers ─────────────────────────────────────────────────────────────────

export const getActiveWaiverTemplates = async (): Promise<WaiverTemplate[]> => {
  const res = await api.get<ApiResponse<WaiverTemplate[]>>('/waivers/templates')
  return res.data.data ?? []
}

export const getAllWaiverTemplates = async (): Promise<WaiverTemplate[]> => {
  const res = await api.get<ApiResponse<WaiverTemplate[]>>('/admin/waivers/templates')
  return res.data.data ?? []
}

export const createWaiverTemplate = async (data: WaiverTemplateFormData): Promise<WaiverTemplate> => {
  const res = await api.post<ApiResponse<WaiverTemplate>>('/admin/waivers/templates', data)
  return res.data.data!
}

export const updateWaiverTemplate = async (
  id: number,
  data: WaiverTemplateFormData,
): Promise<WaiverTemplate> => {
  const res = await api.put<ApiResponse<WaiverTemplate>>(`/admin/waivers/templates/${id}`, data)
  return res.data.data!
}

export const deleteWaiverTemplate = async (id: number): Promise<void> => {
  await api.delete(`/admin/waivers/templates/${id}`)
}

export const signWaiver = async (data: SignWaiverFormData): Promise<SignedWaiver> => {
  const res = await api.post<ApiResponse<SignedWaiver>>('/waivers/sign', data)
  return res.data.data!
}

export const getMySignedWaivers = async (): Promise<SignedWaiver[]> => {
  const res = await api.get<ApiResponse<SignedWaiver[]>>('/waivers/my-signed')
  return res.data.data ?? []
}

export const checkWaiverSigned = async (templateId: number): Promise<boolean> => {
  const res = await api.get<ApiResponse<boolean>>(`/waivers/check/${templateId}`)
  return res.data.data ?? false
}

// ─── Documents ────────────────────────────────────────────────────────────────

export const getMyDocuments = async (): Promise<PlayerDocument[]> => {
  const res = await api.get<ApiResponse<PlayerDocument[]>>('/documents/my')
  return res.data.data ?? []
}

export const getPlayerDocuments = async (email: string): Promise<PlayerDocument[]> => {
  const res = await api.get<ApiResponse<PlayerDocument[]>>(`/admin/documents/player/${encodeURIComponent(email)}`)
  return res.data.data ?? []
}

export const deletePlayerDocument = async (id: number): Promise<void> => {
  await api.delete(`/admin/documents/${id}`)
}

export const uploadDocument = async (
  file: File,
  docType: DocumentType = 'OTHER',
  description?: string,
  playerEmail?: string,
): Promise<PlayerDocument> => {
  const form = new FormData()
  form.append('file', file)
  form.append('docType', docType)
  if (description) form.append('description', description)
  if (playerEmail) form.append('playerEmail', playerEmail)
  const res = await api.post<ApiResponse<PlayerDocument>>('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data!
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export const upsertAttendance = async (data: AttendanceFormData): Promise<AttendanceRecord> => {
  const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance', data)
  return res.data.data!
}

export const getAttendanceByBooking = async (bookingId: number): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/attendance/booking/${bookingId}`)
  return res.data.data ?? []
}

export const getMyAttendance = async (): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance/player')
  return res.data.data ?? []
}

export const getAttendanceByPlayer = async (email: string): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(`/attendance/player/${encodeURIComponent(email)}`)
  return res.data.data ?? []
}

export const getAttendanceSummary = async (email: string): Promise<Record<string, number>> => {
  // Backend returns Map<String, Long>; counts are always within JS safe-integer range.
  const res = await api.get<ApiResponse<Record<string, number>>>(`/attendance/player/${encodeURIComponent(email)}/summary`)
  return res.data.data ?? {}
}

export const getAttendanceByRange = async (
  from: string,
  to: string,
  playerEmail?: string,
): Promise<AttendanceRecord[]> => {
  const params: Record<string, string> = { from, to }
  if (playerEmail) params.playerEmail = playerEmail
  const res = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance/range', { params })
  return res.data.data ?? []
}

export const deleteAttendanceRecord = async (id: number): Promise<void> => {
  await api.delete(`/attendance/${id}`)
}

// ─── Progress Notes ───────────────────────────────────────────────────────────

export const createProgressNote = async (data: PlayerProgressNoteFormData): Promise<PlayerProgressNote> => {
  const res = await api.post<ApiResponse<PlayerProgressNote>>('/coach/progress-notes', data)
  return res.data.data!
}

export const getCoachProgressNotes = async (): Promise<PlayerProgressNote[]> => {
  const res = await api.get<ApiResponse<PlayerProgressNote[]>>('/coach/progress-notes')
  return res.data.data ?? []
}

export const updateProgressNote = async (
  id: number,
  data: PlayerProgressNoteFormData,
): Promise<PlayerProgressNote> => {
  const res = await api.put<ApiResponse<PlayerProgressNote>>(`/coach/progress-notes/${id}`, data)
  return res.data.data!
}

export const deleteProgressNote = async (id: number): Promise<void> => {
  await api.delete(`/coach/progress-notes/${id}`)
}

export const getPlayerProgressNotes = async (email: string): Promise<PlayerProgressNote[]> => {
  const res = await api.get<ApiResponse<PlayerProgressNote[]>>(`/players/${encodeURIComponent(email)}/progress-notes`)
  return res.data.data ?? []
}

export const getMyProgressNotes = async (): Promise<PlayerProgressNote[]> => {
  const res = await api.get<ApiResponse<PlayerProgressNote[]>>('/player/progress-notes')
  return res.data.data ?? []
}

export const getProgressNotesByBooking = async (bookingId: number): Promise<PlayerProgressNote[]> => {
  const res = await api.get<ApiResponse<PlayerProgressNote[]>>(`/bookings/${bookingId}/progress-notes`)
  return res.data.data ?? []
}

export default api
