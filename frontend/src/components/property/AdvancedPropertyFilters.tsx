import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Home,
  Building2,
  Car,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Ruler,
  Bed,
  Sofa,
  ParkingCircle,
  FileText,
} from "lucide-react";

interface PropertyFilters {
  type: string;
  action: string;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  minPerMonthCharges?: number;
  maxPerMonthCharges?: number;
  minArea?: number;
  maxArea?: number;
  bhk?: number;
  furnishingStatus: string;
  parkingAvailable: boolean;
  allowedTenants: string;
  availabilityDate?: string;
  status: string;
}

interface AdvancedPropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters: () => void;
  totalProperties: number;
  children?: React.ReactNode;
}

const AdvancedPropertyFilters: React.FC<AdvancedPropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalProperties,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("basic");

  // Property types that support different features
  const propertyTypes = [
    { value: "", label: "Any Type", icon: Home },
    { value: "FLAT", label: "Flat/Apartment", icon: Building2 },
    { value: "VILLA", label: "Villa", icon: Home },
    { value: "HOUSE", label: "House", icon: Home },
    { value: "PLOT", label: "Plot", icon: MapPin },
    { value: "SHOP", label: "Shop", icon: Building2 },
    { value: "SHOWROOM", label: "Showroom", icon: Building2 },
  ];

  const actionTypes = [
    { value: "", label: "Any Action", icon: FileText },
    { value: "BUY", label: "Buy", icon: DollarSign },
    { value: "RENT", label: "Rent", icon: Calendar },
    { value: "LEASE", label: "Lease", icon: Calendar },
  ];

  const furnishingOptions = [
    { value: "", label: "Any Furnishing", icon: Sofa },
    { value: "Furnished", label: "Furnished", icon: Sofa },
    { value: "Semi-Furnished", label: "Semi-Furnished", icon: Sofa },
    { value: "Unfurnished", label: "Unfurnished", icon: Sofa },
  ];

  const tenantOptions = [
    { value: "", label: "Any Tenants", icon: Users },
    { value: "Family", label: "Family", icon: Users },
    { value: "Bachelors", label: "Bachelors", icon: Users },
    { value: "Both", label: "Both", icon: Users },
  ];

  const bhkOptions = [1, 2, 3, 4, 5, 6];

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== undefined && value !== false
    ).length;
  };

  const renderFilterSection = (
    title: string,
    icon: React.ComponentType,
    children: React.ReactNode
  ) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          {React.createElement(icon, { size: 20, color: "#2563eb" })}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Property Search
              </h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {totalProperties} properties found
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {isExpanded ? "Hide Filters" : "Show Filters"}
              </button>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All ({getActiveFiltersCount()})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 ${
              isExpanded ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Advanced Filters
                </h2>

                {/* Section Navigation */}
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    { id: "basic", label: "Basic Filters", icon: Home },
                    { id: "price", label: "Price & Rent", icon: DollarSign },
                    {
                      id: "details",
                      label: "Property Details",
                      icon: Building2,
                    },
                    { id: "additional", label: "Additional", icon: Filter },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {React.createElement(section.icon, {
                        size: 16,
                        color: "currentColor",
                      })}
                      <span className="text-sm font-medium">
                        {section.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Sections */}
              <div className="space-y-6">
                {/* Basic Filters */}
                {activeSection === "basic" && (
                  <>
                    {/* Property Type */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Property Type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) =>
                          handleFilterChange("type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {propertyTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Type */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Action
                      </label>
                      <select
                        value={filters.action}
                        onChange={(e) =>
                          handleFilterChange("action", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {actionTypes.map((action) => (
                          <option key={action.value} value={action.value}>
                            {action.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city or locality"
                        value={filters.location}
                        onChange={(e) =>
                          handleFilterChange("location", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Price & Rent Filters */}
                {activeSection === "price" && (
                  <>
                    {/* Price Range (for Buy) */}
                    {filters.action === "BUY" && (
                      <>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-700">
                            Price Range (₹)
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Min Price"
                              value={filters.minPrice || ""}
                              onChange={(e) =>
                                handleFilterChange(
                                  "minPrice",
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              placeholder="Max Price"
                              value={filters.maxPrice || ""}
                              onChange={(e) =>
                                handleFilterChange(
                                  "maxPrice",
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Per Month Charges (for Rent/Lease) */}
                    {(filters.action === "RENT" ||
                      filters.action === "LEASE") && (
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">
                          {filters.action === "RENT"
                            ? "Monthly Rent"
                            : "Monthly Charges"}{" "}
                          (₹)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPerMonthCharges || ""}
                            onChange={(e) =>
                              handleFilterChange(
                                "minPerMonthCharges",
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPerMonthCharges || ""}
                            onChange={(e) =>
                              handleFilterChange(
                                "maxPerMonthCharges",
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Area Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Area Range (sq ft)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Min Area"
                          value={filters.minArea || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "minArea",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Area"
                          value={filters.maxArea || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "maxArea",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Property Details */}
                {activeSection === "details" && (
                  <>
                    {/* BHK (only for residential properties) */}
                    {["FLAT", "VILLA", "HOUSE"].includes(filters.type) && (
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">
                          BHK
                        </label>
                        <select
                          value={filters.bhk || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "bhk",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Any BHK</option>
                          {bhkOptions.map((bhk) => (
                            <option key={bhk} value={bhk}>
                              {bhk} BHK
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Furnishing Status */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Furnishing Status
                      </label>
                      <select
                        value={filters.furnishingStatus}
                        onChange={(e) =>
                          handleFilterChange("furnishingStatus", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {furnishingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Parking */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Parking
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.parkingAvailable}
                            onChange={(e) =>
                              handleFilterChange(
                                "parkingAvailable",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Available
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Additional Filters */}
                {activeSection === "additional" && (
                  <>
                    {/* Allowed Tenants (for Rent/Lease) */}
                    {(filters.action === "RENT" ||
                      filters.action === "LEASE") && (
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">
                          Allowed Tenants
                        </label>
                        <select
                          value={filters.allowedTenants}
                          onChange={(e) =>
                            handleFilterChange("allowedTenants", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {tenantOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Availability Date */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Available From
                      </label>
                      <input
                        type="date"
                        value={filters.availabilityDate || ""}
                        onChange={(e) =>
                          handleFilterChange("availabilityDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Property Status */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Any Status</option>
                        <option value="FREE">Available</option>
                        <option value="BOOKED">Booked</option>
                        <option value="SOLD">Sold</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {children || (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {totalProperties} Properties Found
                  </h3>
                  <p className="text-gray-600">
                    Use the filters on the left to narrow down your search
                    results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPropertyFilters;
