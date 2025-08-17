import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Search, 
  Filter, 
  Building2, 
  Users, 
  MapPin
} from 'lucide-react'
import { propertiesApi } from '../services/api'
import PropertyCard from '../components/property/PropertyCard'
import PropertyFilters from '../components/property/PropertyFilters'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
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
  const [propertiesPerPage] = useState(9)

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
        const params = {
          ...filters,
          page: currentPage,
          limit: propertiesPerPage
        }
        
        const response = await propertiesApi.getAll(params)
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Debounced filter change for text inputs
  const handleFilterChangeDebounced = (newFilters: any) => {
    const timeoutId = setTimeout(() => {
      setFilters(newFilters)
      setCurrentPage(1)
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }

  return (
    <>
      <Helmet>
        <title>RealtyTopper - Find Your Dream Property | Houses, Apartments, Commercial Properties</title>
        <meta name="description" content="Discover the best properties across India. Browse houses, apartments, and commercial properties for sale and rent. Verified listings with secure booking. Contact us at +91 8112279602." />
        <meta name="keywords" content="real estate, property for sale, houses for sale, apartments for rent, commercial property, property search, real estate India, property listing, buy property, rent property" />
        <meta name="author" content="RealtyTopper" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://realtytopper.com/" />
        <meta property="og:title" content="RealtyTopper - Find Your Dream Property" />
        <meta property="og:description" content="Discover the best properties across India. Browse houses, apartments, and commercial properties for sale and rent." />
        <meta property="og:image" content="https://realtytopper.com/og-image.jpg" />
        <meta property="og:site_name" content="RealtyTopper" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://realtytopper.com/" />
        <meta property="twitter:title" content="RealtyTopper - Find Your Dream Property" />
        <meta property="twitter:description" content="Discover the best properties across India. Browse houses, apartments, and commercial properties for sale and rent." />
        <meta property="twitter:image" content="https://realtytopper.com/twitter-image.jpg" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RealtyTopper" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://realtytopper.com/" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "RealtyTopper",
            "description": "Your trusted partner in real estate. We connect you with the best properties across multiple cities with verified listings and secure transactions.",
            "url": "https://realtytopper.com",
            "logo": "https://realtytopper.com/logo.png",
            "image": "https://realtytopper.com/hero-image.jpg",
            "telephone": "+918112279602",
            "email": "bussiness.startup.work@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Near Sadar Police Station",
              "addressLocality": "Bundi",
              "addressRegion": "Rajasthan",
              "postalCode": "323001",
              "addressCountry": "IN"
            },
            "sameAs": [
              "https://www.facebook.com/profile.php?id=61579263880439",
              "https://www.instagram.com/realtytopper/"
            ],
            "areaServed": {
              "@type": "Country",
              "name": "India"
            },
            "serviceType": "Real Estate Services",
            "priceRange": "₹₹"
          })}
        </script>
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "VRUSKARAMA REAL ESTATE PRIVATE LIMITED",
            "description": "Professional real estate services in Bundi, Rajasthan",
            "url": "https://realtytopper.com",
            "telephone": "+918112279602",
            "email": "bussiness.startup.work@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "C/O Rang Raj Kanwar, Near Sadar Police Station",
              "addressLocality": "Bundi",
              "addressRegion": "Rajasthan",
              "postalCode": "323001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "25.4419",
              "longitude": "75.6404"
            },
            "openingHours": "Mo-Su 09:00-18:00",
            "priceRange": "₹₹"
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 mb-12 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Find Your Dream
                <span className="block text-blue-200">Property Today</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Your trusted partner in real estate. We connect you with the best properties 
                across {stats.totalCities}+ cities with verified listings.
              </p>
            </div>

            {/* Search Bar */}
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

        {/* Filters Section */}
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

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-2 bg-white rounded-2xl shadow-lg p-4">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                    >
                      Previous
                    </button>

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
      </div>
    </>
  )
}

export default Home 