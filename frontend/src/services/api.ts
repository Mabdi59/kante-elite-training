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
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

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

export default api
