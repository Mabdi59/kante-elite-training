import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import TrainingPage from './pages/TrainingPage'
import EventsPage from './pages/EventsPage'
import ResultsPage from './pages/ResultsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BookPage from './pages/BookPage'
import BookingSuccessPage from './pages/BookingSuccessPage'

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
    <BrowserRouter>
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
        <Route path="/book" element={<BookPage />} />
        <Route path="/book/success" element={<BookingSuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
