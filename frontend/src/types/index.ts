// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole =
  | 'ADMIN'
  | 'STAFF'
  | 'COACH'
  | 'PARENT'
  | 'PLAYER'
  | 'TEAM_CAPTAIN'
  | 'USER'

export interface AuthResponse {
  token: string
  refreshToken: string
  email: string
  name: string
  role: UserRole
}

export interface AuthUser {
  email: string
  name: string
  role: UserRole
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Program {
  id: number
  name: string
  slug: string
  description: string
  shortDescription: string
  active?: boolean
  location?: string
  startAt?: string
  endAt?: string
  capacity?: number
  status?: string
  participantCount?: number
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
  startAt?: string
  endAt?: string
  capacity?: number
  participantCount?: number
  ageGroup: string
  spotsTotal: number
  spotsLeft: number
  price: number
  status: string
  type: string
  intensity?: string
  displayOrder: number
}

export type MediaType = 'IMAGE' | 'VIDEO'

export type MediaCategory = 'TRAINING_PHOTO' | 'MATCH_HIGHLIGHT' | 'SKILL_CLIP' | 'TESTIMONIAL'

export interface MediaPost {
  id: number
  mediaUrl: string
  mediaType: MediaType
  caption?: string
  featured: boolean
  showOnHome: boolean
  showOnAbout: boolean
  mediaCategory?: MediaCategory
  createdAt: string
}

export interface WebsiteContent {
  id: number
  homeBadge?: string
  homeHeadline?: string
  homeDescription?: string
  homeHighlightsTitle?: string
  homeHighlightsDescription?: string
  aboutBadge?: string
  aboutHeroTitle?: string
  aboutHeroDescription?: string
  aboutHeadline?: string
  aboutIntro?: string
  aboutBody?: string
  aboutTrustStatement?: string
  aboutGalleryTitle?: string
  aboutGalleryDescription?: string
  aboutExperienceTitle?: string
  aboutExperienceDescription?: string
  aboutExperiencePoints: string[]
  createdAt?: string
  updatedAt?: string
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
  programId: number
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
  stripeSessionId?: string
  confirmationEmailAvailable?: boolean
  createdAt: string
}

export interface ForgotPasswordResult {
  message: string
  emailDeliveryAvailable: boolean
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
  ageGroup?: string
  registrationDeadline?: string
  division?: string
  entryFee?: number
  notes?: string
  formatType?: string
  groupCount?: number
  teamsPerGroup?: number
  advancePerGroup?: number
  pointsForWin?: number
  pointsForDraw?: number
  pointsForLoss?: number
  matchDurationMinutes?: number
  thirdPlaceMatchEnabled?: boolean
  createdAt: string
}

export interface TeamPlayer {
  id: number
  teamId: number
  fullName: string
  jerseyNumber?: string
  position?: string
  captain?: boolean
  notes?: string
  createdAt: string
}

export interface TournamentWorkflowTeam {
  registrationId: number
  tournamentId: number
  teamId: number
  teamName: string
  captainName: string
  contactEmail: string
  phone?: string
  clubName?: string
  registrationStatus: string
  paymentStatus?: string
  publicAccessUrl?: string
  playerCount: number
  players: TeamPlayer[]
}

export interface TournamentMatch {
  id: number
  tournamentId: number
  homeTeamId?: number
  homeTeamName?: string
  awayTeamId?: number
  awayTeamName?: string
  stageName?: string
  roundName?: string
  matchDate?: string
  kickoffTime?: string
  venue?: string
  fieldName?: string
  status: string
  homeScore?: number
  awayScore?: number
  notes?: string
  createdAt: string
  /** Non-fatal advisory message from the backend when bracket advancement was partially blocked. */
  warning?: string
}

export interface TournamentWorkflow {
  tournament: Tournament
  teams: TournamentWorkflowTeam[]
  matches: TournamentMatch[]
  standings: StandingEntry[]
  totalPlayers: number
  completedMatches: number
}

export interface StandingEntry {
  position: number
  teamId: number
  teamName: string
  groupName?: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface TeamRegistration {
  id: number
  tournamentId: number
  tournamentName: string
  tournamentLocation?: string
  tournamentStartDate?: string
  tournamentStatus?: string
  teamId: number
  teamName: string
  captainName: string
  contactEmail: string
  phone?: string
  clubName?: string
  status: string
  paymentStatus?: string
  paymentMethod?: string
  paymentReference?: string
  paymentNotes?: string
  entryFee?: number
  paymentRequired?: boolean
  rosterSubmitted?: boolean
  rosterText?: string
  rosterFileName?: string
  rosterSubmittedAt?: string
  guestAccessToken?: string
  publicAccessUrl?: string
  createdAt: string
}

export interface TournamentRegistrationDashboard {
  registration: TeamRegistration
  paymentRequired: boolean
  onlinePaymentAvailable: boolean
  entryFee?: number
  rosterSubmitted: boolean
  rosterText?: string
  rosterFileName?: string
  rosterSubmittedAt?: string
  lastFollowUpSentAt?: string
  publicAccessUrl: string
  nextSteps: string[]
}

export interface ManagedParticipant {
  id: number
  userId?: number
  playerProfileId?: number
  participantType: string
  name: string
  email?: string
  createdAt: string
}

export interface ProgramWorkflow {
  program: Program
  participants: ManagedParticipant[]
  participantCount: number
  capacityReached: boolean
}

export interface EventWorkflow {
  event: Event
  participants: ManagedParticipant[]
  participantCount: number
  capacityReached: boolean
}

export interface TournamentPaymentCheckout {
  checkoutUrl?: string
  message?: string
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
  totalCoaches: number
  totalPlayers: number
  pendingRegistrations: number
  usersWithRoleAdmin: number
  usersWithRoleCoach: number
  usersWithRoleUser: number
}

export interface StaffDashboard {
  totalBookings: number
  todayBookings: number
  upcomingBookings: number
  confirmedBookings: number
  unreadMessages: number
  blockedSlots: number
  pendingRegistrations: number
  totalPlayers: number
  totalTournaments: number
}

export interface CaptainDashboard {
  totalRegistrations: number
  pendingRegistrations: number
  approvedRegistrations: number
  waitlistedRegistrations: number
  availableTournaments: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
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

export interface CoachProfile {
  id: number
  userId: number
  userName: string
  userEmail: string
  bio?: string
  specialties?: string
  certifications?: string
  active: boolean
  createdAt: string
}

export interface PlayerProfile {
  id: number
  parentUserId: number
  parentUserEmail: string
  name: string
  dateOfBirth?: string
  age?: number
  skillLevel?: string
  preferredPosition?: string
  notes?: string
  active: boolean
  createdAt: string
}

export interface Notification {
  id: number
  userEmail?: string
  type: string
  title: string
  body?: string
  readStatus: boolean
  entity?: string
  entityId?: number
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
  phone?: string
  clubName?: string
  tournamentId: number
}

export interface AdminTeamRegistrationFormData extends TeamRegistrationFormData {
  status: string
  paymentStatus: string
  paymentMethod?: string
  paymentReference?: string
  paymentNotes?: string
  rosterText?: string
}

export interface TeamPlayerFormData {
  fullName: string
  jerseyNumber?: string
  position?: string
  captain?: boolean
  notes?: string
}

export interface TournamentMatchFormData {
  homeTeamId?: number
  awayTeamId?: number
  stageName?: string
  roundName?: string
  matchDate?: string
  kickoffTime?: string
  venue?: string
  fieldName?: string
  status: string
  homeScore?: number | ''
  awayScore?: number | ''
  notes?: string
}

export interface ManualTournamentPaymentFormData {
  paymentMethod: string
  paymentReference?: string
  notes?: string
}

export interface PlayerProfileFormData {
  name: string
  dateOfBirth?: string
  age?: number
  skillLevel?: string
  preferredPosition?: string
  notes?: string
}

export interface CoachProfileFormData {
  bio?: string
  specialties?: string
  certifications?: string
  active?: boolean
}

export interface AdminUserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
}

export interface AdminPlayerFormData {
  parentUserId: number
  name: string
  dateOfBirth?: string
  age?: number
  skillLevel?: string
  preferredPosition?: string
  notes?: string
  active?: boolean
}

export interface ParticipantAssignmentFormData {
  userId?: number
  playerProfileId?: number
  manualName?: string
  manualEmail?: string
}

export interface MediaPostUpdateFormData {
  caption?: string
  featured?: boolean
  showOnHome?: boolean
  showOnAbout?: boolean
  mediaCategory?: MediaCategory
}

export interface WebsiteContentFormData {
  homeBadge?: string
  homeHeadline?: string
  homeDescription?: string
  homeHighlightsTitle?: string
  homeHighlightsDescription?: string
  aboutBadge?: string
  aboutHeroTitle?: string
  aboutHeroDescription?: string
  aboutHeadline?: string
  aboutIntro?: string
  aboutBody?: string
  aboutTrustStatement?: string
  aboutGalleryTitle?: string
  aboutGalleryDescription?: string
  aboutExperienceTitle?: string
  aboutExperienceDescription?: string
  aboutExperiencePoints?: string[]
}
