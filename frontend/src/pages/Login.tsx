import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { authService, LoginData } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginData>({
    email: 'bussinessstatupwork@gmail.com',
    password: '12345678'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Add mobile-specific error handling
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all fields')
        return
      }

      const response = await authService.login(formData)
      
      // Use AuthContext login method which handles navigation
      await login(response.user)
      
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Mobile-friendly error messages
      let errorMessage = 'Login failed'
      if (error.message) {
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        } else if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login - Property Platform</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/dealer-signup" className="font-medium text-primary-600 hover:text-primary-500">
                become a dealer
              </Link>
            </p>
          </div>

          <div className="card">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Enter your email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                    inputMode="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary disabled:opacity-50 min-h-[44px] touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
              {' '}or{' '}
              <Link to="/dealer-signup" className="font-medium text-primary-600 hover:text-primary-500">
                become a dealer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login 