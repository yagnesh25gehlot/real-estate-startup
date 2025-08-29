import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../contexts/AuthContext";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  DollarSign,
  Eye,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { propertiesApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import PropertyEditModal from "../components/PropertyEditModal";
import toast from "react-hot-toast";

const MyProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    if (user?.id) {
      try {
        setLoading(true);
        const response = await propertiesApi.getAll({ ownerId: user.id });
        setProperties(response.data.data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        toast.error("Failed to load properties");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      try {
        await propertiesApi.delete(propertyId);
        toast.success("Property deleted successfully!");
        fetchProperties();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to delete property");
      }
    }
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
      toast.success("Property updated successfully!");
      setShowEditModal(false);
      setEditingProperty(null);
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update property");
    }
  };

  const filteredProperties =
    properties?.data?.properties?.filter((property: any) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>My Properties - Property Platform</title>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Properties
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all your listed properties
              </p>
            </div>
            <Link to="/sell" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Properties
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties?.data?.properties?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties?.data?.properties?.filter(
                    (p: any) => p.status === "FREE"
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties?.data?.properties?.filter(
                    (p: any) => p.status === "BOOKED"
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {(
                    properties?.data?.properties?.reduce(
                      (sum: number, p: any) => sum + (p.price || 0),
                      0
                    ) || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="FREE">Available</option>
                <option value="BOOKED">Booked</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: any) => (
              <div key={property.id} className="card relative group">
                {/* Property Actions Menu */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="relative">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                      <Link
                        to={`/property/${property.id}`}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Property Image */}
                <img
                  src={property.mediaUrls?.[0] || "/placeholder-property.jpg"}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                {/* Property Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-xl font-bold text-gray-900">
                        {property.price
                          ? `₹${property.price.toLocaleString()}`
                          : property.action === "RENT"
                          ? `₹${
                              property.perMonthCharges?.toLocaleString() || 0
                            }/month`
                          : "Not specified"}
                      </span>
                    </div>
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
                  </div>

                  {/* Property Details */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-1">{property.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Images:</span>
                        <span className="ml-1">
                          {property.mediaUrls?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Added:</span>
                        <span className="ml-1">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">ID:</span>
                        <span className="ml-1 font-mono text-xs">
                          {property.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    <Link
                      to={`/property/${property.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter
                  ? "No properties found"
                  : "No properties yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter
                  ? "Try adjusting your search or filter criteria."
                  : "Start by listing your first property to reach potential buyers."}
              </p>
              <Link to="/sell" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                List Your First Property
              </Link>
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

export default MyProperties;
