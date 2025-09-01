import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  MapPin,
  Upload,
  X,
  Camera,
  Building2,
  DollarSign,
  FileText,
  Home,
  Navigation,
} from "lucide-react";
import { propertiesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const SellProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    // Basic address fields
    city: "",
    state: "",
    pincode: "",
    locality: "",
    street: "",
    landmark: "",
    subRegion: "",
    // Property type specific fields
    flatNumber: "",
    buildingName: "",
    shopNumber: "",
    complexName: "",
    plotNumber: "",
    // Legacy fields (hidden from UI)
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    price: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    toast.loading("Getting your location...", { id: "location" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const address = data.display_name || "";
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "";

          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: address,
            location: city || prev.location,
          }));

          toast.success("Location detected successfully!", { id: "location" });
        } catch (error) {
          console.error("Error getting address:", error);
          // Still save the coordinates even if address lookup fails
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
          toast.success("Coordinates saved! Please enter address manually.", {
            id: "location",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Could not get your current location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "Could not get location automatically.";
        }

        toast.error(errorMessage, { id: "location" });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }, []);

  // Handle file uploads
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const totalFiles = uploadedFiles.length + acceptedFiles.length;
      if (totalFiles > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        return true;
      });

      setUploadedFiles((prev) => [...prev, ...validFiles]);
    },
    [uploadedFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to list a property");
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Property title is required");
      return;
    }
    if (!formData.type) {
      toast.error("Property type is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Property description is required");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.state.trim()) {
      toast.error("State is required");
      return;
    }
    if (!formData.locality.trim()) {
      toast.error("Locality/Area/Layout is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("type", formData.type);
      // Basic address fields
      formDataToSend.append("city", formData.city.trim());
      formDataToSend.append("state", formData.state.trim());
      if (formData.pincode && formData.pincode.trim()) {
        formDataToSend.append("pincode", formData.pincode.trim());
      }
      formDataToSend.append("locality", formData.locality.trim());
      if (formData.street && formData.street.trim()) {
        formDataToSend.append("street", formData.street.trim());
      }
      if (formData.landmark && formData.landmark.trim()) {
        formDataToSend.append("landmark", formData.landmark.trim());
      }
      if (formData.subRegion && formData.subRegion.trim()) {
        formDataToSend.append("subRegion", formData.subRegion.trim());
      }

      // Property type specific fields
      if (formData.flatNumber && formData.flatNumber.trim()) {
        formDataToSend.append("flatNumber", formData.flatNumber.trim());
      }
      if (formData.buildingName && formData.buildingName.trim()) {
        formDataToSend.append("buildingName", formData.buildingName.trim());
      }
      if (formData.shopNumber && formData.shopNumber.trim()) {
        formDataToSend.append("shopNumber", formData.shopNumber.trim());
      }
      if (formData.complexName && formData.complexName.trim()) {
        formDataToSend.append("complexName", formData.complexName.trim());
      }
      if (formData.plotNumber && formData.plotNumber.trim()) {
        formDataToSend.append("plotNumber", formData.plotNumber.trim());
      }

      // Legacy fields (hidden from UI but still sent)
      formDataToSend.append("location", formData.location.trim());
      formDataToSend.append("address", formData.address.trim() || "");
      if (formData.latitude && formData.latitude.trim()) {
        formDataToSend.append("latitude", formData.latitude.trim());
      }
      if (formData.longitude && formData.longitude.trim()) {
        formDataToSend.append("longitude", formData.longitude.trim());
      }
      formDataToSend.append("price", formData.price);

      // Append files (optional)
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append("mediaFiles", file);
      });

      await propertiesApi.create(formDataToSend);

      toast.success("Property listed successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(error.response?.data?.error || "Failed to list property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Helmet>
        <title>List Your Property - Property Platform</title>
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            List Your Property
          </h1>
          <p className="text-gray-600 mt-2">
            Reach thousands of potential buyers and renters
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Beautiful 3-bedroom house in downtown"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a descriptive title for your property
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="PLOT">Plot</option>
                  <option value="VILLA">Villa</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the type that best describes your property
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the price in Indian Rupees (₹)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Location{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the city or general location of your property (optional)
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your property in detail..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a detailed description of your property features and
                amenities
              </p>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Details
            </h2>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please provide the detailed address
                of your property. This helps buyers find your property easily.
              </p>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Current Location
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Click to automatically detect your current location and fill in
                coordinates (hidden from UI)
              </p>
            </div>

            {/* Basic Address Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bangalore, Mumbai, Delhi"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the city where your property is located
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Karnataka, Maharashtra, Delhi"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the state where your property is located
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 560001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the postal code (optional but useful for search
                    filters)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locality / Area / Layout{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locality"
                    required
                    value={formData.locality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BTM Layout, Koramangala, Whitefield"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the locality, area, or layout name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street / Road{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Chocolate Factory Road, MG Road"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the street or road name (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Near Forum Mall, Opposite Metro Station"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a nearby landmark (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-region / Zone{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="subRegion"
                    value={formData.subRegion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., South Bengaluru, North Mumbai"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the sub-region or zone (optional)
                  </p>
                </div>
              </div>

              {/* Property Type Specific Fields */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Property Type Specific Information
                </h3>

                {(formData.type === "APARTMENT" ||
                  formData.type === "HOUSE" ||
                  formData.type === "VILLA") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Flat / Door Number{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="flatNumber"
                        value={formData.flatNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., A-101, Flat 5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the flat or door number (optional)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building / Apartment Name{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Sunshine Apartments, Green Valley"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the building or apartment name (optional)
                      </p>
                    </div>
                  </div>
                )}

                {(formData.type === "COMMERCIAL" ||
                  formData.type === "SHOP") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shop / Unit Number{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="shopNumber"
                        value={formData.shopNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Shop 15, Unit A-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the shop or unit number (optional)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complex / Market Name{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="complexName"
                        value={formData.complexName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Phoenix MarketCity, Forum Mall"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the complex or market name (optional)
                      </p>
                    </div>
                  </div>
                )}

                {formData.type === "PLOT" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot / Survey Number{" "}
                      <span className="text-gray-500 text-sm">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="plotNumber"
                      value={formData.plotNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Survey No. 123, Plot 45"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the plot or survey number (optional)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Property Images{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Optional but Recommended)
              </span>
            </h2>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> The first image you upload will be used as
                the profile picture in property listings. Upload high-quality
                images to attract more buyers.
              </p>
            </div>

            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the images here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop images here, or click to select files
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum 5 images, 10MB each. First image will be the
                      profile picture. Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Images ({uploadedFiles.length}/5)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Listing Property...
                </>
              ) : (
                <>
                  <Home className="h-4 w-4 mr-2" />
                  List Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SellProperty;
