import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import CoachPanelLayout from './layouts/CoachPanelLayout'
import StaffLayout from './layouts/StaffLayout'
import ParentLayout from './layouts/ParentLayout'
import PlayerLayout from './layouts/PlayerLayout'
import CaptainLayout from './layouts/CaptainLayout'
import UserLayout from './layouts/UserLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import TrainingPage from './pages/TrainingPage'
import EventsPage from './pages/EventsPage'
import ResultsPage from './pages/ResultsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BookPage from './pages/BookPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountPage from './pages/AccountPage'
import TournamentsPage from './pages/TournamentsPage'
import PublicTeamRegisterPage from './pages/PublicTeamRegisterPage'
import TournamentRegistrationDashboardPage from './pages/TournamentRegistrationDashboardPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminProgramsPage from './pages/admin/AdminProgramsPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminTournamentsPage from './pages/admin/AdminTournamentsPage'
import AdminTournamentWorkflowPage from './pages/admin/AdminTournamentWorkflowPage'
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminAvailabilityPage from './pages/admin/AdminAvailabilityPage'
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage'
import AdminCoachesPage from './pages/admin/AdminCoachesPage'
import AdminPlayersPage from './pages/admin/AdminPlayersPage'
import CoachDashboardPage from './pages/coach/CoachDashboardPage'
import CoachSessionsManagerPage from './pages/coach/CoachSessionsManagerPage'
import CoachAvailabilityPage from './pages/coach/CoachAvailabilityPage'
import CoachProfilePage from './pages/coach/CoachProfilePage'
import StaffDashboardPage from './pages/staff/StaffDashboardPage'
import StaffBookingsPage from './pages/staff/StaffBookingsPage'
import StaffMessagesPage from './pages/staff/StaffMessagesPage'
import StaffAvailabilityPage from './pages/staff/StaffAvailabilityPage'
import StaffTournamentsPage from './pages/staff/StaffTournamentsPage'
import StaffPlayersPage from './pages/staff/StaffPlayersPage'
import ParentDashboardPage from './pages/parent/ParentDashboardPage'
import ParentBookingsPage from './pages/parent/ParentBookingsPage'
import ParentPlayersPage from './pages/parent/ParentPlayersPage'
import UserDashboardPage from './pages/user/UserDashboardPage'
import UserBookingsPage from './pages/user/UserBookingsPage'
import UserPlayersPage from './pages/user/UserPlayersPage'
import PlayerDashboardPage from './pages/player/PlayerDashboardPage'
import PlayerSessionsPage from './pages/player/PlayerSessionsPage'
import PlayerProfilePage from './pages/player/PlayerProfilePage'
import CaptainDashboardPage from './pages/captain/CaptainDashboardPage'
import CaptainTournamentsPage from './pages/captain/CaptainTournamentsPage'
import CaptainRegistrationsPage from './pages/captain/CaptainRegistrationsPage'

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
      </BrowserRouter>
    </AuthProvider>
  )
}
