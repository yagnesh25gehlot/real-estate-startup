import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  MapPin,
  IndianRupee,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  CreditCard,
  Home,
  DollarSign,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { bookingsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    console.log("🔄 AdminBookings: Fetching data...");
    console.log(
      "🔑 Auth check - localStorage user:",
      localStorage.getItem("user") ? "Present" : "Missing"
    );
    console.log(
      "🔑 Auth check - localStorage user:",
      localStorage.getItem("user") ? "Present" : "Missing"
    );
    fetchBookings();
    fetchStats();
  }, [currentPage, filters]);

  // Calculate booking charges based on property action (same logic as PropertyDetail and BookingModal)
  const calculateBookingCharges = (property: any) => {
    if (property.action === "RENT") {
      // For rent: 1 month rent
      return property.perMonthCharges || 0;
    } else if (property.action === "LEASE") {
      // For lease: Total amount / Total duration (1 month equivalent)
      // If duration is 0, use total amount as booking charges
      if (!property.leaseDuration || property.leaseDuration === 0) {
        return property.perMonthCharges || 0;
      }
      return Math.round(
        (property.perMonthCharges || 0) / property.leaseDuration
      );
    } else {
      // For SELL: Use stored booking charges or 0
      return property.bookingCharges || 0;
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching bookings with params:", {
        page: currentPage,
        limit: 10,
        ...filters,
      });
      const response = await bookingsApi.getAllBookings({
        page: currentPage,
        limit: 10,
        ...filters,
      });
      console.log("📡 Bookings response:", response.data);
      setBookings(response.data.data.bookings || response.data.data);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error: any) {
      console.error("❌ Failed to fetch bookings:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await bookingsApi.getStats();
      setStats(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const updateExpiredBookings = async () => {
    try {
      await bookingsApi.updateExpired();
      toast.success("Expired bookings updated successfully");
      fetchBookings();
      fetchStats();
    } catch (error: any) {
      toast.error("Failed to update expired bookings");
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const confirmMessage = `Are you sure you want to approve this booking?

Property: ${booking.property?.title || "Unknown Property"}
User: ${booking.user?.name || "Unknown User"}
Booking Type: Permanent Booking

⚠️  WARNING: This will automatically cancel all other pending bookings for this property.
`;

    if (window.confirm(confirmMessage)) {
      try {
        await bookingsApi.approve(bookingId);
        toast.success("Booking approved successfully");
        fetchBookings();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to approve booking");
      }
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const confirmMessage = `Are you sure you want to reject this booking?

Property: ${booking.property?.title || "Unknown Property"}
User: ${booking.user?.name || "Unknown User"}

This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await bookingsApi.reject(bookingId);
        toast.success("Booking rejected successfully");
        fetchBookings();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to reject booking");
      }
    }
  };

  const handleUnbookProperty = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const confirmMessage = `Are you sure you want to unbook this property?

Property: ${booking.property?.title || "Unknown Property"}
User: ${booking.user?.name || "Unknown User"}

This will cancel the confirmed booking and make the property available again.`;

    if (window.confirm(confirmMessage)) {
      try {
        await bookingsApi.unbook(bookingId);
        toast.success("Property unbooked successfully");
        fetchBookings();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to unbook property");
      }
    }
  };

  const handleViewBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowViewModal(true);
    }
  };

  const getConflictingBookings = (booking: any) => {
    return bookings.filter(
      (b) =>
        b.id !== booking.id &&
        b.status === "PENDING" &&
        b.propertyId === booking.propertyId
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED":
        return <X className="h-4 w-4 text-red-500" />;
      case "EXPIRED":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading && bookings.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Bookings - RealtyTopper</title>
        <meta
          name="description"
          content="Manage property bookings and reservations"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bookings Management
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage and review all property bookings
                </p>
              </div>
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalBookings || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingBookings || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Confirmed
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.confirmedBookings || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{formatPrice(stats.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>

                <button
                  onClick={updateExpiredBookings}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Update Expired
                </button>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            {bookings.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600">
                  There are no bookings to display at the moment.
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Debug Info:</p>
                  <p>Loading: {loading.toString()}</p>
                  <p>Bookings Count: {bookings.length}</p>
                  <p>Stats: {stats ? "Available" : "Not loaded"}</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking (Created)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const calculatedBookingCharges = calculateBookingCharges(
                      booking.property
                    );
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{booking.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(booking.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.property.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {booking.property.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user.name || booking.user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">
                              Permanent Booking
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.property.action} • {booking.property.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(calculatedBookingCharges)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking charges
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(booking.status)}
                            <span
                              className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          {/* Show conflict warning for pending bookings */}
                          {booking.status === "PENDING" &&
                            getConflictingBookings(booking).length > 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {getConflictingBookings(booking).length}{" "}
                                  conflicting booking
                                  {getConflictingBookings(booking).length > 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                            )}
                          {/* Show property status */}
                          <div className="mt-1 text-xs text-gray-500">
                            Property: {booking.property?.status || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.dealerCode ? (
                            <div className="text-sm text-gray-900 font-mono">
                              {booking.dealerCode}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Direct booking
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-2">
                            {/* Status-specific actions */}
                            {booking.status === "PENDING" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleApproveBooking(booking.id)
                                  }
                                  className="text-green-600 hover:text-green-900 flex items-center px-2 py-1 rounded border border-green-200 hover:bg-green-50"
                                  title={
                                    getConflictingBookings(booking).length > 0
                                      ? `This will cancel ${
                                          getConflictingBookings(booking).length
                                        } other pending booking(s)`
                                      : "Approve this booking"
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectBooking(booking.id)
                                  }
                                  className="text-red-600 hover:text-red-900 flex items-center px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </button>
                              </div>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleUnbookProperty(booking.id)
                                  }
                                  className="text-orange-600 hover:text-orange-900 flex items-center px-2 py-1 rounded border border-orange-200 hover:bg-orange-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Unbook
                                </button>
                              </div>
                            )}
                            {booking.status === "CANCELLED" && (
                              <div className="text-xs text-gray-500">
                                No actions available
                              </div>
                            )}
                            {booking.status === "EXPIRED" && (
                              <div className="text-xs text-gray-500">
                                No actions available
                              </div>
                            )}

                            {/* View button for all statuses */}
                            <button
                              onClick={() => handleViewBooking(booking.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Booking Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking ID */}
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Booking ID
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedBooking.id}
                  </p>
                </div>
              </div>

              {/* User Information */}
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    User Information
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Name:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedBooking.user?.name || "N/A"}
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Email:</p>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.user?.email || "N/A"}
                      </p>
                    </div>
                    {selectedBooking.user?.mobile && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Mobile:</p>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.user.mobile}
                        </p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Contact for verification:
                      </p>
                      <p className="text-xs text-gray-600">
                        Email: {selectedBooking.user?.email || "N/A"} |
                        {selectedBooking.user?.mobile
                          ? ` Mobile: ${selectedBooking.user.mobile}`
                          : " Mobile: Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Property</p>
                  <p className="text-sm text-gray-900">
                    {selectedBooking.property?.title || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedBooking.property?.address || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Type: {selectedBooking.property?.type} • Action:{" "}
                    {selectedBooking.property?.action}
                  </p>
                </div>
              </div>

              {/* Booking Type */}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Booking Type
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    Permanent Booking
                  </p>
                  <p className="text-xs text-gray-500">
                    Booked on: {formatDateTime(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Payment Details
                  </p>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Booking Charges:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹
                        {formatPrice(
                          calculateBookingCharges(selectedBooking.property)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Total Amount:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹
                        {formatPrice(
                          calculateBookingCharges(selectedBooking.property)
                        )}
                      </span>
                    </div>
                    {selectedBooking.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Payment Method:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedBooking.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Reference */}
                  {selectedBooking.paymentRef && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Payment Reference:
                      </p>
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-sm font-mono text-blue-800 break-all">
                          {selectedBooking.paymentRef}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* UPI Details */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      UPI Payment Details:
                    </p>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <p className="text-xs text-gray-600">
                        UPI ID:{" "}
                        <span className="font-mono text-green-800">
                          8290936884@ybl
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Amount:{" "}
                        <span className="font-medium text-green-800">
                          ₹
                          {formatPrice(
                            calculateBookingCharges(selectedBooking.property)
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Verification Status */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedBooking.paymentProof
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {selectedBooking.paymentProof
                        ? "Payment proof uploaded"
                        : "Payment proof pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dealer Code */}
              {selectedBooking.dealerCode && (
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Dealer Code
                    </p>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedBooking.dealerCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {getStatusIcon(selectedBooking.status)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Payment Proof
                  </p>
                  {selectedBooking.paymentProof ? (
                    <div className="space-y-2">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-xs text-gray-600 mb-2">
                          Payment proof uploaded by user:
                        </p>
                        <a
                          href={getImageUrl(selectedBooking.paymentProof)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Payment Proof Image
                        </a>
                      </div>
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-xs text-gray-600">
                          <strong>Admin Verification Required:</strong> Please
                          verify the payment proof matches the UPI reference and
                          amount.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Payment proof not uploaded
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        User has not uploaded payment proof. Please contact user
                        or reject booking.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBookings;
