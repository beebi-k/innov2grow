import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, Briefcase, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

const Login = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (signInError) throw signInError
        navigate('/dashboard')
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })
        if (signUpError) throw signUpError
        setError('Check your email to confirm your account!')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-primary-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-800">JobHub</h1>
          <p className="text-secondary-500 mt-1">Job Listings Admin Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-secondary-800">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-secondary-500 text-sm mt-1">
              {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              error.includes('Check your email') 
                ? 'bg-success-50 text-success-600 border border-success-200' 
                : 'bg-danger-50 text-danger-600 border border-danger-200'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-modern pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-modern pl-10"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="ml-2 font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Demo note */}
        <p className="text-center text-xs text-secondary-400 mt-6">
          Configure your Supabase credentials in .env to enable authentication
        </p>
      </div>
    </div>
  )
}

export default Login