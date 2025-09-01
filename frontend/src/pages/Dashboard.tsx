import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../contexts/AuthContext";
import {
  Building2,
  Calendar,
  IndianRupee,
  Users,
  TrendingUp,
  UserPlus,
  ChevronDown,
  ChevronRight,
  MapPin,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { bookingsApi, dealersApi, propertiesApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import PropertyEditModal from "../components/PropertyEditModal";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

const Dashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<any>(null);
  const [commissions, setCommissions] = useState<any>(null);
  const [properties, setProperties] = useState<any>(null);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesExpanded, setPropertiesExpanded] = useState(false);
  const [bookingsExpanded, setBookingsExpanded] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [propertiesPerPage] = useState(20);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("Fetching bookings for user:", user?.id);
        const response = await bookingsApi.getMyBookings();
        console.log("Bookings response:", response);
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setBookings({ data: [] }); // Set empty array on error
      } finally {
        setBookingsLoading(false);
      }
    };

    const fetchCommissions = async () => {
      if (user?.role === "DEALER") {
        try {
          console.log("Fetching commissions for dealer:", user?.id);
          const response = await dealersApi.getCommissions();
          console.log("Commissions response:", response);
          setCommissions(response.data);
        } catch (error) {
          console.error("Failed to fetch commissions:", error);
          setCommissions({ data: [] }); // Set empty array on error
        } finally {
          setCommissionsLoading(false);
        }
      } else {
        setCommissions({ data: [] });
        setCommissionsLoading(false);
      }
    };

    const fetchProperties = async () => {
      try {
        console.log("Fetching properties for user:", user?.id);
        // For admin users or when no user is logged in, fetch all properties
        const params: any = {
          page: propertiesPage,
          limit: propertiesPerPage,
        };

        // Only filter by ownerId if user is logged in and not admin
        if (user?.id && user?.role !== "ADMIN") {
          params.ownerId = user.id;
        }

        const response = await propertiesApi.getAll(params);
        console.log("Properties response:", response);
        console.log("Properties data structure:", response.data);
        console.log("Properties array:", response.data?.data?.properties);
        setProperties(response.data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setProperties({ data: { properties: [] } }); // Set empty array on error
      } finally {
        setPropertiesLoading(false);
      }
    };

    // Always fetch properties (for admin or when no user logged in)
    fetchProperties();

    // Only fetch other data if user is authenticated
    if (user) {
      console.log("User authenticated, fetching data:", user);
      fetchBookings();
      fetchCommissions();
    } else {
      console.log("No user authenticated, setting other loading to false");
      setBookingsLoading(false);
      setCommissionsLoading(false);
    }
  }, [user, propertiesPage, propertiesPerPage]);

  // Refresh data when page becomes visible (e.g., when returning from sell property page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log("Page became visible, refreshing properties...");
        // Refresh properties when returning to dashboard
        const refreshProperties = async () => {
          try {
            const params: any = {};
            if (user?.id && user?.role !== "ADMIN") {
              params.ownerId = user.id;
            }
            const response = await propertiesApi.getAll(params);
            setProperties(response.data);
          } catch (error) {
            console.error("Failed to refresh properties:", error);
          }
        };
        refreshProperties();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await propertiesApi.delete(propertyId);
        toast.success("Property deleted successfully!");
        // Refresh properties
        const params: any = {};
        if (user?.id && user?.role !== "ADMIN") {
          params.ownerId = user.id;
        }
        const response = await propertiesApi.getAll(params);
        setProperties(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to delete property");
      }
    }
  };

  const handlePropertyUpdate = async (updatedProperty: any) => {
    try {
      // Refresh properties list to show the updated data
      const userId = user?.id || "57705c8c-dc4b-4234-aaaf-95e8d12330ed";
      const response = await propertiesApi.getAll({
        ownerId: userId,
        page: propertiesPage,
        limit: propertiesPerPage,
      });
      setProperties(response.data);

      setShowEditModal(false);
      setEditingProperty(null);
    } catch (error: any) {
      console.error("Error refreshing properties:", error);
      toast.error("Failed to refresh properties list");
    }
  };

  const handleRefreshProperties = async () => {
    if (user?.id) {
      try {
        setPropertiesLoading(true);
        setPropertiesPage(1); // Reset to first page
        const response = await propertiesApi.getAll({
          ownerId: user.id,
          page: 1,
          limit: propertiesPerPage,
        });
        setProperties(response.data);
        toast.success("Properties refreshed!");
      } catch (error) {
        console.error("Failed to refresh properties:", error);
        toast.error("Failed to refresh properties");
      } finally {
        setPropertiesLoading(false);
      }
    }
  };

  const stats = [
    // Removed Total Commissions section as requested
  ];

  if (bookingsLoading || commissionsLoading || propertiesLoading) {
    return <LoadingSpinner />;
  }

  // Show message if user is not authenticated (but allow viewing properties)
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            View all properties. Log in to manage your own properties and
            bookings.
          </p>
          <div className="mt-4 flex gap-4">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <button
              onClick={() => {
                // Quick admin login for testing
                const adminUser = {
                  id: "6cc8355d-4080-44d0-a80c-c526531ba95c",
                  email: "bussinessstartupwork@gmail.com",
                  name: "Admin User",
                  role: "ADMIN" as const,
                  createdAt: new Date().toISOString(),
                };
                localStorage.setItem("user", JSON.stringify(adminUser));
                window.location.reload();
              }}
              className="btn btn-secondary"
            >
              Login as Admin (Test)
            </button>
          </div>
        </div>

        {/* Properties Section for non-authenticated users */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setPropertiesExpanded(!propertiesExpanded)}
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
            >
              {propertiesExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  All Properties
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View all available properties
                </p>
              </div>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshProperties}
                disabled={propertiesLoading}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    propertiesLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>

          {propertiesExpanded && (
            <>
              {propertiesLoading ? (
                <LoadingSpinner />
              ) : properties?.data?.properties?.length > 0 ? (
                <div className="space-y-4">
                  {properties.data.properties.map((property: any) => (
                    <div
                      key={property.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {property.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {property.location} • {property.type} •{" "}
                            {property.action}
                          </p>
                          <p className="text-sm text-gray-600">
                            {property.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <span className="text-gray-500">
                              Area: {property.area} sq ft
                            </span>
                            <span className="text-gray-500">
                              BHK: {property.bhk || "N/A"}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {property.price
                                ? `₹${property.price.toLocaleString()}`
                                : property.action === "RENT"
                                ? `₹${
                                    property.perMonthCharges?.toLocaleString() ||
                                    0
                                  }/month`
                                : "Price on request"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No properties found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - RealtyTopper</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Here's what's happening with your properties and bookings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My Bookings */}
        <div className="card mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setBookingsExpanded(!bookingsExpanded)}
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
            >
              {bookingsExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  My Bookings
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bookings?.data?.length || 0} booking
                  {bookings?.data?.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </button>
          </div>

          {bookingsExpanded && (
            <>
              {bookings?.data &&
              Array.isArray(bookings.data) &&
              bookings.data.length > 0 ? (
                <div className="space-y-4">
                  {bookings.data.slice(0, 5).map((booking: any) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Property Image */}
                        <img
                          src={(() => {
                            const mediaUrlsArray = booking.property.mediaUrls
                              ? typeof booking.property.mediaUrls === "string"
                                ? JSON.parse(booking.property.mediaUrls)
                                : booking.property.mediaUrls
                              : [];
                            return getImageUrl(mediaUrlsArray?.[0] || "");
                          })()}
                          alt={booking.property.title}
                          className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-property.svg";
                          }}
                        />

                        {/* Booking Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {booking.property.title}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {booking.property.location}
                              </div>
                              <p className="text-sm text-gray-500">
                                ₹
                                {booking.property.price?.toLocaleString() ||
                                  "0"}
                              </p>
                            </div>

                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {booking.status}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  booking.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Booking Information */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Booking Period:
                              </span>
                              <p className="font-medium">
                                {new Date(booking.startDate).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}{" "}
                                -{" "}
                                {new Date(booking.endDate).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Booking Charges:
                              </span>
                              <p className="font-medium">
                                ₹{booking.bookingCharges || 300}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Payment Reference:
                              </span>
                              <p className="font-medium font-mono text-xs">
                                {booking.paymentRef || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.paymentProof && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            Payment Proof:
                          </p>
                          <a
                            href={getImageUrl(booking.paymentProof)}
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(
                                getImageUrl(booking.paymentProof),
                                "_blank"
                              );
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View Payment Proof
                          </a>
                        </div>
                      )}
                    </div>
                  ))}

                  {bookings.data.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Showing 5 of {bookings.data.length} bookings
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    You haven't made any bookings yet.
                  </p>
                  <Link to="/" className="btn btn-primary mt-4">
                    Browse Properties
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* My Properties */}
        <div className="card mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setPropertiesExpanded(!propertiesExpanded)}
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
            >
              {propertiesExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  My Properties
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {properties?.data?.properties?.length || 0} property
                  {properties?.data?.properties?.length !== 1
                    ? "ies"
                    : "y"}{" "}
                  found
                </p>
              </div>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleRefreshProperties}
                disabled={propertiesLoading}
                className="btn btn-secondary"
                title="Refresh Properties"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    propertiesLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>

          {propertiesExpanded && (
            <>
              {properties?.data?.properties &&
              Array.isArray(properties.data.properties) &&
              properties.data.properties.length > 0 ? (
                <div className="space-y-4">
                  {(properties?.data?.properties || []).map((property: any) => (
                    <div
                      key={property.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Property Image */}
                        <img
                          src={(() => {
                            const mediaUrlsArray = property.mediaUrls
                              ? typeof property.mediaUrls === "string"
                                ? JSON.parse(property.mediaUrls)
                                : property.mediaUrls
                              : [];
                            return getImageUrl(mediaUrlsArray?.[0] || "");
                          })()}
                          alt={property.title}
                          className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-property.svg";
                          }}
                        />

                        {/* Property Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                            <div className="flex-1 mb-3 sm:mb-0">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {property.title}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {property.location}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {property.description}
                              </p>
                            </div>

                            <div className="flex flex-col items-start sm:items-end space-y-2 sm:ml-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  property.status === "FREE"
                                    ? "bg-green-100 text-green-800"
                                    : property.status === "BOOKED"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {property.status}
                              </span>

                              {/* Property Actions */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditProperty(property)}
                                  className="p-2 sm:p-2 text-gray-400 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Edit Property"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProperty(property.id)
                                  }
                                  className="p-2 sm:p-2 text-gray-400 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  title="Delete Property"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Property Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <p className="font-semibold text-gray-900">
                                {property.price
                                  ? `₹${property.price.toLocaleString()}`
                                  : property.action === "RENT"
                                  ? `₹${
                                      property.perMonthCharges?.toLocaleString() ||
                                      0
                                    }/month`
                                  : "Not specified"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <p className="font-medium">{property.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Images:</span>
                              <p className="font-medium">
                                {(() => {
                                  const mediaUrlsArray = property.mediaUrls
                                    ? typeof property.mediaUrls === "string"
                                      ? JSON.parse(property.mediaUrls)
                                      : property.mediaUrls
                                    : [];
                                  return mediaUrlsArray.length;
                                })()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Added:</span>
                              <p className="font-medium">
                                {new Date(
                                  property.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Property Address */}
                          {property.address && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">
                                Address:
                              </p>
                              <p className="text-sm text-gray-700">
                                {property.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {properties?.data?.pagination &&
                    properties.data.pagination.pages > 1 && (
                      <div className="flex justify-center items-center space-x-2 pt-6 border-t border-gray-200">
                        <button
                          onClick={() =>
                            setPropertiesPage(Math.max(1, propertiesPage - 1))
                          }
                          disabled={propertiesPage === 1 || propertiesLoading}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        <div className="flex items-center space-x-1">
                          {Array.from(
                            {
                              length: Math.min(
                                5,
                                properties.data.pagination.pages
                              ),
                            },
                            (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPropertiesPage(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                    propertiesPage === pageNum
                                      ? "bg-blue-600 text-white"
                                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setPropertiesPage(
                              Math.min(
                                properties.data.pagination.pages,
                                propertiesPage + 1
                              )
                            )
                          }
                          disabled={
                            propertiesPage ===
                              properties.data.pagination.pages ||
                            propertiesLoading
                          }
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}

                  {/* Page Info */}
                  {properties?.data?.pagination && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Page {propertiesPage} of{" "}
                        {properties.data.pagination.pages} • Showing{" "}
                        {properties.data.properties.length} of{" "}
                        {properties.data.pagination.total} properties
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    You haven't listed any properties yet.
                  </p>
                  <Link to="/sell" className="btn btn-primary mt-4">
                    List Your First Property
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Become Dealer (Regular Users Only) */}
        {user?.role === "USER" && (
          <div className="card mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Become a Dealer
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Join our dealer network and start earning commissions on
                    every property sale. Build your own network and grow your
                    income!
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                      <span>Earn commissions on sales</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-blue-600" />
                      <span>Build your network</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/become-dealer"
                  className="btn btn-primary flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Commissions (Dealer Only) */}
        {user?.role === "DEALER" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Commissions
            </h3>

            {commissions?.data?.length > 0 ? (
              <div className="space-y-4">
                {(commissions?.data || [])
                  .slice(0, 5)
                  .map((commission: any) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {commission.property.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Level {commission.level} commission
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${commission.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No commissions earned yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start building your network to earn commissions!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Property Edit Modal */}
        {showEditModal && editingProperty && (
          <PropertyEditModal
            property={editingProperty}
            onClose={() => {
              setShowEditModal(false);
              setEditingProperty(null);
            }}
            onSave={handlePropertyUpdate}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;
