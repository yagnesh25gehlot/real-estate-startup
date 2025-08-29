import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  ArrowLeft,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  CheckCircle,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { propertiesApi, api } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import PropertyEditModal from "../components/PropertyEditModal";
import toast from "react-hot-toast";

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  address: string;
  price: number;
  status: string;
  mediaUrls: string[];
  listingFeeProof?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    status: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  const propertiesPerPage = 10;

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        page: currentPage,
        limit: propertiesPerPage,
      };

      const response = await propertiesApi.getAllForAdmin(params);
      console.log("Admin properties response:", response);

      if (response.data && response.data.data) {
        setProperties(response.data.data.properties || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
        setTotalProperties(response.data.data.pagination?.total || 0);
      } else {
        setProperties([]);
        setTotalPages(1);
        setTotalProperties(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch properties:", error);
      setError(error.response?.data?.error || "Failed to load properties");
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;

    try {
      await propertiesApi.delete(selectedProperty.id);
      toast.success("Property deleted successfully");
      setShowDeleteModal(false);
      setSelectedProperty(null);
      fetchProperties();
    } catch (error: any) {
      console.error("Failed to delete property:", error);
      toast.error(error.response?.data?.error || "Failed to delete property");
    }
  };

  const handleToggleStatus = async (property: Property) => {
    try {
      const newStatus = property.status === "FREE" ? "BOOKED" : "FREE";

      // Send status update as JSON instead of FormData
      await api.put(`/properties/${property.id}`, {
        status: newStatus,
      });

      toast.success(`Property status changed to ${newStatus}`);
      fetchProperties(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to toggle property status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update property status"
      );
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowEditModal(true);
  };

  const handlePropertyUpdate = async (updatedProperty: any) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedProperty.title);
      formData.append("description", updatedProperty.description);
      formData.append("type", updatedProperty.type);
      formData.append("location", updatedProperty.location);
      formData.append("address", updatedProperty.address);
      formData.append("price", updatedProperty.price.toString());

      // Add mediaUrls if it exists
      if (updatedProperty.mediaUrls) {
        formData.append("mediaUrls", updatedProperty.mediaUrls);
      }

      await propertiesApi.update(updatedProperty.id, formData);
      toast.success("Property updated successfully");
      setShowEditModal(false);
      setEditingProperty(null);
      fetchProperties();
    } catch (error: any) {
      console.error("Failed to update property:", error);
      toast.error(error.response?.data?.error || "Failed to update property");
    }
  };

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

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder-property.svg";
    if (url.startsWith("/uploads/")) {
      // Use the same logic as API configuration
      const isProduction = import.meta.env.PROD;
      const isLocal = import.meta.env.DEV;
      
      let baseUrl: string;
      
      if (isProduction) {
        baseUrl = 'https://realtytopper.com';
      } else if (isLocal) {
        baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      } else {
        baseUrl = import.meta.env.VITE_API_URL || 'https://realtytopper.com';
      }
      
      return `${baseUrl}${url}`;
    }
    return url;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Properties - RealtyTopper</title>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Properties
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage all properties in the system
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {totalProperties}
              </div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties by title, location, or owner..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.type}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, type: e.target.value })
                    }
                  >
                    <option value="">All Types</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="VILLA">Villa</option>
                    <option value="PLOT">Plot</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">All Status</option>
                    <option value="FREE">Free</option>
                    <option value="BOOKED">Booked</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties List */}
        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg mb-2">
              Failed to load properties
            </p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchProperties}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6">
              No properties match your current filters.
            </p>
            <button
              onClick={() =>
                handleFilterChange({
                  type: "",
                  location: "",
                  status: "",
                  search: "",
                })
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={(() => {
                                const mediaUrlsArray = property.mediaUrls
                                  ? typeof property.mediaUrls === "string"
                                    ? JSON.parse(property.mediaUrls)
                                    : property.mediaUrls
                                  : [];
                                return mediaUrlsArray?.[0]
                                  ? getImageUrl(mediaUrlsArray[0])
                                  : "/placeholder-property.svg";
                              })()}
                              alt={property.title}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/placeholder-property.svg";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {property.owner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.owner.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {property.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {formatPrice(property.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            property.status
                          )}`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(property.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.listingFeeProof ? (
                          <a
                            href={getImageUrl(property.listingFeeProof)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center"
                          >
                            <span className="mr-1">💰</span>
                            View Proof
                          </a>
                        ) : (
                          <span className="text-gray-400">No payment</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Property"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit Property"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(property)}
                            className={`p-1 rounded transition-colors ${
                              property.status === "FREE"
                                ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-900 hover:bg-green-50"
                            }`}
                            title={`Toggle to ${
                              property.status === "FREE" ? "BOOKED" : "FREE"
                            }`}
                          >
                            {property.status === "FREE" ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Property
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedProperty.title}"? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProperty(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProperty}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
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

export default AdminProperties;
