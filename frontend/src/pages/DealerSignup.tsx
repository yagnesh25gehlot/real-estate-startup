import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, Mail, User, Users, CheckCircle, Lock, Eye, EyeOff, Phone, CreditCard, Upload, X } from 'lucide-react'
import { authApi } from '../services/api'

const DealerSignup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    mobile: '',
    aadhaar: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null)
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null)

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }
    
    return { isValid: errors.length === 0, errors }
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
      
      setAadhaarImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAadhaarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAadhaarImage = () => {
    setAadhaarImage(null)
    setAadhaarPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate mobile number (mandatory)
    if (!formData.mobile.trim()) {
      toast.error('Mobile number is required')
      return
    }
    
    // Validate mobile number format (10 digits)
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.mobile.trim())) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    
    // Validate Aadhaar number format if provided (optional)
    if (formData.aadhaar.trim()) {
      const aadhaarRegex = /^[0-9]{12}$/
      if (!aadhaarRegex.test(formData.aadhaar.trim())) {
        toast.error('Please enter a valid 12-digit Aadhaar number')
        return
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0])
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('mobile', formData.mobile)
      formDataToSend.append('aadhaar', formData.aadhaar)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('referralCode', formData.referralCode)
      
      if (aadhaarImage) {
        formDataToSend.append('aadhaarImage', aadhaarImage)
      }
      
      await authApi.dealerSignup(formDataToSend)
      toast.success('Dealer registration submitted successfully! Awaiting admin approval. You can sign in as a regular user while waiting.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Become a Dealer - RealtyTopper</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Become a Dealer
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our network and start earning commissions
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-primary-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Why Become a Dealer?</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm text-primary-800">Earn commissions on every sale</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm text-primary-800">Build your own network</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm text-primary-800">Access exclusive properties</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm text-primary-800">Professional support team</span>
              </div>
            </div>
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="input pl-10"
                    placeholder="Enter your 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for account verification</p>
              </div>

              <div>
                <label htmlFor="aadhaar" className="label">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="aadhaar"
                    name="aadhaar"
                    type="text"
                    autoComplete="off"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    className="input pl-10"
                    placeholder="Enter your 12-digit Aadhaar number"
                    maxLength={12}
                  />
                </div>
                                  <p className="text-xs text-gray-500 mt-1">Required for verification</p>
              </div>

              <div>
                <label htmlFor="aadhaarImage" className="label">
                  Aadhaar Card Image <span className="text-red-500">*</span>
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                    <div className="flex space-x-1">
                      {[
                        formData.password.length >= 8,
                        /(?=.*[a-z])/.test(formData.password),
                        /(?=.*[A-Z])/.test(formData.password),
                        /(?=.*\d)/.test(formData.password),
                        /(?=.*[@$!%*?&])/.test(formData.password)
                      ].map((criterion, index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded ${
                            criterion ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Must contain: 8+ chars, lowercase, uppercase, number, special char
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="referralCode" className="label">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                    className="input pl-10"
                    placeholder="Enter referral code if you have one"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If you were referred by an existing dealer, enter their referral code here. Leave empty to join directly under the company.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </a>
            </p>
          </div>


        </div>
      </div>
    </>
  )
}

export default DealerSignup 