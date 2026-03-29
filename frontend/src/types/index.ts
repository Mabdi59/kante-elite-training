// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string
  refreshToken: string
  email: string
  name: string
  role: 'ADMIN' | 'COACH' | 'USER'
}

export interface AuthUser {
  email: string
  name: string
  role: 'ADMIN' | 'COACH' | 'USER'
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Program {
  id: number
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  priceLabel: string
  durationMinutes: number
  features: string[]
  icon: string
  whoItsFor: string
  displayOrder: number
}

export interface Event {
  id: number
  title: string
  description: string
  location: string
  venue: string
  startDate: string
  endDate?: string
  ageGroup: string
  spotsTotal: number
  spotsLeft: number
  price: number
  status: string
  type: string
  intensity?: string
  displayOrder: number
}

export interface Testimonial {
  id: number
  name: string
  roleOrContext: string
  quote: string
  rating: number
  featured: boolean
  displayOrder: number
}

export interface Booking {
  id: number
  programName: string
  programSlug: string
  bookingDate: string
  bookingTime: string
  playerName: string
  playerAge?: string
  parentName?: string
  email: string
  phone: string
  experienceLevel?: string
  notes?: string
  paymentStatus: string
  bookingStatus: string
  createdAt: string
}

export interface AvailabilityData {
  programId: number
  date: string
  bookedSlots: string[]
  availableSlots: string[]
}

export interface Tournament {
  id: number
  name: string
  location: string
  startDate: string
  endDate?: string
  maxTeams: number
  description?: string
  status: string
  registeredTeams: number
  createdAt: string
}

export interface TeamRegistration {
  id: number
  tournamentId: number
  tournamentName: string
  teamId: number
  teamName: string
  captainName: string
  contactEmail: string
  status: string
  createdAt: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  readStatus: boolean
  createdAt: string
}

export interface AdminDashboard {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalPrograms: number
  activePrograms: number
  totalEvents: number
  totalTournaments: number
  totalUsers: number
  unreadMessages: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export interface AuditLog {
  id: number
  userEmail?: string
  action: string
  entity: string
  entityId?: number
  details?: string
  createdAt: string
}

export interface AvailabilityRule {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  active: boolean
  createdAt: string
}

export interface BlockedSlot {
  id: number
  slotDate: string
  slotTime?: string
  reason?: string
  createdAt: string
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface BookingFormData {
  programId: number
  bookingDate: string
  bookingTime: string
  playerName: string
  playerAge: string
  parentName: string
  email: string
  phone: string
  experienceLevel: string
  notes: string
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface TeamRegistrationFormData {
  teamName: string
  captainName: string
  contactEmail: string
  tournamentId: number
}
