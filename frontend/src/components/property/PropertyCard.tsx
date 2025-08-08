import { Link } from 'react-router-dom'
import { MapPin, IndianRupee } from 'lucide-react'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    description: string
    type: string
    location: string
    price: number
    status: string
    mediaUrls: string[]
    createdAt: string
    owner: {
      name: string
    }
  }
}

const PropertyCard = ({ property }: PropertyCardProps) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE':
        return 'bg-green-100 text-green-800'
      case 'BOOKED':
        return 'bg-yellow-100 text-yellow-800'
      case 'SOLD':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get the correct image URL
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-property.svg'
    if (url.includes('example.com/mock-upload')) return '/placeholder-property.svg'
    if (url.startsWith('/uploads/')) {
      const fullUrl = `http://localhost:3001${url}`
      return encodeURI(fullUrl)
    }
    return url
  }

  const imageUrl = property.mediaUrls?.[0] ? getImageUrl(property.mediaUrls[0]) : '/placeholder-property.svg'
  
  // Debug: Log the image URL being used
  console.log('🔍 PropertyCard - Original URL:', property.mediaUrls?.[0])
  console.log('🔍 PropertyCard - Processed URL:', imageUrl)

  return (
    <Link to={`/property/${property.id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-200 h-full">
        {/* Property Image */}
        <div className="relative mb-4">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              console.error('PropertyCard image failed to load:', imageUrl)
              e.currentTarget.src = '/placeholder-property.svg'
            }}
            onLoad={() => {
              console.log('PropertyCard image loaded successfully:', imageUrl)
            }}
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {property.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {property.description}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
          </div>

          {/* Property Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
              {property.type}
            </span>
            <span className="text-sm text-gray-500">
              Listed {formatDate(property.createdAt)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IndianRupee className="h-5 w-5 text-green-600 mr-1" />
              <span className="text-xl font-bold text-gray-900">
                ₹{formatPrice(property.price)}
              </span>
            </div>
          </div>

          {/* Owner */}
          <div className="text-sm text-gray-500">
            Listed by {property.owner?.name || 'Anonymous'}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PropertyCard 