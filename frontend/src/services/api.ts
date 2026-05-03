import axios from 'axios'
import type {
  ApiResponse,
  Program,
  ProgramWorkflow,
  Event,
  EventWorkflow,
  Testimonial,
  TestimonialFormData,
  FaqItem,
  FaqItemFormData,
  CoachProfile,
  CoachProfileFormData,
  AvailabilityData,
  ProgramBookingFormData,
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
  AvailabilityRule,
  BlockedSlot,
  PlayerProfile,
  PlayerProfileFormData,
  ParticipantAssignmentFormData,
  ManagedParticipant,
  MediaPost,
  MediaCategory,
  MediaPlacementKey,
  MediaPostUpdateFormData,
  WebsiteContent,
  WebsiteContentFormData,
  EventRegistrationFormData,
  Registration,
  RegistrationFormData,
  RegistrationOfferingType,
  RegistrationPaymentStatus,
  RegistrationStatus,
  SessionSeries,
  SessionSeriesFormData,
  SessionSeriesPreviewItem,
  TrainingSession,
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

const protectedApiPrefixes = [
  '/account',
  '/admin',
  '/captain',
  '/coach',
  '/payments',
  '/notifications',
]

const publicReadApiPrefixes = [
  '/availability',
  '/content',
  '/events',
  '/faqs',
  '/media',
  '/programs',
  '/testimonials',
  '/tournaments',
  '/uploads',
]

const normalizeApiPath = (url?: string) => {
  if (!url) return false
  let pathname = url
  try {
    pathname = new URL(url, window.location.origin).pathname
  } catch {
    pathname = url
  }
  return pathname.replace(/^\/api(?=\/)/, '')
}

const matchesApiPrefix = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

const isProtectedApiRequest = (url?: string) => {
  const pathname = normalizeApiPath(url)
  if (!pathname) return false
  return matchesApiPrefix(pathname, protectedApiPrefixes)
}

const isPublicReadApiRequest = (url?: string, method?: string) => {
  if ((method ?? 'get').toLowerCase() !== 'get') return false
  const pathname = normalizeApiPath(url)
  if (!pathname) return false
  return matchesApiPrefix(pathname, publicReadApiPrefixes)
}

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
  if (isPublicReadApiRequest(config.url, config.method)) {
    return config
  }

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

    const hadAuthHeader = Boolean(original.headers?.Authorization)
    const newToken = await refreshAccessToken()
    if (!newToken) {
      clearStoredSession(isProtectedApiRequest(original.url) || hadAuthHeader)
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

// ─── Events ───────────────────────────────────────────────────────────────────

export const getEvents = async (): Promise<Event[]> => {
  const res = await api.get<ApiResponse<Event[]>>('/events')
  return res.data.data ?? []
}

export const getEventById = async (eventId: number): Promise<Event> => {
  const res = await api.get<ApiResponse<Event>>(`/events/${eventId}`)
  return res.data.data!
}

export const createEventRegistration = async (
  eventId: number,
  data: EventRegistrationFormData,
): Promise<void> => {
  await api.post(`/events/${eventId}/register`, {
    name: data.playerName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || undefined,
    playerAge: data.playerAge?.trim() || undefined,
    packageType: data.packageType,
    trainingSessionIds: data.trainingSessionIds,
  })
}

export const getMediaPosts = async (params?: {
  category?: MediaCategory
  placement?: MediaPlacementKey
}): Promise<MediaPost[]> => {
  const res = await api.get<ApiResponse<MediaPost[]>>('/media', { params })
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

export const getFaqs = async (params?: { featured?: boolean }): Promise<FaqItem[]> => {
  const res = await api.get<ApiResponse<FaqItem[]>>('/faqs', { params })
  return res.data.data ?? []
}

export const getPublicCoaches = async (params?: { featured?: boolean }): Promise<CoachProfile[]> => {
  const res = await api.get<ApiResponse<CoachProfile[]>>('/coach/public', { params })
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

// ─── Program registrations ───────────────────────────────────────────────────

export const getPaymentsEnabled = async (): Promise<boolean> => {
  try {
    const res = await api.get<{ enabled: boolean }>('/payments/status')
    return res.data.enabled === true
  } catch {
    return false
  }
}

export const createProgramCheckout = async (formData: ProgramBookingFormData): Promise<string> => {
  const res = await api.post<ApiResponse<{ url: string }>>('/payments/checkout', formData)
  const url = res.data.data?.url
  if (!url) throw new Error('No checkout URL returned')
  return url
}

export const getRegistrationByStripeSession = async (sessionId: string): Promise<Registration | null> => {
  const res = await api.get<ApiResponse<Registration>>(`/registrations/by-stripe-session/${sessionId}`)
  return res.data.data ?? null
}

export const createProgramRegistration = async (
  formData: ProgramBookingFormData,
): Promise<Registration> => {
  const res = await api.post<ApiResponse<Registration>>('/bookings', formData)
  if (!res.data.data) throw new Error('No registration data returned')
  return res.data.data
}

export const getPublicRegistration = async (id: number): Promise<Registration | null> => {
  const res = await api.get<ApiResponse<Registration>>(`/registrations/${id}`)
  return res.data.data ?? null
}

export const getPublicRegistrationByCode = async (
  registrationCode: string,
): Promise<Registration | null> => {
  const res = await api.get<ApiResponse<Registration>>(`/registrations/code/${registrationCode}`)
  return res.data.data ?? null
}

export const getAdminPayments = async (): Promise<Registration[]> => {
  const res = await api.get<ApiResponse<Registration[]>>('/admin/payments')
  return Array.isArray(res.data.data) ? res.data.data : []
}

export const refundAdminRegistration = async (registrationId: number): Promise<Registration> => {
  const res = await api.post<ApiResponse<Registration>>(`/admin/payments/refund-registration/${registrationId}`)
  return res.data.data as Registration
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

export const getMyRegistrations = async (): Promise<Registration[]> => {
  const res = await api.get<ApiResponse<Registration[]>>('/account/registrations')
  return res.data.data ?? []
}

export const cancelMyRegistration = async (id: number): Promise<Registration> => {
  const res = await api.patch<ApiResponse<Registration>>(`/account/registrations/${id}/cancel`, {})
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

export const getRegistrationsOverTime = async (days = 30): Promise<{ date: string; count: number }[]> => {
  const res = await api.get<{ date: string; count: number }[]>(`/admin/reports/registrations-over-time?days=${days}`)
  return res.data
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

export const getAdminSessionSeries = async (): Promise<SessionSeries[]> => {
  const res = await api.get<ApiResponse<SessionSeries[]>>('/admin/recurring-schedules')
  return res.data.data ?? []
}

export const getAdminSessionSeriesSessions = async (id: number): Promise<TrainingSession[]> => {
  const res = await api.get<ApiResponse<TrainingSession[]>>(`/admin/recurring-schedules/${id}/sessions`)
  return res.data.data ?? []
}

export const previewAdminSessionSeries = async (
  data: SessionSeriesFormData,
): Promise<SessionSeriesPreviewItem[]> => {
  const res = await api.post<ApiResponse<SessionSeriesPreviewItem[]>>('/admin/recurring-schedules/preview', data)
  return res.data.data ?? []
}

export const createAdminSessionSeries = async (
  data: SessionSeriesFormData,
): Promise<SessionSeries> => {
  const res = await api.post<ApiResponse<SessionSeries>>('/admin/recurring-schedules', data)
  return res.data.data!
}

export const updateAdminSessionSeries = async (
  id: number,
  data: SessionSeriesFormData,
): Promise<SessionSeries> => {
  const res = await api.put<ApiResponse<SessionSeries>>(`/admin/recurring-schedules/${id}`, data)
  return res.data.data!
}

export const deleteAdminSessionSeries = async (id: number): Promise<void> => {
  await api.delete(`/admin/recurring-schedules/${id}`)
}

export const cancelAdminSessionSeriesFuture = async (id: number, fromDate?: string): Promise<void> => {
  await api.post(`/admin/recurring-schedules/${id}/cancel-future`, fromDate ? { fromDate } : {})
}

export const cancelGeneratedTrainingSession = async (id: number): Promise<void> => {
  await api.delete(`/admin/recurring-schedules/sessions/${id}`)
}

export const getAdminRegistrations = async (params?: {
  offeringType?: RegistrationOfferingType
  status?: RegistrationStatus
  paymentStatus?: RegistrationPaymentStatus
  programId?: number
  eventId?: number
  scheduledDate?: string
}): Promise<Registration[]> => {
  const res = await api.get<ApiResponse<Registration[]>>('/admin/registrations', { params })
  return res.data.data ?? []
}

export const createAdminRegistration = async (data: RegistrationFormData): Promise<Registration> => {
  const res = await api.post<ApiResponse<Registration>>('/admin/registrations', data)
  return res.data.data!
}

export const updateAdminRegistration = async (
  id: number,
  data: RegistrationFormData,
): Promise<Registration> => {
  const res = await api.put<ApiResponse<Registration>>(`/admin/registrations/${id}`, data)
  return res.data.data!
}

export const deleteAdminRegistration = async (id: number): Promise<void> => {
  await api.delete(`/admin/registrations/${id}`)
}

export const updateUnifiedRegistrationStatus = async (
  id: number,
  status: RegistrationStatus,
): Promise<Registration> => {
  const res = await api.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/status`, { status })
  return res.data.data!
}

export const updateUnifiedRegistrationPaymentStatus = async (
  id: number,
  paymentStatus: RegistrationPaymentStatus,
): Promise<Registration> => {
  const res = await api.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/payment-status`, { paymentStatus })
  return res.data.data!
}

export const cancelRegistration = async (id: number, reason?: string): Promise<Registration> => {
  const res = await api.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/cancel`, { reason })
  return res.data.data!
}

export const buildAdminRegistrationsCsvUrl = (params?: {
  offeringType?: RegistrationOfferingType
  status?: RegistrationStatus
  paymentStatus?: RegistrationPaymentStatus
  programId?: number
  eventId?: number
  scheduledDate?: string
}) => {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })
  return buildApiUrl(`/admin/registrations/export.csv${query.toString() ? `?${query}` : ''}`)
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
    coachNames: Array.isArray(data.coachNames) ? data.coachNames.join('|') : data.coachNames,
  }
  const res = await api.post<ApiResponse<Program>>('/admin/programs', payload)
  return res.data.data!
}

export const updateProgram = async (id: number, data: Partial<Program>): Promise<Program> => {
  const payload = {
    ...data,
    features: Array.isArray(data.features) ? data.features.join('|') : data.features,
    coachNames: Array.isArray(data.coachNames) ? data.coachNames.join('|') : data.coachNames,
  }
  const res = await api.put<ApiResponse<Program>>(`/admin/programs/${id}`, payload)
  return res.data.data!
}

export const deleteProgram = async (id: number): Promise<void> => {
  await api.delete(`/admin/programs/${id}`)
}

export const addAdminProgramParticipant = async (
  programId: number,
  data: ParticipantAssignmentFormData,
): Promise<ManagedParticipant> => {
  const res = await api.post<ApiResponse<ManagedParticipant>>(`/admin/programs/${programId}/registrations`, data)
  return res.data.data!
}

export const removeAdminProgramParticipant = async (
  programId: number,
  participantId: number,
): Promise<void> => {
  await api.delete(`/admin/programs/${programId}/registrations/${participantId}`)
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

export const addAdminEventParticipant = async (
  eventId: number,
  data: ParticipantAssignmentFormData,
): Promise<ManagedParticipant> => {
  const res = await api.post<ApiResponse<ManagedParticipant>>(`/admin/events/${eventId}/registrations`, data)
  return res.data.data!
}

export const removeAdminEventParticipant = async (
  eventId: number,
  participantId: number,
): Promise<void> => {
  await api.delete(`/admin/events/${eventId}/registrations/${participantId}`)
}

export const getAdminTestimonials = async (): Promise<Testimonial[]> => {
  const res = await api.get<ApiResponse<Testimonial[]>>('/admin/testimonials')
  return res.data.data ?? []
}

export const createTestimonial = async (data: TestimonialFormData): Promise<Testimonial> => {
  const res = await api.post<ApiResponse<Testimonial>>('/admin/testimonials', data)
  return res.data.data!
}

export const updateTestimonial = async (
  id: number,
  data: TestimonialFormData,
): Promise<Testimonial> => {
  const res = await api.put<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, data)
  return res.data.data!
}

export const deleteTestimonial = async (id: number): Promise<void> => {
  await api.delete(`/admin/testimonials/${id}`)
}

export const getAdminFaqs = async (): Promise<FaqItem[]> => {
  const res = await api.get<ApiResponse<FaqItem[]>>('/admin/faqs')
  return res.data.data ?? []
}

export const createFaq = async (data: FaqItemFormData): Promise<FaqItem> => {
  const res = await api.post<ApiResponse<FaqItem>>('/admin/faqs', data)
  return res.data.data!
}

export const updateFaq = async (id: number, data: FaqItemFormData): Promise<FaqItem> => {
  const res = await api.put<ApiResponse<FaqItem>>(`/admin/faqs/${id}`, data)
  return res.data.data!
}

export const deleteFaq = async (id: number): Promise<void> => {
  await api.delete(`/admin/faqs/${id}`)
}

export const getAdminCoaches = async (): Promise<CoachProfile[]> => {
  const res = await api.get<ApiResponse<CoachProfile[]>>('/admin/coaches')
  return res.data.data ?? []
}

export const createCoachProfile = async (data: CoachProfileFormData): Promise<CoachProfile> => {
  const res = await api.post<ApiResponse<CoachProfile>>('/admin/coaches', data)
  return res.data.data!
}

export const updateCoachProfile = async (id: number, data: CoachProfileFormData): Promise<CoachProfile> => {
  const res = await api.put<ApiResponse<CoachProfile>>(`/admin/coaches/${id}`, data)
  return res.data.data!
}

export const deleteCoachProfile = async (id: number): Promise<void> => {
  await api.delete(`/admin/coaches/${id}`)
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

export default api
