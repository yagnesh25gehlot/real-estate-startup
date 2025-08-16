import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Building2, Users, CheckCircle, ArrowLeft } from 'lucide-react'
import { authApi } from '../services/api'

const BecomeDealer = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    referralCode: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await authApi.applyForDealer({
        referralCode: formData.referralCode,
      })
      toast.success('Dealer application submitted successfully! Awaiting admin approval.')
      navigate('/dashboard')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Application failed'
      console.error('Dealer application error:', error.response?.data)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <>
      <Helmet>
        <title>Become a Dealer - Property Platform</title>
      </Helmet>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Become a Dealer</h1>
          <p className="text-gray-600 mt-2">
            Apply to become a dealer and start earning commissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dealer Application</h2>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Current User Information</h3>
                <p className="text-sm text-blue-700">
                  <strong>Name:</strong> {user.name}<br />
                  <strong>Email:</strong> {user.email}<br />
                  <strong>Current Role:</strong> {user.role}
                  {user.dealer && (
                    <>
                      <br />
                      <strong>Dealer Status:</strong> {user.dealer.status}
                      {user.dealer.referralCode && (
                        <>
                          <br />
                          <strong>Your Referral Code:</strong> {user.dealer.referralCode}
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Show status message if user already has dealer application */}
            {user.dealer && (
              <div className="mb-6">
                {user.dealer.status === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">Application Status</h3>
                    <p className="text-sm text-yellow-700">
                      You already have a pending dealer application. Please wait for admin approval.
                    </p>
                  </div>
                )}
                {user.dealer.status === 'APPROVED' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">Application Status</h3>
                    <p className="text-sm text-green-700">
                      Congratulations! You are already an approved dealer.
                    </p>
                  </div>
                )}
                {user.dealer.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-900 mb-2">Application Status</h3>
                    <p className="text-sm text-red-700">
                      Your previous dealer application was rejected. You may apply again.
                    </p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Disable form if user already has pending application */}
              {user.dealer && user.dealer.status === 'PENDING' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Your application is currently under review. Please wait for admin approval.
                  </p>
                </div>
              )}
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
                  disabled={isSubmitting || (user.dealer && user.dealer.status === 'PENDING')}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 
                   (user.dealer && user.dealer.status === 'PENDING') ? 'Application Pending' :
                   'Submit Application'}
                </button>
              </div>
            </form>
          </div>

          {/* Benefits and Information */}
          <div className="space-y-6">
            {/* Benefits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Become a Dealer?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Earn commissions on every sale</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Build your own network</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Access exclusive properties</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Professional support team</span>
                </div>

              </div>
            </div>



            {/* Process */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Process</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    1
                  </div>
                  <span className="text-sm text-gray-700">Submit your application with referral code (optional)</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    2
                  </div>
                  <span className="text-sm text-gray-700">Admin reviews your application</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    3
                  </div>
                  <span className="text-sm text-gray-700">Get approved and start earning commissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BecomeDealer
