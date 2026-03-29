import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
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
import TournamentsPage from './pages/TournamentsPage'
import TeamRegisterPage from './pages/TeamRegisterPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminProgramsPage from './pages/admin/AdminProgramsPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminTournamentsPage from './pages/admin/AdminTournamentsPage'
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'

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
        <Routes>
          {/* Public routes */}
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
          <Route path="/tournaments/:id/register" element={<TeamRegisterPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/book/success" element={<BookingSuccessPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes */}
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
