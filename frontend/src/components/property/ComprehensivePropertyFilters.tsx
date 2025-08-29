import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RefreshCw,
  Star,
  Info,
} from "lucide-react";

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

interface ComprehensivePropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters: () => void;
  totalProperties: number;
  children?: React.ReactNode;
}

const ComprehensivePropertyFilters: React.FC<
  ComprehensivePropertyFiltersProps
> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalProperties,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("basic");

  // Property types
  const propertyTypes = [
    { value: "", label: "Any Type", icon: Home },
    { value: "FLAT", label: "Flat/Apartment", icon: Building2 },
    { value: "VILLA", label: "Villa", icon: Home },
    { value: "HOUSE", label: "House", icon: Home },
    { value: "PLOT", label: "Plot", icon: MapPin },
    { value: "SHOP", label: "Shop", icon: Building2 },
    { value: "COMMERCIAL", label: "Commercial", icon: Building2 },
  ];

  const actionTypes = [
    { value: "", label: "Any Action", icon: FileText },
    { value: "SELL", label: "Sell", icon: DollarSign },
    { value: "RENT", label: "Rent", icon: Calendar },
    { value: "LEASE", label: "Lease", icon: Calendar },
  ];

  const registeredAsOptions = [
    { value: "", label: "Any Registration", icon: FileText },
    { value: "OWNER", label: "Owner", icon: Home },
    { value: "DEALER", label: "Dealer", icon: Building2 },
    { value: "OTHER", label: "Other", icon: FileText },
  ];

  const furnishingOptions = [
    { value: "", label: "Any Furnishing", icon: Sofa },
    { value: "FURNISHED", label: "Furnished", icon: Sofa },
    { value: "SEMI_FURNISHED", label: "Semi-Furnished", icon: Sofa },
    { value: "UNFURNISHED", label: "Unfurnished", icon: Sofa },
  ];

  const tenantOptions = [
    { value: "", label: "Any Tenants", icon: Users },
    { value: "FAMILY", label: "Family", icon: Users },
    { value: "BACHELORS", label: "Bachelors", icon: Users },
    { value: "ANYONE", label: "Anyone", icon: Users },
  ];

  const bhkOptions = [1, 2, 3, 4, 5, 6];

  const amenitiesOptions = [
    "Parking",
    "Gym",
    "Swimming Pool",
    "Garden",
    "Security",
    "Lift",
    "Power Backup",
    "Water Supply",
    "Internet",
    "Air Conditioning",
    "Balcony",
    "Terrace",
    "Servant Quarter",
    "Pet Friendly",
    "Kids Play Area",
    "Club House",
    "Shopping Center",
    "Hospital",
    "School",
    "Metro Station",
  ];

  const sortOptions = [
    { value: "createdAt", label: "Latest First" },
    { value: "price", label: "Price" },
    { value: "area", label: "Area" },
    { value: "bhk", label: "BHK" },
  ];

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    onFiltersChange(newFilters);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = checked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter((a) => a !== amenity);

    handleFilterChange("amenities", newAmenities);
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "amenities") {
        if (value && Array.isArray(value) && value.length > 0) count++;
      } else if (
        value !== "" &&
        value !== undefined &&
        value !== null &&
        value !== false
      ) {
        count++;
      }
    });
    return count;
  };

  const renderSection = (
    sectionId: string,
    title: string,
    icon: any,
    content: React.ReactNode
  ) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <button
        onClick={() =>
          setActiveSection(activeSection === sectionId ? "" : sectionId)
        }
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
      >
        <div className="flex items-center gap-2">
          {React.createElement(icon, { size: 20, color: "currentColor" })}
          {title}
        </div>
        {activeSection === sectionId ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      {activeSection === sectionId && (
        <div className="space-y-4 pt-2">{content}</div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            <span className="text-gray-600">
              {totalProperties} properties found
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 ${
              isExpanded ? "block" : "hidden lg:block"
            }`}
          >
            <div className="space-y-4">
              {/* Basic Information */}
              {renderSection(
                "basic",
                "Basic Information",
                Info,
                <div className="space-y-4">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Type
                    </label>
                    <select
                      value={filters.action}
                      onChange={(e) =>
                        handleFilterChange("action", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {actionTypes.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      placeholder="Enter city or location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Registered As */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registered As
                    </label>
                    <select
                      value={filters.registeredAs}
                      onChange={(e) =>
                        handleFilterChange("registeredAs", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {registeredAsOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Pricing - Dynamic based on action */}
              {renderSection(
                "pricing",
                "Pricing & Financial",
                DollarSign,
                <div className="space-y-4">
                  {filters.action === "SELL" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Price (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.minPrice || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "minPrice",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="Min price"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Price (₹)
                        </label>
                        <input
                          type="number"
                          value={filters.maxPrice || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "maxPrice",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="Max price"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {(filters.action === "RENT" ||
                    filters.action === "LEASE") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {filters.action === "RENT"
                            ? "Min Monthly Rent (₹)"
                            : "Min Total Charges (₹)"}
                        </label>
                        <input
                          type="number"
                          value={filters.minPerMonthCharges || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "minPerMonthCharges",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder={`Min ${
                            filters.action === "RENT" ? "rent" : "charges"
                          }`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {filters.action === "RENT"
                            ? "Max Monthly Rent (₹)"
                            : "Max Total Charges (₹)"}
                        </label>
                        <input
                          type="number"
                          value={filters.maxPerMonthCharges || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "maxPerMonthCharges",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder={`Max ${
                            filters.action === "RENT" ? "rent" : "charges"
                          }`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {filters.action === "LEASE" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Lease Duration (months)
                        </label>
                        <input
                          type="number"
                          value={filters.minLeaseDuration || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "minLeaseDuration",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="Min duration"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Lease Duration (months)
                        </label>
                        <input
                          type="number"
                          value={filters.maxLeaseDuration || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "maxLeaseDuration",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="Max duration"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Booking Charges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Booking Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.minBookingCharges || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minBookingCharges",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Min booking charges"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Property Details */}
              {renderSection(
                "details",
                "Property Details",
                Home,
                <div className="space-y-4">
                  {/* Area Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Area (sq ft)
                    </label>
                    <input
                      type="number"
                      value={filters.minArea || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minArea",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Min area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Area (sq ft)
                    </label>
                    <input
                      type="number"
                      value={filters.maxArea || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxArea",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Max area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* BHK - Only for residential properties */}
                  {filters.type !== "PLOT" &&
                    filters.type !== "SHOP" &&
                    filters.type !== "COMMERCIAL" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  {/* Number of Rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Rooms
                    </label>
                    <input
                      type="number"
                      value={filters.minRooms || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minRooms",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Min rooms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Rooms
                    </label>
                    <input
                      type="number"
                      value={filters.maxRooms || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxRooms",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Max rooms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Furnishing Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Furnishing Status
                    </label>
                    <select
                      value={filters.furnishingStatus}
                      onChange={(e) =>
                        handleFilterChange("furnishingStatus", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {furnishingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parking Available */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="parkingAvailable"
                      checked={filters.parkingAvailable}
                      onChange={(e) =>
                        handleFilterChange("parkingAvailable", e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="parkingAvailable"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Parking Available
                    </label>
                  </div>

                  {/* Availability Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available By
                    </label>
                    <input
                      type="date"
                      value={filters.availabilityDate || ""}
                      onChange={(e) =>
                        handleFilterChange("availabilityDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Allowed Tenants - Only for rent/lease */}
                  {(filters.action === "RENT" ||
                    filters.action === "LEASE") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed Tenants
                      </label>
                      <select
                        value={filters.allowedTenants}
                        onChange={(e) =>
                          handleFilterChange("allowedTenants", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {tenantOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notice Period - Only for rent/lease */}
                  {(filters.action === "RENT" ||
                    filters.action === "LEASE") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notice Period (months)
                      </label>
                      <input
                        type="number"
                        value={filters.noticePeriod || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "noticePeriod",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        placeholder="Notice period"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Amenities */}
              {renderSection(
                "amenities",
                "Amenities",
                Star,
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesOptions.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={
                            filters.amenities?.includes(amenity) || false
                          }
                          onChange={(e) =>
                            handleAmenityChange(amenity, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort Options */}
              {renderSection(
                "sort",
                "Sort & Display",
                SlidersHorizontal,
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        handleFilterChange("sortOrder", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensivePropertyFilters;
