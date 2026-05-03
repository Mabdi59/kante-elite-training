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
  category?: string
  mediaPostId?: number
  mediaUrl?: string
  mediaType?: MediaType
  secondaryMediaPostId?: number
  secondaryMediaUrl?: string
  secondaryMediaType?: MediaType
  coachNames?: string[]
  seasonLabel?: string
  campaignLabel?: string
  active?: boolean
  allowWaitlist?: boolean
  featured?: boolean
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
  ctaLabel?: string
  ctaUrl?: string
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
  coachName?: string
  primaryMediaUrl?: string
  secondaryMediaUrl?: string
  mediaUrls?: string[]
  trainingSessions?: TrainingSession[]
  featured?: boolean
  active?: boolean
  allowWaitlist?: boolean
  displayOrder: number
}

export type MediaType = 'IMAGE' | 'VIDEO'

export type MediaCategory = 'TRAINING_PHOTO' | 'MATCH_HIGHLIGHT' | 'SKILL_CLIP' | 'TESTIMONIAL'

export type MediaPlacementKey =
  | 'HOME_HERO'
  | 'HOME_FEATURED'
  | 'HOME_GALLERY'
  | 'ABOUT_HERO'
  | 'ABOUT_PROFILE'
  | 'ABOUT_GALLERY'
  | 'MEDIA_LIBRARY'

export interface MediaPlacement {
  key: MediaPlacementKey
  displayOrder: number
}

export interface MediaPost {
  id: number
  mediaUrl: string
  mediaType: MediaType
  caption?: string
  altText?: string
  mediaCategory?: MediaCategory
  placements?: MediaPlacement[]
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
  roleOrContext?: string
  storyTitle?: string
  quote: string
  mediaPostId?: number
  mediaUrl?: string
  mediaType?: MediaType
  playerMetadata?: string
  teamMetadata?: string
  programId?: number
  programName?: string
  coachProfileId?: number
  coachName?: string
  rating: number
  featured: boolean
  active: boolean
  displayOrder: number
}

export interface TestimonialFormData {
  name: string
  roleOrContext?: string
  storyTitle?: string
  quote: string
  mediaPostId?: number
  playerMetadata?: string
  teamMetadata?: string
  programId?: number
  coachProfileId?: number
  rating: number
  featured: boolean
  active: boolean
  displayOrder: number
}

export interface CoachProfile {
  id: number
  userId?: number
  userName?: string
  userEmail?: string
  displayName: string
  roleTitle?: string
  bio?: string
  headshotMediaPostId?: number
  headshotUrl?: string
  headshotMediaType?: MediaType
  specialties?: string
  certifications?: string
  instagramUrl?: string
  websiteUrl?: string
  bookingUrl?: string
  featured: boolean
  displayOrder: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  category?: string
  active: boolean
  featured: boolean
  displayOrder: number
  createdAt?: string
  updatedAt?: string
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
  guestAccessToken?: string
  captainName: string
  contactEmail: string
  phone?: string
  clubName?: string
  registrationStatus: string
  paymentStatus?: string
  publicAccessUrl?: string
  rosterSubmitted?: boolean
  rosterFileName?: string
  rosterSubmittedAt?: string
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
  tournamentEndDate?: string
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
  totalRegistrations: number
  confirmedRegistrations: number
  pendingWaitlistRegistrations: number
  cancelledRegistrations: number
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
  totalFamilies?: number
  totalActiveSeries?: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string
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

export interface PlayerProfile {
  id: number
  parentUserId?: number
  parentUserEmail?: string
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

export interface ProgramBookingFormData {
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

export interface EventRegistrationFormData {
  playerName: string
  email: string
  phone?: string
  playerAge?: string
  packageType?: 'FULL_WEEK' | 'DROP_IN'
  trainingSessionIds?: number[]
}

export type RegistrationOfferingType = 'PROGRAM' | 'EVENT'
export type RegistrationType = 'PROGRAM_BOOKING' | 'EVENT_REGISTRATION' | 'ADMIN_ENTRY'
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
export type RegistrationPaymentStatus = 'NOT_REQUIRED' | 'UNPAID' | 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'WAIVED'

export interface RegistrationHistory {
  id: number
  eventType: string
  message?: string
  previousStatus?: RegistrationStatus
  newStatus?: RegistrationStatus
  previousPaymentStatus?: RegistrationPaymentStatus
  newPaymentStatus?: RegistrationPaymentStatus
  actorType: string
  actorLabel?: string
  createdAt: string
}

export interface Registration {
  id: number
  registrationCode: string
  offeringType: RegistrationOfferingType
  programId?: number
  programName?: string
  programSlug?: string
  trainingSessionId?: number
  sessionCoachLabel?: string
  sessionLocation?: string
  eventId?: number
  eventTitle?: string
  registrationType: RegistrationType
  status: RegistrationStatus
  paymentStatus: RegistrationPaymentStatus
  source: string
  participantName: string
  participantAge?: string
  participantEmail?: string
  participantPhone?: string
  guardianName?: string
  guardianEmail: string
  guardianPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  medicalNotes?: string
  experienceLevel?: string
  scheduledDate?: string
  scheduledStartTime?: string
  scheduledEndTime?: string
  timezone?: string
  priceAmount?: number
  currency?: string
  amountPaid?: number
  waiverAccepted: boolean
  customerNotes?: string
  adminNotes?: string
  waitlistPosition?: number
  waitlistedAt?: string
  cancelledAt?: string
  cancelledByType?: string
  cancelledByLabel?: string
  cancellationReason?: string
  confirmedAt?: string
  completedAt?: string
  paymentRecordId?: number
  paymentProvider?: string
  stripeSessionId?: string
  paymentIntentId?: string
  paymentAmount?: number
  amountRefunded?: number
  paymentRefundable?: boolean
  confirmationEmailAvailable?: boolean
  createdAt: string
  updatedAt?: string
  history?: RegistrationHistory[]
}

export interface RegistrationFormData {
  programId?: number
  eventId?: number
  trainingSessionId?: number
  registrationType?: RegistrationType
  status?: RegistrationStatus
  paymentStatus?: RegistrationPaymentStatus
  participantName: string
  participantAge?: string
  participantEmail?: string
  participantPhone?: string
  guardianName?: string
  guardianEmail: string
  guardianPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  medicalNotes?: string
  experienceLevel?: string
  scheduledDate?: string
  scheduledStartTime?: string
  scheduledEndTime?: string
  timezone?: string
  priceAmount?: number | ''
  amountPaid?: number | ''
  currency?: string
  waiverAccepted?: boolean
  customerNotes?: string
  adminNotes?: string
}

export type TrainingSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface TrainingSession {
  id: number
  programId?: number
  programName?: string
  programSlug?: string
  eventId?: number
  eventTitle?: string
  scheduledDate: string
  startTime: string
  endTime?: string
  timezone?: string
  location?: string
  coachUserId?: number
  coachName?: string
  coachEmail?: string
  coachLabel?: string
  capacity: number
  registrationCount: number
  roster?: Registration[]
  status: TrainingSessionStatus
  notes?: string
  sessionSeriesId?: number
  createdAt: string
  updatedAt?: string
}

export interface SessionSeries {
  id: number
  coachUserId?: number
  coachName?: string
  coachEmail?: string
  programId: number
  programName?: string
  title?: string
  startDate: string
  endDate: string
  weekdays: string
  startTime: string
  durationMinutes: number
  capacity: number
  location?: string
  notes?: string
  active: boolean
  createdAt: string
  updatedAt?: string
  players: Array<{
    id: number
    name: string
    parentUserEmail?: string
  }>
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  cancelledSessions: number
}

export interface SessionSeriesFormData {
  programId: number
  coachUserId?: number
  playerProfileIds?: number[]
  title?: string
  startDate: string
  endDate?: string
  numberOfWeeks?: number
  weekdays: string
  startTime: string
  durationMinutes: number
  capacity: number
  location?: string
  notes?: string
  active: boolean
}

export interface SessionSeriesPreviewItem {
  date: string
  dayOfWeek: string
  startTime: string
  coachName?: string
  programName?: string
  conflict: boolean
  conflictReason?: string
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

export interface AdminUserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
}

export interface ParticipantAssignmentFormData {
  userId?: number
  playerProfileId?: number
  manualName?: string
  manualEmail?: string
}

export interface MediaPostUpdateFormData {
  caption?: string
  altText?: string
  mediaCategory?: MediaCategory
  placements?: MediaPlacement[]
  clearMediaCategory?: boolean
}

export interface FaqItemFormData {
  question: string
  answer: string
  category?: string
  active: boolean
  featured: boolean
  displayOrder: number
}

export interface CoachProfileFormData {
  displayName: string
  roleTitle?: string
  bio?: string
  headshotMediaPostId?: number
  specialties?: string
  certifications?: string
  instagramUrl?: string
  websiteUrl?: string
  bookingUrl?: string
  featured: boolean
  displayOrder: number
  active: boolean
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


