import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, User, Lock, Eye, EyeOff, Phone, CreditCard, Upload, X } from 'lucide-react'
import { authService, SignupData } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    mobile: '',
    aadhaar: '',
    aadhaarImage: undefined
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAadhaarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      setFormData(prev => ({ ...prev, aadhaarImage: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setAadhaarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAadhaarImage = () => {
    setFormData(prev => ({ ...prev, aadhaarImage: undefined }))
    setAadhaarPreview(null)
  }

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return false
    }

    if (!authService.validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    if (!authService.validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters with lowercase, uppercase, number, and special character')
      return false
    }

    if (!authService.validateMobile(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return false
    }

    if (!authService.validateAadhaar(formData.aadhaar)) {
      toast.error('Please enter a valid 12-digit Aadhaar number')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

                               try {
              const response = await authService.signup(formData)
              
              // Use AuthContext login method which handles navigation
              await login(response.user)
              
              toast.success('Account created successfully!')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - Property Platform</title>
        <meta name="description" content="Create your account on Property Platform" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join thousands of users finding their perfect property
            </p>
          </div>

          <div className="card">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="label">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Enter your 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for account verification</p>
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with lowercase, uppercase, number, and special character</p>
              </div>

              <div>
                <label htmlFor="aadhaar" className="label">
                  Aadhaar Number <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="aadhaar"
                    name="aadhaar"
                    type="text"
                    autoComplete="off"
                    value={formData.aadhaar}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Enter your 12-digit Aadhaar number"
                    maxLength={12}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional for additional verification</p>
              </div>

              <div>
                <label htmlFor="aadhaarImage" className="label">
                  Aadhaar Card Image <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="space-y-3">
                  {aadhaarPreview ? (
                    <div className="relative">
                      <img 
                        src={aadhaarPreview} 
                        alt="Aadhaar preview" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeAadhaarImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="aadhaarImage"
                        name="aadhaarImage"
                        type="file"
                        accept="image/*"
                        onChange={handleAadhaarImageChange}
                        className="hidden"
                      />
                      <label htmlFor="aadhaarImage" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload Aadhaar card image</p>
                        <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload a clear image of your Aadhaar card for verification</p>
              </div>



              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Want to earn commissions?{' '}
              <Link to="/dealer-signup" className="font-medium text-primary-600 hover:text-primary-500">
                Become a dealer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup
