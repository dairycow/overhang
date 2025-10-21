import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Auth from './components/Auth'
import SessionForm from './components/SessionForm'
import SessionList from './components/SessionList'
import Dashboard from './components/Dashboard'
import Homepage from './components/Homepage'
import LocationDetail from './components/LocationDetail'
import UserSettings from './components/UserSettings'
import { authService } from './services/auth'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('authToken')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

// Navigation bar component
function Navigation({ isAuthenticated, onLogout }: { isAuthenticated: boolean; onLogout: () => void }) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Hide nav on login page and homepage
  if (location.pathname === '/login' || location.pathname === '/') {
    return null
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavigation = () => {
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    setIsMobileMenuOpen(false)
    onLogout()
  }

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="sm:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded transition-colors touch-manipulation"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="text-xl font-bold">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden sm:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded transition ${
                    location.pathname === '/dashboard'
                      ? 'bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  dashboard
                </Link>
                <Link
                  to="/sessions"
                  className={`px-4 py-2 rounded transition ${
                    location.pathname === '/sessions'
                      ? 'bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  sessions
                </Link>
                <Link
                  to="/log-session"
                  className={`px-4 py-2 rounded transition ${
                    location.pathname === '/log-session'
                      ? 'bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  log session
                </Link>
                <Link
                  to="/settings"
                  className={`px-4 py-2 rounded transition ${
                    location.pathname === '/settings'
                      ? 'bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  settings
                </Link>
              </>
            ) : null}
          </nav>

          {/* Logout button - always visible */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded transition touch-manipulation"
          >
            logout
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-700">
            <nav className="py-2">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={handleNavigation}
                    className={`block px-4 py-3 transition ${
                      location.pathname === '/dashboard'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    dashboard
                  </Link>
                  <Link
                    to="/sessions"
                    onClick={handleNavigation}
                    className={`block px-4 py-3 transition ${
                      location.pathname === '/sessions'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    sessions
                  </Link>
                  <Link
                    to="/log-session"
                    onClick={handleNavigation}
                    className={`block px-4 py-3 transition ${
                      location.pathname === '/log-session'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    log session
                  </Link>
                  <Link
                    to="/settings"
                    onClick={handleNavigation}
                    className={`block px-4 py-3 transition ${
                      location.pathname === '/settings'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    settings
                  </Link>
                </div>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-50">
        <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Homepage />
            } />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth onLogin={handleLogin} />
            } />
            <Route path="/location/:slug" element={<LocationDetail />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/sessions" element={
              <ProtectedRoute>
                <SessionList />
              </ProtectedRoute>
            } />
            <Route path="/log-session" element={
              <ProtectedRoute>
                <SessionForm onSessionCreated={() => window.location.href = '/sessions'} />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              overhang
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
