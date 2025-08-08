import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Search, 
  Filter, 
  MapPin, 
  IndianRupee, 
  Building2, 
  Home as HomeIcon, 
  Users, 
  Star, 
  ArrowRight,
  Shield,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Heart,
  Zap
} from 'lucide-react'
import { propertiesApi } from '../services/api'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const Home = () => {
  console.log('Home component rendering...')
  
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    status: isAdmin ? '' : 'FREE',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [propertiesPerPage] = useState(9) // 3x3 grid

  const [data, setData] = useState<any>({
    properties: [],
    pagination: { total: 0, page: 1, pages: 1 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [stats, setStats] = useState({
    totalCities: 50,
    totalCustomers: 1000
  })

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching properties with filters:', filters)
        
        const params = {
          ...filters,
          page: currentPage,
          limit: propertiesPerPage
        }
        
        const response = await propertiesApi.getAll(params)
        console.log('API Response:', response.data)
        setData(response.data.data || { properties: [], pagination: { total: 0, page: 1, pages: 1 } })
        setError('')
      } catch (err: any) {
        console.error('Error fetching properties:', err)
        setError(err.message || 'Failed to fetch properties')
        setData({
          properties: [],
          pagination: { total: 0, page: 1, pages: 1 }
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchStats = async () => {
      try {
        const citiesResponse = await propertiesApi.getLocations()
        const cities = citiesResponse.data.data || []
        const customers = Math.max(1000, cities.length * 20)
        
        setStats({
          totalCities: cities.length,
          totalCustomers: customers
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setStats({
          totalCities: 50,
          totalCustomers: 1000
        })
      }
    }

    fetchProperties()
    fetchStats()
  }, [filters, currentPage, propertiesPerPage])

  const properties = data?.properties || []
  const pagination = data?.pagination

  console.log('Home component about to render JSX...')
  console.log('Properties data:', properties)
  console.log('Pagination data:', pagination)
  console.log('Is loading:', isLoading)
  console.log('Error:', error)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  return (
    <>
      <Helmet>
        <title>Property Platform - Find Your Perfect Property</title>
        <meta name="description" content="Discover amazing properties for sale and rent. Browse through our extensive collection of houses, apartments, and commercial properties." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with About/Business Info */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 mb-12 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4">
                  <Award className="h-4 w-4 mr-2" />
                  Trusted by {stats.totalCustomers}+ customers
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Find Your Dream
                <span className="block text-blue-200">Property Today</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Your trusted partner in real estate. We connect you with the best properties 
                across {stats.totalCities}+ cities with verified listings and secure transactions.
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by location, property type..."
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={filters.location}
                      onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Filter className="h-5 w-5" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters Section */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <PropertyFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>
        )}

        {/* Properties Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Latest Properties
              </h2>
              <p className="text-gray-600">
                Discover the newest properties added to our platform
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {pagination?.total || 0}
              </div>
              <div className="text-sm text-gray-600">
                Total Properties
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-2">Failed to load properties</p>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-6">No properties match your current filters.</p>
              <button
                onClick={() => handleFilterChange({ type: '', location: '', minPrice: '', maxPrice: '', status: isAdmin ? '' : 'FREE' })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Enhanced Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-2 bg-white rounded-2xl shadow-lg p-4">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the best real estate experience with verified properties, 
              secure transactions, and exceptional customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Properties</h3>
              <p className="text-gray-600">All properties are verified and quality-checked</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Booking</h3>
              <p className="text-gray-600">Book properties instantly with secure payments</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600">Quality properties with detailed information</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Round the clock customer support</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">{pagination?.total || 0}+</div>
              <div className="text-blue-100">Properties Listed</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">{stats.totalCustomers}+</div>
              <div className="text-green-100">Happy Customers</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">{stats.totalCities}+</div>
              <div className="text-purple-100">Cities Covered</div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 mb-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect home through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sell"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <HomeIcon className="h-5 w-5" />
              List Your Property
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              Get Started
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-12 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-xl text-gray-600">Our team is here to assist you with any questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+91 8290936884</p>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">support@propertyplatform.com</p>
              <p className="text-sm text-gray-500">Response within 2 hours</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600">Chat with our experts</p>
              <p className="text-sm text-gray-500">Instant responses</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home 