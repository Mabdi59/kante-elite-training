// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
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
