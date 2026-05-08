import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import CanonicalMeta from './components/CanonicalMeta'
import CookieConsentBanner from './components/CookieConsentBanner'
import LoadingSpinner from './components/LoadingSpinner'
import ScrollToTop from './components/ScrollToTop'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/ResponsiveAdminLayout'
import CaptainLayout from './layouts/CaptainLayout'
import { getPortalDestination } from './utils/portal'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const TrainingPage = lazy(() => import('./pages/TrainingPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventRegisterPage = lazy(() => import('./pages/EventRegisterPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const MediaPage = lazy(() => import('./pages/MediaPage'))
const AboutPage = lazy(() => import('./pages/AboutMediaPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BookPage = lazy(() => import('./pages/BookPage'))
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const TournamentsPage = lazy(() => import('./pages/TournamentsPage'))
const TournamentDetailPage = lazy(() => import('./pages/TournamentDetailPage'))
const PublicTeamRegisterPage = lazy(() => import('./pages/PublicTeamRegisterPage'))
const TournamentRegistrationDashboardPage = lazy(
  () => import('./pages/TournamentRegistrationDashboardPage'),
)
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))
const CancellationPolicyPage = lazy(() => import('./pages/CancellationPolicyPage'))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'))
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'))
const AdminProgramsPage = lazy(() => import('./pages/admin/AdminProgramsWorkspacePage'))
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsWorkspacePage'))
const AdminTournamentsPage = lazy(() => import('./pages/admin/AdminTournamentsPage'))
const AdminTournamentWorkflowPage = lazy(() => import('./pages/admin/AdminTournamentWorkflowPage'))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'))
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'))
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'))
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminAvailabilityPage = lazy(() => import('./pages/admin/AdminAvailabilityPage'))
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'))
const AdminWaiversPage = lazy(() => import('./pages/admin/AdminWaiversPage'))
const AdminProgressNotesPage = lazy(() => import('./pages/admin/AdminProgressNotesPage'))

const CaptainTournamentsPage = lazy(() => import('./pages/captain/CaptainTournamentsPage'))
const CaptainRegistrationsPage = lazy(() => import('./pages/captain/CaptainRegistrationsPage'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <LoadingSpinner label="Loading..." />
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center">
      <div>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-5xl font-black text-white">404</h1>
        <p className="mb-8 text-lg text-gray-400">Page not found.</p>
        <a href="/" className="btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  )
}

function LegacyPortalRedirect() {
  const { user } = useAuth()
  return <Navigate to={getPortalDestination(user?.role)?.path ?? '/account'} replace />
}

function AdminRedirect() {
  return <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <CanonicalMeta />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/training"
              element={
                <MainLayout>
                  <TrainingPage />
                </MainLayout>
              }
            />
            <Route
              path="/events"
              element={
                <MainLayout>
                  <EventsPage />
                </MainLayout>
              }
            />
            <Route
              path="/events/:id/register"
              element={
                <MainLayout>
                  <EventRegisterPage />
                </MainLayout>
              }
            />
            <Route
              path="/results"
              element={
                <MainLayout>
                  <ResultsPage />
                </MainLayout>
              }
            />
            <Route
              path="/media"
              element={
                <MainLayout>
                  <MediaPage />
                </MainLayout>
              }
            />
            <Route
              path="/about"
              element={
                <MainLayout>
                  <AboutPage />
                </MainLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <MainLayout>
                  <ContactPage />
                </MainLayout>
              }
            />
            <Route
              path="/tournaments"
              element={
                <MainLayout>
                  <TournamentsPage />
                </MainLayout>
              }
            />
            <Route
              path="/tournaments/:id"
              element={
                <MainLayout>
                  <TournamentDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/tournaments/:id/register"
              element={
                <MainLayout>
                  <PublicTeamRegisterPage />
                </MainLayout>
              }
            />
            <Route
              path="/tournaments/registration/:token"
              element={
                <MainLayout>
                  <TournamentRegistrationDashboardPage />
                </MainLayout>
              }
            />
            <Route path="/book" element={<BookPage />} />
            <Route path="/book/success" element={<BookingSuccessPage />} />
            <Route path="/schedule" element={<Navigate to="/book" replace />} />
            <Route path="/sessions" element={<Navigate to="/book" replace />} />

            <Route
              path="/privacy"
              element={
                <MainLayout>
                  <PrivacyPolicyPage />
                </MainLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <MainLayout>
                  <TermsOfServicePage />
                </MainLayout>
              }
            />
            <Route
              path="/cancellation-policy"
              element={
                <MainLayout>
                  <CancellationPolicyPage />
                </MainLayout>
              }
            />
            <Route
              path="/cookie-policy"
              element={
                <MainLayout>
                  <CookiePolicyPage />
                </MainLayout>
              }
            />
            <Route
              path="/accessibility"
              element={
                <MainLayout>
                  <AccessibilityPage />
                </MainLayout>
              }
            />
            <Route
              path="/faq"
              element={
                <MainLayout>
                  <FaqPage />
                </MainLayout>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/captain"
              element={
                <ProtectedRoute requireRoles={['TEAM_CAPTAIN', 'COACH']}>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/tournaments"
              element={
                <ProtectedRoute requireRoles={['TEAM_CAPTAIN', 'COACH']}>
                  <CaptainLayout>
                    <CaptainTournamentsPage />
                  </CaptainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/registrations"
              element={
                <ProtectedRoute requireRoles={['TEAM_CAPTAIN', 'COACH']}>
                  <CaptainLayout>
                    <CaptainRegistrationsPage />
                  </CaptainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/captain/*"
              element={
                <ProtectedRoute requireRoles={['TEAM_CAPTAIN', 'COACH']}>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coach/*"
              element={
                <ProtectedRoute requireRoles={['COACH', 'TEAM_CAPTAIN']}>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/*"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/*"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waivers"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollments"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <LegacyPortalRedirect />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminBookingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/availability"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminAvailabilityPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/programs"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminProgramsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminEventsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tournaments"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminTournamentsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tournaments/workflow"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminTournamentWorkflowPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tournaments/:id/workflow"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminTournamentWorkflowPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminContentPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/media"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminMediaPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/testimonials"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminTestimonialsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminMessagesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminUsersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminPaymentsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/waivers"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminWaiversPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/progress-notes"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminProgressNotesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminRedirect />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <CookieConsentBanner />
      </BrowserRouter>
    </AuthProvider>
  )
}
