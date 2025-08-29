import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
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
  IndianRupee,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { propertiesApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import BookingModal from "../components/BookingModal";

const PropertyDetail = () => {
  console.log("🔍 PropertyDetail component initialized");

  const { id } = useParams<{ id: string }>();
  console.log("🔍 Property ID from params:", id);

  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      console.log("🔍 Fetching property with ID:", id);
      if (!id) {
        console.log("🔍 No ID provided");
        return;
      }

      try {
        setLoading(true);
        console.log("🔍 Making API call...");
        const response = await propertiesApi.getById(id);
        console.log("🔍 API response:", response);
        setProperty(response.data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
        console.log("🔍 Loading finished");
      }
    };

    fetchProperty();
  }, [id]);

  const handleBookingSuccess = () => {
    window.location.reload();
  };

  const handleBookProperty = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book this property");
      return;
    }
    setShowBookingModal(true);
  };

  // Image navigation functions
  const nextImage = () => {
    if (mediaUrlsArray && currentImageIndex < mediaUrlsArray.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Calculate booking charges based on property action
  const calculateBookingCharges = (prop: any) => {
    if (prop.action === "RENT") {
      // For rent: 1 month rent
      return prop.perMonthCharges || 0;
    } else if (prop.action === "LEASE") {
      // For lease: Total amount / Total duration (1 month equivalent)
      // If duration is 0, use total amount as booking charges
      if (!prop.leaseDuration || prop.leaseDuration === 0) {
        return prop.perMonthCharges || 0;
      }
      return Math.round((prop.perMonthCharges || 0) / prop.leaseDuration);
    } else {
      // For SELL: Use stored booking charges or 0
      return prop.bookingCharges || 0;
    }
  };

  console.log("🔍 Component state:", { loading, property, id });

  if (loading) {
    console.log("🔍 Loading state");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    console.log("🔍 No property found");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-red-600">Property not found</p>
            <p>ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  const prop = property.data || property;
  const calculatedBookingCharges = calculateBookingCharges(prop);

  const getImageUrl = (url: string) => {
    console.log("🔍 getImageUrl called with:", url);
    if (!url) return "/placeholder-property.svg";
    if (url.includes("example.com/mock-upload"))
      return "/placeholder-property.svg";
    if (url.startsWith("/uploads/")) {
      const baseUrl = import.meta.env.PROD
        ? window.location.origin
        : import.meta.env.VITE_API_URL || "http://localhost:3001";
      const fullUrl = `${baseUrl}${url}`;
      console.log("🔍 Generated image URL:", fullUrl);
      return encodeURI(fullUrl);
    }
    return url;
  };

  // Parse mediaUrls from JSON string to array
  const mediaUrlsArray = prop.mediaUrls
    ? typeof prop.mediaUrls === "string"
      ? JSON.parse(prop.mediaUrls)
      : prop.mediaUrls
    : [];

  console.log("🔍 Property Detail Debug:", {
    prop,
    mediaUrls: prop.mediaUrls,
    mediaUrlsArray,
    currentImageIndex,
  });

  // Parse amenities from string to array
  const amenitiesArray = prop.amenities
    ? typeof prop.amenities === "string"
      ? prop.amenities.split(",").map((a: string) => a.trim())
      : prop.amenities
    : [];

  console.log("🔍 Rendering PropertyDetail component");

  return (
    <>
      <Helmet>
        <title>
          {prop
            ? `${prop.title} - RealtyTopper`
            : "Property Details - RealtyTopper"}
        </title>
        <meta
          name="description"
          content={
            prop
              ? `${prop.title} for sale in ${prop.location}`
              : "Property details on RealtyTopper"
          }
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{prop.title}</h1>
            <p className="mt-2 text-gray-600">
              Property details and specifications
            </p>
          </div>

          {/* Property Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Property Images
            </h2>

            {mediaUrlsArray && mediaUrlsArray.length > 0 ? (
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={getImageUrl(mediaUrlsArray[currentImageIndex])}
                    alt={`${prop.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                    onError={(e) => {
                      console.error(
                        "❌ Image failed to load:",
                        mediaUrlsArray[currentImageIndex]
                      );
                      e.currentTarget.src = "/placeholder-property.svg";
                    }}
                    onLoad={() => {
                      console.log(
                        "✅ Image loaded successfully:",
                        mediaUrlsArray[currentImageIndex]
                      );
                    }}
                  />

                  {/* Navigation Buttons */}
                  {mediaUrlsArray.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm ${
                          currentImageIndex === 0
                            ? "bg-gray-400 bg-opacity-50 cursor-not-allowed"
                            : "bg-white bg-opacity-90 hover:bg-opacity-100 hover:scale-110 hover:shadow-xl"
                        }`}
                        aria-label="Previous image"
                      >
                        <ChevronLeft
                          className={`h-6 w-6 ${
                            currentImageIndex === 0
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        />
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={nextImage}
                        disabled={
                          currentImageIndex === mediaUrlsArray.length - 1
                        }
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm ${
                          currentImageIndex === mediaUrlsArray.length - 1
                            ? "bg-gray-400 bg-opacity-50 cursor-not-allowed"
                            : "bg-white bg-opacity-90 hover:bg-opacity-100 hover:scale-110 hover:shadow-xl"
                        }`}
                        aria-label="Next image"
                      >
                        <ChevronRight
                          className={`h-6 w-6 ${
                            currentImageIndex === mediaUrlsArray.length - 1
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {currentImageIndex + 1} / {mediaUrlsArray.length}
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                {mediaUrlsArray.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {mediaUrlsArray.map((url: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          currentImageIndex === index
                            ? "border-blue-500 shadow-lg"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={getImageUrl(url)}
                          alt={`${prop.title} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-property.svg";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    No images available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.title}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.type}
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.action}
                </div>
              </div>

              {/* Registered As */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered As
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.registeredAs}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.location}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div
                  className={`w-full px-3 py-2 border rounded-md ${
                    prop.status === "FREE"
                      ? "bg-green-50 border-green-300 text-green-800"
                      : prop.status === "BOOKED"
                      ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                      : "bg-red-50 border-red-300 text-red-800"
                  }`}
                >
                  {prop.status}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                {prop.address}
              </div>
            </div>

            {/* Location Coordinates */}
            {prop.latitude && prop.longitude && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Coordinates
                </label>
                <div className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-md text-green-800">
                  Latitude: {prop.latitude}, Longitude: {prop.longitude}
                </div>
              </div>
            )}

            {/* Registered As Description */}
            {prop.registeredAs === "OTHER" && prop.registeredAsDescription && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.registeredAsDescription}
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prop.action === "SELL" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    ₹{prop.price?.toLocaleString() || "0"}
                  </div>
                </div>
              ) : prop.action === "LEASE" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Charges (₹)
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      ₹{prop.perMonthCharges?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (months)
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {prop.leaseDuration || "0"} months
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Month Rent (₹)
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      ₹{prop.perMonthCharges?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period (months)
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {prop.noticePeriod || "0"} months
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Tenants
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      {prop.allowedTenants || "Not specified"}
                    </div>
                  </div>
                </>
              )}

              {/* Booking Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Charges (₹)
                  {prop.action === "RENT" && (
                    <span className="text-xs text-gray-500 ml-2">
                      (1 month rent)
                    </span>
                  )}
                  {prop.action === "LEASE" && (
                    <span className="text-xs text-gray-500 ml-2">
                      (
                      {prop.leaseDuration && prop.leaseDuration > 0
                        ? "1 month equivalent"
                        : "Total amount"}
                      )
                    </span>
                  )}
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  ₹{calculatedBookingCharges?.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft)
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.area || "Not specified"}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.dimensions || "Not specified"}
                </div>
              </div>

              {/* BHK - Only show for non-PLOT and non-SHOP properties */}
              {prop.type !== "PLOT" && prop.type !== "SHOP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BHK
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    {prop.bhk || "Not specified"}
                  </div>
                </div>
              )}

              {/* Number of Rooms - Only show for non-PLOT and non-SHOP properties */}
              {prop.type !== "PLOT" && prop.type !== "SHOP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    {prop.numberOfRooms || "Not specified"}
                  </div>
                </div>
              )}

              {/* Furnishing Status - Only show for non-PLOT and non-SHOP properties */}
              {prop.type !== "PLOT" && prop.type !== "SHOP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing Status
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    {prop.furnishingStatus || "Not specified"}
                  </div>
                </div>
              )}

              {/* Availability Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Date
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  {prop.availabilityDate
                    ? new Date(prop.availabilityDate).toLocaleDateString()
                    : "Not specified"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md min-h-[100px]">
                {prop.description || "No description available"}
              </div>
            </div>

            {/* Specifications */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md min-h-[80px]">
                {prop.specifications || "No specifications available"}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Amenities
            </h2>

            {amenitiesArray.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenitiesArray.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No amenities specified
              </div>
            )}

            {/* Additional Amenities */}
            {prop.additionalAmenities && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Amenities
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md min-h-[80px]">
                  {prop.additionalAmenities}
                </div>
              </div>
            )}
          </div>

          {/* Booking Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book This Property
            </h2>

            {prop.status === "FREE" ? (
              <div className="space-y-6">
                {/* Pricing Details */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <IndianRupee className="h-5 w-5 mr-2" />
                    Pricing Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {prop.action === "RENT"
                          ? "Monthly Rent"
                          : prop.action === "LEASE"
                          ? "Total Lease Amount"
                          : "Property Price"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹
                        {prop.price?.toLocaleString() ||
                          prop.perMonthCharges?.toLocaleString() ||
                          "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Booking Charges
                        {prop.action === "RENT" && (
                          <span className="text-xs text-gray-500 ml-2">
                            (1 month rent)
                          </span>
                        )}
                        {prop.action === "LEASE" && (
                          <span className="text-xs text-gray-500 ml-2">
                            (
                            {prop.leaseDuration && prop.leaseDuration > 0
                              ? "1 month equivalent"
                              : "Total amount"}
                            )
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{calculatedBookingCharges?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Total amount
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{calculatedBookingCharges?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Message */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Important:</strong> Contact us before booking to
                    explore special offers, discounts, or personalized
                    assistance. Our team will guide you through the booking
                    process.
                  </p>
                </div>

                {/* Booking Features */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                    <span>Contact us before booking for special offers</span>
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
                      Book Now - ₹
                      {calculatedBookingCharges?.toLocaleString() || "0"}
                    </div>
                  </button>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <p className="text-yellow-800 font-medium">
                        Please login to book this property
                      </p>
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
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Not Available
                </h4>
                <p className="text-gray-600">
                  This property is currently not available for booking
                </p>
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Need Help?
              </h2>
              <p className="text-gray-600 text-lg">
                Our team is here to assist you with any questions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Call Us
                </h3>
                <p className="text-gray-600">+91 7023176884</p>
                <p className="text-sm text-gray-500">Available 24/7</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Support
                </h3>
                <p className="text-gray-600">
                  bussiness.startup.work@gmail.com
                </p>
                <p className="text-sm text-gray-500">Response within 2 hours</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  24/7 Support
                </h3>
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
      </div>
    </>
  );
};

export default PropertyDetail;
