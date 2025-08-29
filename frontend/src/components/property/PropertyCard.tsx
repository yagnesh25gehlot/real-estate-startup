import { Link } from "react-router-dom";
import { MapPin, IndianRupee } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    type: string;
    action?: string;
    location: string;
    price?: number;
    perMonthCharges?: number;
    area?: number;
    bhk?: number;
    furnishingStatus?: string;
    parkingAvailable?: boolean;
    status: string;
    mediaUrls: string[];
    createdAt: string;
    owner?: {
      name: string;
    };
  };
  viewMode?: "grid" | "list";
}

const PropertyCard = ({ property, viewMode = "grid" }: PropertyCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "FREE":
        return "bg-green-100 text-green-800";
      case "BOOKED":
        return "bg-yellow-100 text-yellow-800";
      case "SOLD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Parse mediaUrls from JSON string to array
  const mediaUrlsArray = property.mediaUrls
    ? typeof property.mediaUrls === "string"
      ? JSON.parse(property.mediaUrls)
      : property.mediaUrls
    : [];
  const imageUrl = mediaUrlsArray?.[0]
    ? getImageUrl(mediaUrlsArray[0])
    : "/placeholder-property.svg";

  // Debug: Log the image URL being used
  console.log("🔍 PropertyCard - Original mediaUrls:", property.mediaUrls);
  console.log("🔍 PropertyCard - Parsed array:", mediaUrlsArray);
  console.log("🔍 PropertyCard - Processed URL:", imageUrl);

  if (viewMode === "list") {
    return (
      <Link to={`/property/${property.id}`} className="block">
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <div className="flex">
            {/* Property Image */}
            <div className="relative w-64 h-48 flex-shrink-0">
              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-full object-cover rounded-l-lg"
                onError={(e) => {
                  console.error("PropertyCard image failed to load:", imageUrl);
                  e.currentTarget.src = "/placeholder-property.svg";
                }}
              />
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    property.status
                  )}`}
                >
                  {property.status}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {property.price ? (
                      <>
                        <IndianRupee className="inline w-5 h-5" />
                        {formatPrice(property.price)}
                      </>
                    ) : property.perMonthCharges ? (
                      <>
                        <IndianRupee className="inline w-5 h-5" />
                        {formatPrice(property.perMonthCharges)}
                        <span className="text-sm text-gray-500">/month</span>
                      </>
                    ) : (
                      "Price on request"
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {property.area && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.area} sq ft
                    </div>
                    <div className="text-sm text-gray-600">Area</div>
                  </div>
                )}
                {property.bhk && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.bhk} BHK
                    </div>
                    <div className="text-sm text-gray-600">Configuration</div>
                  </div>
                )}
                {property.furnishingStatus && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.furnishingStatus}
                    </div>
                    <div className="text-sm text-gray-600">Furnishing</div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Listed by {property.owner?.name || "Owner"}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(property.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link to={`/property/${property.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full">
        {/* Property Image */}
        <div className="relative mb-4">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              console.error("PropertyCard image failed to load:", imageUrl);
              e.currentTarget.src = "/placeholder-property.svg";
            }}
            onLoad={() => {
              console.log("PropertyCard image loaded successfully:", imageUrl);
            }}
          />
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                property.status
              )}`}
            >
              {property.status}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4 space-y-3">
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

          {/* Property Type and Action */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                {property.type}
              </span>
              {property.action && (
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    property.action === "RENT"
                      ? "text-blue-600 bg-blue-50"
                      : property.action === "LEASE"
                      ? "text-purple-600 bg-purple-50"
                      : "text-green-600 bg-green-50"
                  }`}
                >
                  {property.action === "RENT"
                    ? "Rent"
                    : property.action === "LEASE"
                    ? "Lease"
                    : "Buy"}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              Listed {formatDate(property.createdAt)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IndianRupee className="h-5 w-5 text-green-600 mr-1" />
              <span className="text-xl font-bold text-gray-900">
                {property.price
                  ? `₹${formatPrice(property.price)}`
                  : property.perMonthCharges
                  ? `₹${formatPrice(property.perMonthCharges)}/month`
                  : "Price on request"}
              </span>
            </div>
          </div>

          {/* Owner */}
          <div className="text-sm text-gray-500">
            Listed by {property.owner?.name || "Anonymous"}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
