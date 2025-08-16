import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { 
  MapPin, 
  Building2,
  X,
  CreditCard,
  Lock,
  Calendar,
  User,
  Home,
  Star,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  ArrowLeft,
  Share2,
  Heart,
  Eye,
  IndianRupee
} from 'lucide-react'
import { propertiesApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import BookingModal from '../components/BookingModal'

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)


  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await propertiesApi.getById(id)
        setProperty(response.data)
      } catch (error) {
        console.error('Failed to fetch property:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  const handleBookingSuccess = () => {
    window.location.reload()
  }

  const handleBookProperty = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this property')
      return
    }
    setShowBookingModal(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!property) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Property not found</p>
      </div>
    )
  }

  const prop = property.data || property

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-property.svg'
    if (url.includes('example.com/mock-upload')) return '/placeholder-property.svg'
    if (url.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.PROD 
        ? 'https://realtytopper.com' 
        : 'http://localhost:3001'
      const fullUrl = `${baseUrl}${url}`
      return encodeURI(fullUrl)
    }
    return url
  }

  // Parse mediaUrls from JSON string to array
  const mediaUrlsArray = prop.mediaUrls ? (typeof prop.mediaUrls === 'string' ? JSON.parse(prop.mediaUrls) : prop.mediaUrls) : []
  const imageUrl = mediaUrlsArray?.[0] ? getImageUrl(mediaUrlsArray[0]) : '/placeholder-property.svg'
  

  

  

  

  


  return (
    <>
      <Helmet>
        <title>{prop.title} - RealtyTopper</title>
        <meta name="description" content={prop.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Property Details</span>
        </nav>

        {/* Enhanced Property Images Gallery */}
        <div className="mb-12">
          {mediaUrlsArray && mediaUrlsArray.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Main Image */}
              <div className="lg:col-span-2">
                <img
                  src={imageUrl}
                  alt={prop.title}
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', imageUrl)
                    e.currentTarget.src = '/placeholder-property.svg'
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', imageUrl)
                  }}
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {mediaUrlsArray.slice(1, 5).map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(url)}
                      alt={`${prop.title} ${index + 2}`}
                      className="w-full h-44 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.svg'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Building2 className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No images available</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      prop.status === 'FREE' ? 'bg-green-100 text-green-800' :
                      prop.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {prop.status}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Listed {new Date(prop.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{prop.title}</h1>
                  
                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-lg">{prop.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Owner: {prop.owner?.name || 'Anonymous'}</span>
                    </div>
                    {prop.dealer && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        <span>Dealer: {prop.dealer.user?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                                  <div className="text-right">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      ₹{prop.price?.toLocaleString() || '0'}
                    </div>
                    <div className="text-gray-600">Total Price</div>
                  </div>
              </div>
            </div>

            {/* Property Details Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Home className="h-6 w-6 mr-3 text-blue-600" />
                Property Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">{prop.type}</div>
                  <div className="text-sm text-gray-600">Property Type</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {new Date(prop.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Listed Date</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {prop.owner?.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-600">Property Owner</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Description
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed text-lg">{prop.description}</p>
                </div>
              </div>

              {prop.dealer && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Dealer Information
                  </h3>
                  <p className="text-blue-800 leading-relaxed">
                    This property is professionally managed by <strong>{prop.dealer.user?.name}</strong>. 
                    Our verified dealers ensure quality service and support throughout your booking process.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Book This Property</h3>
                <p className="text-gray-600">Secure your booking in just a few steps</p>
              </div>
              
              {prop.status === 'FREE' ? (
                <div className="space-y-6">
                  {/* Pricing Details */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      <IndianRupee className="h-5 w-5 mr-2" />
                      Pricing Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Book for</span>
                        <span className="font-semibold text-gray-900">3 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Booking charge</span>
                        <span className="font-semibold text-gray-900">₹300</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total amount</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₹300
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Features */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                      <span>Instant booking confirmation</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                      <span>Secure payment via UPI</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                      <span>24/7 customer support</span>
                    </div>
                  </div>

                  {/* Booking Button */}
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Book Now - ₹300
                      </div>
                    </button>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <p className="text-yellow-800 font-medium">Please login to book this property</p>
                      </div>
                      <a 
                        href="/login" 
                        className="inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="h-5 w-5" />
                          Login to Book
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <X className="h-10 w-10 text-red-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Not Available</h4>
                  <p className="text-gray-600">This property is currently not available for booking</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 text-lg">Our team is here to assist you with any questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+91 7023176884</p>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">bussiness.startup.work@gmail.com</p>
              <p className="text-sm text-gray-500">Response within 2 hours</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round the clock assistance</p>
              <p className="text-sm text-gray-500">Always available</p>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          property={prop}
          onSuccess={handleBookingSuccess}
        />
      </div>
    </>
  )
}

export default PropertyDetail 