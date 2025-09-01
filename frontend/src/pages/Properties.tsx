import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  Home,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Bed,
  Car,
  Sofa,
  Star,
  Grid,
  List,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { propertiesApi } from "../services/api";
import PropertyCard from "../components/property/PropertyCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ComprehensivePropertyFilters from "../components/property/ComprehensivePropertyFilters";
import { toast } from "react-hot-toast";

interface PropertyFilters {
  // Basic Information
  type: string;
  action: string;
  location: string;
  status: string;
  registeredAs: string;

  // Pricing (Dynamic based on action)
  minPrice?: number;
  maxPrice?: number;
  minPerMonthCharges?: number;
  maxPerMonthCharges?: number;
  minLeaseDuration?: number;
  maxLeaseDuration?: number;

  // Property Details
  minArea?: number;
  maxArea?: number;
  bhk?: number;
  furnishingStatus: string;
  parkingAvailable: boolean;
  minRooms?: number;
  maxRooms?: number;
  availabilityDate?: string;

  // Additional Details
  allowedTenants: string;
  noticePeriod?: number;
  minBookingCharges?: number;
  maxBookingCharges?: number;

  // Amenities
  amenities: string[];
  additionalAmenities: string;

  // Location Details
  city: string;
  state: string;
  locality: string;
  landmark: string;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;

  // Sort & Display
  sortBy: string;
  sortOrder: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  action: string;
  location: string;
  address: string;
  price?: number;
  perMonthCharges?: number;
  area: number;
  bhk?: number;
  furnishingStatus: string;
  parkingAvailable: boolean;
  status: string;
  amenities: string[];
  mediaUrls: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Initialize filters from URL params
  const getInitialFilters = (): PropertyFilters => ({
    // Basic Information
    type: searchParams.get("type") || "",
    action: searchParams.get("action") || "",
    location: searchParams.get("location") || "",
    status: searchParams.get("status") || "FREE",
    registeredAs: searchParams.get("registeredAs") || "",

    // Pricing (Dynamic based on action)
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minPerMonthCharges: searchParams.get("minPerMonthCharges")
      ? Number(searchParams.get("minPerMonthCharges"))
      : undefined,
    maxPerMonthCharges: searchParams.get("maxPerMonthCharges")
      ? Number(searchParams.get("maxPerMonthCharges"))
      : undefined,
    minLeaseDuration: searchParams.get("minLeaseDuration")
      ? Number(searchParams.get("minLeaseDuration"))
      : undefined,
    maxLeaseDuration: searchParams.get("maxLeaseDuration")
      ? Number(searchParams.get("maxLeaseDuration"))
      : undefined,

    // Property Details
    minArea: searchParams.get("minArea")
      ? Number(searchParams.get("minArea"))
      : undefined,
    maxArea: searchParams.get("maxArea")
      ? Number(searchParams.get("maxArea"))
      : undefined,
    bhk: searchParams.get("bhk") ? Number(searchParams.get("bhk")) : undefined,
    furnishingStatus: searchParams.get("furnishingStatus") || "",
    parkingAvailable: searchParams.get("parkingAvailable") === "true",
    minRooms: searchParams.get("minRooms")
      ? Number(searchParams.get("minRooms"))
      : undefined,
    maxRooms: searchParams.get("maxRooms")
      ? Number(searchParams.get("maxRooms"))
      : undefined,
    availabilityDate: searchParams.get("availabilityDate") || "",

    // Additional Details
    allowedTenants: searchParams.get("allowedTenants") || "",
    noticePeriod: searchParams.get("noticePeriod")
      ? Number(searchParams.get("noticePeriod"))
      : undefined,
    minBookingCharges: searchParams.get("minBookingCharges")
      ? Number(searchParams.get("minBookingCharges"))
      : undefined,
    maxBookingCharges: searchParams.get("maxBookingCharges")
      ? Number(searchParams.get("maxBookingCharges"))
      : undefined,

    // Amenities
    amenities: searchParams.get("amenities")
      ? searchParams.get("amenities")!.split(",")
      : [],
    additionalAmenities: searchParams.get("additionalAmenities") || "",

    // Location Details
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    locality: searchParams.get("locality") || "",
    landmark: searchParams.get("landmark") || "",
    minLatitude: searchParams.get("minLatitude")
      ? Number(searchParams.get("minLatitude"))
      : undefined,
    maxLatitude: searchParams.get("maxLatitude")
      ? Number(searchParams.get("maxLatitude"))
      : undefined,
    minLongitude: searchParams.get("minLongitude")
      ? Number(searchParams.get("minLongitude"))
      : undefined,
    maxLongitude: searchParams.get("maxLongitude")
      ? Number(searchParams.get("maxLongitude"))
      : undefined,

    // Advanced Filters

    // Sort & Display
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const [filters, setFilters] = useState<PropertyFilters>(getInitialFilters);

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      // Build query parameters as object
      const params: any = {
        page: currentPage,
        limit: 12,
        _t: Date.now(), // Cache busting parameter
      };

      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== "" &&
          value !== undefined &&
          value !== null &&
          value !== false
        ) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params[key] = value.join(",");
            }
          } else {
            params[key] = value;
          }
        }
      });

      const response = await propertiesApi.getAll(params);

      console.log("🔍 Properties API Response:", {
        success: response.data.success,
        propertiesCount: response.data.data?.properties?.length || 0,
        totalProperties: response.data.data?.pagination?.total || 0,
        properties: response.data.data?.properties || [],
      });

      if (response.data.success) {
        const result = response.data.data;
        setProperties(result.properties || []);
        setTotalProperties(result.pagination?.total || 0);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        setError(response.data.message || "Failed to fetch properties");
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err.response?.data?.message || "Failed to fetch properties");
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== undefined &&
        value !== null &&
        value !== false
      ) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(","));
          }
        } else {
          params.append(key, String(value));
        }
      }
    });

    if (currentPage > 1) {
      params.append("page", String(currentPage));
    }

    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  // Effects
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handlers
  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    const defaultFilters: PropertyFilters = {
      type: "",
      action: "",
      location: "",
      status: "FREE",
      registeredAs: "",
      minPrice: undefined,
      maxPrice: undefined,
      minPerMonthCharges: undefined,
      maxPerMonthCharges: undefined,
      minLeaseDuration: undefined,
      maxLeaseDuration: undefined,
      minArea: undefined,
      maxArea: undefined,
      bhk: undefined,
      furnishingStatus: "",
      parkingAvailable: false,
      minRooms: undefined,
      maxRooms: undefined,
      availabilityDate: "",
      allowedTenants: "",
      noticePeriod: undefined,
      minBookingCharges: undefined,
      maxBookingCharges: undefined,
      amenities: [],
      additionalAmenities: "",
      city: "",
      state: "",
      locality: "",
      landmark: "",
      minLatitude: undefined,
      maxLatitude: undefined,
      minLongitude: undefined,
      maxLongitude: undefined,

      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    setSearchParams({});
    toast.success("All filters cleared");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageTitle = () => {
    const parts = [];
    if (filters.action) parts.push(filters.action);
    if (filters.type) parts.push(filters.type);
    if (filters.city) parts.push(`in ${filters.city}`);
    if (filters.state && !filters.city) parts.push(`in ${filters.state}`);
    if (filters.location && !filters.city && !filters.state)
      parts.push(`in ${filters.location}`);
    return parts.length > 0
      ? `${parts.join(" ")} Properties`
      : "All Properties";
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} - RealtyTopper</title>
        <meta
          name="description"
          content={`Find ${getPageTitle().toLowerCase()} with RealtyTopper. Advanced search and filtering options for your perfect property.`}
        />
      </Helmet>

      <ComprehensivePropertyFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalProperties={totalProperties}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {totalProperties} properties found
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Refresh Button */}
                <button
                  onClick={fetchProperties}
                  disabled={isLoading}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                  title="Refresh properties"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Properties
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProperties}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && properties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Properties Grid/List */}
        {!isLoading && !error && properties.length > 0 && (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </ComprehensivePropertyFilters>
    </>
  );
};

export default Properties;
