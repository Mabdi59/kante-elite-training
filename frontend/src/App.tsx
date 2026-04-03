import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/ResponsiveAdminLayout'
import CoachPanelLayout from './layouts/CoachPanelLayout'
import StaffLayout from './layouts/StaffLayout'
import ParentLayout from './layouts/ParentLayout'
import PlayerLayout from './layouts/PlayerLayout'
import CaptainLayout from './layouts/CaptainLayout'
import UserLayout from './layouts/UserLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import LoadingSpinner from './components/LoadingSpinner'

// Public pages — eagerly loaded for fast initial render
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// All other pages are lazy-loaded for code splitting
const TrainingPage = lazy(() => import('./pages/TrainingPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
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
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'))
const AdminCoachesPage = lazy(() => import('./pages/admin/AdminCoachesPage'))
const AdminPlayersPage = lazy(() => import('./pages/admin/AdminPlayersPage'))

const CoachDashboardPage = lazy(() => import('./pages/coach/CoachDashboardPage'))
const CoachSessionsManagerPage = lazy(() => import('./pages/coach/CoachSessionsManagerPage'))
const CoachAvailabilityPage = lazy(() => import('./pages/coach/CoachAvailabilityPage'))
const CoachProfilePage = lazy(() => import('./pages/coach/CoachProfilePage'))

const StaffDashboardPage = lazy(() => import('./pages/staff/StaffDashboardPage'))
const StaffBookingsPage = lazy(() => import('./pages/staff/StaffBookingsPage'))
const StaffMessagesPage = lazy(() => import('./pages/staff/StaffMessagesPage'))
const StaffAvailabilityPage = lazy(() => import('./pages/staff/StaffAvailabilityPage'))
const StaffTournamentsPage = lazy(() => import('./pages/staff/StaffTournamentsPage'))
const StaffPlayersPage = lazy(() => import('./pages/staff/StaffPlayersPage'))

const ParentDashboardPage = lazy(() => import('./pages/parent/ParentDashboardPage'))
const ParentBookingsPage = lazy(() => import('./pages/parent/ParentBookingsPage'))
const ParentPlayersPage = lazy(() => import('./pages/parent/ParentPlayersPage'))

const UserDashboardPage = lazy(() => import('./pages/user/UserDashboardPage'))
const UserBookingsPage = lazy(() => import('./pages/user/UserBookingsPage'))
const UserPlayersPage = lazy(() => import('./pages/user/UserPlayersPage'))

const PlayerDashboardPage = lazy(() => import('./pages/player/PlayerDashboardPage'))
const PlayerSessionsPage = lazy(() => import('./pages/player/PlayerSessionsPage'))
const PlayerProfilePage = lazy(() => import('./pages/player/PlayerProfilePage'))

const CaptainDashboardPage = lazy(() => import('./pages/captain/CaptainDashboardPage'))
const CaptainTournamentsPage = lazy(() => import('./pages/captain/CaptainTournamentsPage'))
const CaptainRegistrationsPage = lazy(() => import('./pages/captain/CaptainRegistrationsPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <LoadingSpinner label="Loading…" />
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-7xl mb-6">⚽</div>
        <h1 className="text-white font-black text-5xl mb-4">404</h1>
        <p className="text-gray-400 text-lg mb-8">Page not found.</p>
        <a href="/" className="btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
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
            <Route path="/tournaments/:id/register" element={<PublicTeamRegisterPage />} />
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
              path="/parent"
              element={
                <ProtectedRoute requireRole="PARENT">
                  <ParentLayout>
                    <ParentDashboardPage />
                  </ParentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/bookings"
              element={
                <ProtectedRoute requireRole="PARENT">
                  <ParentLayout>
                    <ParentBookingsPage />
                  </ParentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/players"
              element={
                <ProtectedRoute requireRole="PARENT">
                  <ParentLayout>
                    <ParentPlayersPage />
                  </ParentLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user"
              element={
                <ProtectedRoute requireRole="USER">
                  <UserLayout>
                    <UserDashboardPage />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/bookings"
              element={
                <ProtectedRoute requireRole="USER">
                  <UserLayout>
                    <UserBookingsPage />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/players"
              element={
                <ProtectedRoute requireRole="USER">
                  <UserLayout>
                    <UserPlayersPage />
                  </UserLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/player"
              element={
                <ProtectedRoute requireRole="PLAYER">
                  <PlayerLayout>
                    <PlayerDashboardPage />
                  </PlayerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/sessions"
              element={
                <ProtectedRoute requireRole="PLAYER">
                  <PlayerLayout>
                    <PlayerSessionsPage />
                  </PlayerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/profile"
              element={
                <ProtectedRoute requireRole="PLAYER">
                  <PlayerLayout>
                    <PlayerProfilePage />
                  </PlayerLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/captain"
              element={
                <ProtectedRoute requireRoles={['TEAM_CAPTAIN', 'COACH']}>
                  <CaptainLayout>
                    <CaptainDashboardPage />
                  </CaptainLayout>
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
              path="/coach"
              element={
                <ProtectedRoute requireRole="COACH">
                  <CoachPanelLayout>
                    <CoachDashboardPage />
                  </CoachPanelLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/sessions"
              element={
                <ProtectedRoute requireRole="COACH">
                  <CoachPanelLayout>
                    <CoachSessionsManagerPage />
                  </CoachPanelLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/availability"
              element={
                <ProtectedRoute requireRole="COACH">
                  <CoachPanelLayout>
                    <CoachAvailabilityPage />
                  </CoachPanelLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/profile"
              element={
                <ProtectedRoute requireRole="COACH">
                  <CoachPanelLayout>
                    <CoachProfilePage />
                  </CoachPanelLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff"
              element={
                <ProtectedRoute requireRole="STAFF">
                  <StaffLayout>
                    <StaffDashboardPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/bookings"
              element={
                <ProtectedRoute requireRole="STAFF">
                  <StaffLayout>
                    <StaffBookingsPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/messages"
              element={
                <ProtectedRoute requireRole="STAFF">
                  <StaffLayout>
                    <StaffMessagesPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/availability"
              element={
                <ProtectedRoute requireRole="STAFF">
                  <StaffLayout>
                    <StaffAvailabilityPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/tournaments"
              element={
                <ProtectedRoute requireRole="STAFF">
                  <StaffLayout>
                    <StaffTournamentsPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/players"
              element={
                <ProtectedRoute requireRole="STAFF">
                  <StaffLayout>
                    <StaffPlayersPage />
                  </StaffLayout>
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
              path="/admin/coaches"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminCoachesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/players"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminPlayersPage />
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
              path="/admin/audit-logs"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminAuditLogsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
