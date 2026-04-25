import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SavedJobs from './pages/SavedJobs'
import { Loader2 } from 'lucide-react'

// Protected Route Component
const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component
const PublicRoute = ({ children, user, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        setUser(null)
      } else {
        setUser(data?.session?.user ?? null)
      }

      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute user={user} loading={loading}>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <SavedJobs />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App