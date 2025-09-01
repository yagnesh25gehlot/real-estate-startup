import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  showError,
  showSuccess,
  showWarning,
} from "../utils/errorNotifications";
import { X, Upload } from "lucide-react";
import { api, propertiesApi } from "../services/api";
import ListingFeeModal from "./ListingFeeModal";

interface FormData {
  title: string;
  type: string;
  action: string;
  // New address fields
  city: string;
  state: string;
  pincode: string;
  locality: string;
  street: string;
  landmark: string;
  subRegion: string;
  // Property type specific fields
  flatNumber: string;
  buildingName: string;
  shopNumber: string;
  complexName: string;
  plotNumber: string;
  // Legacy fields
  location: string;
  address: string;
  latitude?: string;
  longitude?: string;
  price?: number;
  area: string;
  bhk: string;
  numberOfRooms: string;
  description: string;
  perMonthCharges?: number;
  leaseDuration?: number;
  furnishingStatus: string;
  parkingAvailable: boolean;
  amenities: string[];
  additionalAmenities?: string;
  allowedTenants: string;
  noticePeriod: string;
  availabilityDate: string;
  specifications: string;
  dimensions: string;
  registeredAs: string;
  registeredAsDescription?: string;
  mobileNumber: string;
}

interface PropertyFormProps {
  mode: "create" | "edit";
  property?: any;
  onClose?: () => void;
  onSave?: (updatedProperty: any) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  mode,
  property,
  onClose,
  onSave,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<{
    electricityBill: File | null;
    waterBill: File | null;
    registry: File[];
    otherDocuments: File[];
  }>({
    electricityBill: null,
    waterBill: null,
    registry: [],
    otherDocuments: [],
  });

  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [removingImages, setRemovingImages] = useState<string[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<{
    electricityBillImage?: string;
    waterBillImage?: string;
    registryImage?: string[];
    otherDocuments?: string[];
  }>({});

  const [showListingFeeModal, setShowListingFeeModal] = useState(false);
  const [pendingPropertyData, setPendingPropertyData] =
    useState<globalThis.FormData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    action: "RENT",
    // New address fields
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
    // Legacy fields
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    price: undefined,
    area: "",
    bhk: "",
    numberOfRooms: "",
    description: "",
    perMonthCharges: undefined,
    leaseDuration: undefined,
    furnishingStatus: "UNFURNISHED",
    parkingAvailable: false,
    amenities: [],
    additionalAmenities: "",
    allowedTenants: "FAMILY",
    noticePeriod: "1",
    availabilityDate: "",
    specifications: "",
    dimensions: "",
    registeredAs: "OWNER",
    registeredAsDescription: "",
    mobileNumber: "",
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Helper function to get correct URL for images and documents
  const getFileUrl = (filePath: string) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;

    // Use the same logic as API configuration
    const isProduction = import.meta.env.PROD;
    const isLocal = import.meta.env.DEV;

    let backendUrl: string;

    if (isProduction) {
      backendUrl = "https://realtytopper.com";
    } else if (isLocal) {
      backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    } else {
      backendUrl = import.meta.env.VITE_API_URL || "https://realtytopper.com";
    }

    if (filePath.startsWith("/")) return `${backendUrl}${filePath}`;
    return `${backendUrl}/${filePath}`;
  };

  // Helper function to show field error
  const showFieldError = (fieldName: string) => {
    return fieldErrors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{fieldErrors[fieldName]}</p>
    ) : null;
  };

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && property && property.id) {
      setFormData({
        title: property.title || "",
        type: property.type || "",
        action: property.action || "RENT",
        // New address fields
        city: property.city || "",
        state: property.state || "",
        pincode: property.pincode || "",
        locality: property.locality || "",
        street: property.street || "",
        landmark: property.landmark || "",
        subRegion: property.subRegion || "",
        // Property type specific fields
        flatNumber: property.flatNumber || "",
        buildingName: property.buildingName || "",
        shopNumber: property.shopNumber || "",
        complexName: property.complexName || "",
        plotNumber: property.plotNumber || "",
        // Legacy fields
        location: property.location || "",
        address: property.address || "",
        latitude: property.latitude || "",
        longitude: property.longitude || "",
        price: property.price || undefined,
        area: property.area?.toString() || "",
        bhk: property.bhk?.toString() || "",
        numberOfRooms: property.numberOfRooms?.toString() || "",
        description: property.description || "",
        perMonthCharges: property.perMonthCharges || undefined,
        leaseDuration: property.leaseDuration || undefined,
        furnishingStatus: property.furnishingStatus || "UNFURNISHED",
        parkingAvailable: property.parkingAvailable || false,
        amenities: Array.isArray(property.amenities)
          ? property.amenities
          : typeof property.amenities === "string"
          ? property.amenities.split(",").map((a: string) => a.trim())
          : [],
        additionalAmenities: property.additionalAmenities || "",
        allowedTenants: property.allowedTenants || "FAMILY",
        noticePeriod: property.noticePeriod?.toString() || "1",
        availabilityDate: property.availabilityDate
          ? new Date(property.availabilityDate).toISOString().split("T")[0]
          : "",
        specifications: property.specifications || "",
        dimensions: property.dimensions || "",
        registeredAs: property.registeredAs || "OWNER",
        registeredAsDescription: property.registeredAsDescription || "",
        mobileNumber: property.mobileNumber || "",
      });

      // Set current images if they exist
      if (property.mediaUrls) {
        const images =
          typeof property.mediaUrls === "string"
            ? JSON.parse(property.mediaUrls)
            : property.mediaUrls;
        setCurrentImages(images || []);
      }

      // Set existing documents if they exist
      console.log("🔍 Loading property documents:", {
        registryImage: property.registryImage,
        otherDocuments: property.otherDocuments,
        registryImageType: typeof property.registryImage,
        otherDocumentsType: typeof property.otherDocuments,
      });

      const parsedRegistryImage = property.registryImage
        ? typeof property.registryImage === "string"
          ? JSON.parse(property.registryImage)
          : property.registryImage
        : [];

      const parsedOtherDocuments = property.otherDocuments
        ? typeof property.otherDocuments === "string"
          ? JSON.parse(property.otherDocuments)
          : property.otherDocuments
        : [];

      console.log("🔍 Parsed documents:", {
        parsedRegistryImage,
        parsedOtherDocuments,
      });

      const existingDocs = {
        electricityBillImage: property.electricityBillImage,
        waterBillImage: property.waterBillImage,
        registryImage: parsedRegistryImage,
        otherDocuments: parsedOtherDocuments,
      };

      console.log("🔍 Setting existing documents:", existingDocs);
      setExistingDocuments(existingDocs);
    }
  }, [mode, property]);

  // Form validation function
  const validateForm = () => {
    const errors: { field: string; message: string }[] = [];

    // Helper function to check if a value is empty
    const isEmpty = (value: any): boolean => {
      if (value === null || value === undefined || value === "") return true;
      if (typeof value === "string" && value.trim() === "") return true;
      if (typeof value === "number" && isNaN(value)) return true;
      return false;
    };

    // Helper function to check if a number is valid
    const isValidNumber = (value: any): boolean => {
      if (isEmpty(value)) return false;
      if (typeof value === "number" && value <= 0) return false;
      if (
        typeof value === "string" &&
        (parseFloat(value) <= 0 || isNaN(parseFloat(value)))
      )
        return false;
      return true;
    };

    console.log("🔍 Validating form data:", formData);

    // Basic validation
    if (isEmpty(formData.title)) {
      errors.push({ field: "title", message: "Property title is required" });
    }
    if (isEmpty(formData.type)) {
      errors.push({ field: "type", message: "Property type is required" });
    }
    if (isEmpty(formData.action)) {
      errors.push({ field: "action", message: "Action is required" });
    }
    if (isEmpty(formData.city)) {
      errors.push({ field: "city", message: "City is required" });
    }
    if (isEmpty(formData.state)) {
      errors.push({ field: "state", message: "State is required" });
    }
    if (isEmpty(formData.locality)) {
      errors.push({
        field: "locality",
        message: "Locality/Area/Layout is required",
      });
    }
    if (isEmpty(formData.area)) {
      errors.push({ field: "area", message: "Area is required" });
    }
    if (isEmpty(formData.description)) {
      errors.push({ field: "description", message: "Description is required" });
    }
    if (isEmpty(formData.registeredAs)) {
      errors.push({
        field: "registeredAs",
        message: "Registered As is required",
      });
    }
    if (isEmpty(formData.mobileNumber)) {
      errors.push({
        field: "mobileNumber",
        message: "Mobile number is required",
      });
    }

    // Conditional validation based on property type
    if (
      formData.type !== "PLOT" &&
      formData.type !== "SHOP" &&
      isEmpty(formData.bhk)
    ) {
      errors.push({
        field: "bhk",
        message: "BHK is required for this property type",
      });
    }

    // Conditional validation based on action
    if (formData.action === "SELL" && !isValidNumber(formData.price)) {
      errors.push({
        field: "price",
        message: "Price is required and must be greater than 0 for selling",
      });
    }
    if (
      formData.action === "RENT" &&
      !isValidNumber(formData.perMonthCharges)
    ) {
      errors.push({
        field: "perMonthCharges",
        message:
          "Per month rent is required and must be greater than 0 for renting",
      });
    }
    if (
      formData.action === "LEASE" &&
      !isValidNumber(formData.perMonthCharges)
    ) {
      errors.push({
        field: "perMonthCharges",
        message:
          "Total charges are required and must be greater than 0 for leasing",
      });
    }
    if (formData.action === "LEASE" && !isValidNumber(formData.leaseDuration)) {
      errors.push({
        field: "leaseDuration",
        message: "Duration is required and must be greater than 0 for leasing",
      });
    }

    // File validation
    if (mode === "create") {
      if (uploadedFiles.length === 0) {
        errors.push({
          field: "images",
          message: "At least one property image is required",
        });
      }
      if (documentFiles.registry.length === 0) {
        errors.push({
          field: "registry",
          message: "At least one registry document is required",
        });
      }
    }

    // Registered As description validation
    if (
      formData.registeredAs === "OTHER" &&
      isEmpty(formData.registeredAsDescription)
    ) {
      errors.push({
        field: "registeredAsDescription",
        message: "Description is required when registered as 'Other'",
      });
    }

    console.log("🔍 Validation errors found:", errors);
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 Form submission started");
    e.preventDefault();

    console.log("📝 Form data:", formData);
    console.log("📁 Uploaded files:", uploadedFiles);
    console.log("📄 Document files:", documentFiles);

    const errors = validateForm();
    console.log("❌ Validation errors:", errors);

    if (errors.length > 0) {
      // Convert errors to field-specific format
      const errorMap: { [key: string]: string } = {};
      errors.forEach((error) => {
        errorMap[error.field] = error.message;
      });

      setFieldErrors(errorMap);

      // Show comprehensive error message
      if (errors.length === 1) {
        showError(new Error(errors[0].message), "property");
      } else {
        const errorMessages = errors
          .map((error) => `• ${error.message}`)
          .join("\n");
        showError(
          new Error(`Please fix the following errors:\n${errorMessages}`),
          "property"
        );
      }

      // Scroll to first error field
      const firstErrorField =
        document.querySelector(`[name="${errors[0].field}"]`) ||
        document.querySelector(`[data-field="${errors[0].field}"]`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstErrorField as HTMLElement).focus();
      }

      return;
    }

    // Clear any existing errors
    setFieldErrors({});

    console.log("✅ Validation passed, starting submission...");
    setIsSubmitting(true);
    try {
      const formDataToSubmit = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            formDataToSubmit.append(key, value.join(","));
          } else {
            formDataToSubmit.append(key, value.toString());
          }
        }
      });

      // Append files
      uploadedFiles.forEach((file) => {
        formDataToSubmit.append("mediaFiles", file);
      });

      // Handle existing and new documents for edit mode
      if (mode === "edit") {
        // Add existing images that haven't been removed as JSON string
        if (currentImages.length > 0) {
          formDataToSubmit.append(
            "existingImageUrls",
            JSON.stringify(currentImages)
          );
        }

        // Add existing documents that haven't been removed
        if (existingDocuments.electricityBillImage) {
          formDataToSubmit.append(
            "existingElectricityBillImage",
            existingDocuments.electricityBillImage
          );
        }
        if (existingDocuments.waterBillImage) {
          formDataToSubmit.append(
            "existingWaterBillImage",
            existingDocuments.waterBillImage
          );
        }

        // Always add existing registry documents (even if empty array)
        const existingRegistryUrls = JSON.stringify(
          existingDocuments.registryImage || []
        );
        const existingOtherDocuments = JSON.stringify(
          existingDocuments.otherDocuments || []
        );

        console.log("🔍 Frontend - sending existing documents:", {
          existingRegistryUrls,
          existingOtherDocuments,
          existingRegistryImage: existingDocuments.registryImage,
          existingOtherDocumentsArray: existingDocuments.otherDocuments,
        });

        formDataToSubmit.append("existingRegistryUrls", existingRegistryUrls);
        formDataToSubmit.append(
          "existingOtherDocuments",
          existingOtherDocuments
        );
      }

      // Add new documents
      if (documentFiles.electricityBill) {
        formDataToSubmit.append(
          "electricityBillImage",
          documentFiles.electricityBill
        );
      }
      if (documentFiles.waterBill) {
        formDataToSubmit.append("waterBillImage", documentFiles.waterBill);
      }
      documentFiles.registry.forEach((file) => {
        formDataToSubmit.append("registryImage", file);
      });
      documentFiles.otherDocuments.forEach((file) => {
        formDataToSubmit.append("otherDocuments", file);
      });

      let response;
      if (mode === "create") {
        // Store the form data and show listing fee modal
        setPendingPropertyData(formDataToSubmit);
        setShowListingFeeModal(true);
        return; // Don't proceed with property creation yet
      } else {
        console.log("📤 Updating property...");
        response = await propertiesApi.update(property.id, formDataToSubmit);
        console.log("✅ Property updated successfully:", response);
        showSuccess("Property updated successfully!", "Success");
        if (onSave) onSave(response.data);
        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} property:`,
        error
      );
      showError(error, "property");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment completion for listing fee
  const handlePaymentComplete = async (paymentProof: File) => {
    if (!pendingPropertyData) return;

    try {
      // Add payment proof to the form data
      pendingPropertyData.append("listingFeeProof", paymentProof);

      console.log("📤 Creating property with payment proof...");
      const response = await propertiesApi.create(pendingPropertyData);
      console.log("✅ Property created successfully:", response);

      showSuccess("Property published successfully!", "Success");
      setShowListingFeeModal(false);
      setPendingPropertyData(null);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating property with payment:", error);
      showError(error, "property");
    }
  };

  // Get current location function
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showError(new Error("Geolocation is not supported by this browser"), "location");
      return;
    }

    setIsGettingLocation(true);
    toast.loading("Getting your location...");

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
      }
    );
  }, []);

  // Options
  const amenitiesOptions = [
    "Parking",
    "Garden",
    "Balcony",
    "Terrace",
    "Gym",
    "Swimming Pool",
    "Security",
    "Lift",
    "Power Backup",
    "Water Supply",
    "Internet",
    "Air Conditioning",
    "Heating",
    "Furnished",
    "Pet Friendly",
  ];

  const propertyTypes = [
    "APARTMENT",
    "HOUSE",
    "VILLA",
    "PLOT",
    "COMMERCIAL",
    "SHOP",
  ];
  const actionTypes = ["SELL", "RENT", "LEASE"];
  const furnishingOptions = [
    "UNFURNISHED",
    "SEMI_FURNISHED",
    "FULLY_FURNISHED",
  ];
  const tenantOptions = ["FAMILY", "BACHELORS", "ANYONE"];
  const bhkOptions = ["1", "2", "3", "4", "5", "6+"];
  const registeredAsOptions = ["OWNER", "DEALER", "OTHER"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? "List Your Property" : "Edit Property"}
          </h1>
          <p className="mt-2 text-gray-600">
            {mode === "create"
              ? "Fill in the details below to list your property for sale or rent"
              : "Update your property details below"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter property title"
                />
                {showFieldError("title")}
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {showFieldError("type")}
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action <span className="text-red-500">*</span>
                </label>
                <select
                  name="action"
                  value={formData.action}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, action: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.action ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {actionTypes.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
                {showFieldError("action")}
              </div>

              {/* Registered As */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered As <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.registeredAs}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registeredAs: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {registeredAsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.mobileNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter mobile number"
                />
                {showFieldError("mobileNumber")}
              </div>

              {/* Basic Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Bangalore, Mumbai, Delhi"
                  />
                  {showFieldError("city")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.state ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Karnataka, Maharashtra, Delhi"
                  />
                  {showFieldError("state")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pincode: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 560001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locality / Area / Layout{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        locality: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.locality
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., BTM Layout, Koramangala, Whitefield"
                  />
                  {showFieldError("locality")}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street / Road{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chocolate Factory Road, MG Road"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        landmark: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Near Forum Mall, Opposite Metro Station"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-region / Zone{" "}
                    <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="subRegion"
                    value={formData.subRegion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subRegion: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., South Bengaluru, North Mumbai"
                  />
                </div>
              </div>

              {/* Property Type Specific Fields */}
              {(formData.type === "APARTMENT" ||
                formData.type === "HOUSE" ||
                formData.type === "VILLA") && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Property Type Specific Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flat / Door Number{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="flatNumber"
                        value={formData.flatNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            flatNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., A-101, Flat 5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building / Apartment Name{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            buildingName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Sunshine Apartments, Green Valley"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.type === "COMMERCIAL" || formData.type === "SHOP") && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Property Type Specific Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop / Unit Number{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="shopNumber"
                        value={formData.shopNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shopNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Shop 15, Unit A-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complex / Market Name{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="complexName"
                        value={formData.complexName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            complexName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Phoenix MarketCity, Forum Mall"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === "PLOT" && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Property Type Specific Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plot / Survey Number{" "}
                      <span className="text-gray-500 text-sm">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="plotNumber"
                      value={formData.plotNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          plotNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Survey No. 123, Plot 45"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Location Detection Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
                Get Current Location
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Click to automatically detect your current location and fill in
                coordinates (hidden from UI)
              </p>
              {formData.latitude && formData.longitude && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700">
                    <strong>Coordinates detected:</strong> {formData.latitude},{" "}
                    {formData.longitude}
                  </p>
                </div>
              )}
            </div>

            {/* Registered As Description */}
            {formData.registeredAs === "OTHER" && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.registeredAsDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registeredAsDescription: e.target.value,
                    }))
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.registeredAsDescription
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Please describe your relationship to the property..."
                />
                {showFieldError("registeredAsDescription")}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.action === "SELL" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter property price"
                  />
                  {showFieldError("price")}
                </div>
              ) : formData.action === "LEASE" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Charges (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.perMonthCharges || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          perMonthCharges: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.perMonthCharges
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter total lease amount"
                    />
                    {showFieldError("perMonthCharges")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.leaseDuration || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          leaseDuration: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.leaseDuration
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter lease duration in months"
                    />
                    {showFieldError("leaseDuration")}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Month Rent (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="perMonthCharges"
                      value={formData.perMonthCharges || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          perMonthCharges: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fieldErrors.perMonthCharges
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter monthly rent amount"
                    />
                    {showFieldError("perMonthCharges")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period (months)
                    </label>
                    <input
                      type="number"
                      value={formData.noticePeriod}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          noticePeriod: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter notice period"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Tenants
                    </label>
                    <select
                      value={formData.allowedTenants}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowedTenants: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tenantOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, area: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.area ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter area in square feet"
                />
                {showFieldError("area")}
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dimensions: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 40x60 ft"
                />
              </div>

              {/* BHK - Only show for non-PLOT and non-SHOP properties */}
              {formData.type !== "PLOT" && formData.type !== "SHOP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BHK <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bhk}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bhk: e.target.value }))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.bhk ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select BHK</option>
                    {bhkOptions.map((bhk) => (
                      <option key={bhk} value={bhk}>
                        {bhk}
                      </option>
                    ))}
                  </select>
                  {showFieldError("bhk")}
                </div>
              )}

              {/* Number of Rooms - Only show for non-PLOT and non-SHOP properties */}
              {formData.type !== "PLOT" && formData.type !== "SHOP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfRooms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        numberOfRooms: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter number of rooms"
                  />
                </div>
              )}

              {/* Furnishing Status - Only show for non-PLOT and non-SHOP properties */}
              {formData.type !== "PLOT" && formData.type !== "SHOP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing Status
                  </label>
                  <select
                    value={formData.furnishingStatus}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        furnishingStatus: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {furnishingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Availability Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Date
                </label>
                <input
                  type="date"
                  value={formData.availabilityDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availabilityDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your property in detail..."
              />
              {showFieldError("description")}
            </div>

            {/* Specifications */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <textarea
                value={formData.specifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specifications: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter property specifications..."
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Amenities
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          amenities: [...prev.amenities, amenity],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          amenities: prev.amenities.filter(
                            (a) => a !== amenity
                          ),
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>

            {/* Additional Amenities */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Amenities
              </label>
              <textarea
                value={formData.additionalAmenities}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalAmenities: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional amenities not listed above..."
              />
            </div>
          </div>

          {/* Property Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Property Images
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  data-field="images"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedFiles((prev) => [...prev, ...files]);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.images ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload multiple images of your property (JPG, PNG, GIF)
                </p>
                {showFieldError("images")}
              </div>

              {/* Display existing images (edit mode) */}
              {mode === "edit" && currentImages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Existing Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={getFileUrl(imageUrl)}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-property.svg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRemovingImages((prev) => [...prev, imageUrl]);
                            setCurrentImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ownership Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ownership Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Registry Documents - Always Required */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registry Documents <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  data-field="registry"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setDocumentFiles((prev) => ({
                      ...prev,
                      registry: [...prev.registry, ...files],
                    }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.registry ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload registry documents (PDF, DOC, DOCX, or images)
                </p>
                {showFieldError("registry")}

                {/* Display existing registry documents (edit mode) */}
                {mode === "edit" &&
                  existingDocuments.registryImage &&
                  existingDocuments.registryImage.length > 0 && (
                    <div className="mt-2 mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Existing Registry Documents
                      </h3>
                      <div className="space-y-2">
                        {existingDocuments.registryImage.map(
                          (docUrl, index) => (
                            <div
                              key={`existing-registry-${index}`}
                              className="flex items-center justify-between bg-blue-50 p-2 rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-blue-700">
                                  Registry Document {index + 1}
                                </span>
                                <a
                                  href={getFileUrl(docUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  View
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setExistingDocuments((prev) => ({
                                    ...prev,
                                    registryImage:
                                      prev.registryImage?.filter(
                                        (_, i) => i !== index
                                      ) || [],
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Display registry files */}
                {documentFiles.registry.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {documentFiles.registry.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-green-50 p-2 rounded"
                      >
                        <span className="text-sm text-green-700">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDocumentFiles((prev) => ({
                              ...prev,
                              registry: prev.registry.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Electricity Bill - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Electricity Bill
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocumentFiles((prev) => ({
                        ...prev,
                        electricityBill: file,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload electricity bill (optional)
                </p>

                {/* Display existing electricity bill (edit mode) */}
                {mode === "edit" && existingDocuments.electricityBillImage && (
                  <div className="mt-2 mb-2 flex items-center justify-between bg-blue-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-700">
                        Existing Electricity Bill
                      </span>
                      <a
                        href={getFileUrl(
                          existingDocuments.electricityBillImage
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        View
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExistingDocuments((prev) => ({
                          ...prev,
                          electricityBillImage: undefined,
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {documentFiles.electricityBill && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm text-green-700">
                      {documentFiles.electricityBill.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentFiles((prev) => ({
                          ...prev,
                          electricityBill: null,
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Water Bill - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Bill
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocumentFiles((prev) => ({
                        ...prev,
                        waterBill: file,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload water bill (optional)
                </p>

                {/* Display existing water bill (edit mode) */}
                {mode === "edit" && existingDocuments.waterBillImage && (
                  <div className="mt-2 mb-2 flex items-center justify-between bg-blue-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-700">
                        Existing Water Bill
                      </span>
                      <a
                        href={getFileUrl(existingDocuments.waterBillImage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        View
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExistingDocuments((prev) => ({
                          ...prev,
                          waterBillImage: undefined,
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {documentFiles.waterBill && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm text-green-700">
                      {documentFiles.waterBill.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentFiles((prev) => ({
                          ...prev,
                          waterBill: null,
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Other Documents */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Documents
                </label>
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setDocumentFiles((prev) => ({
                      ...prev,
                      otherDocuments: [...prev.otherDocuments, ...files],
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload any other relevant documents (plot maps, floor plans,
                  etc.)
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Suggestions:</strong> Plot maps, floor plans, site
                  plans, building permits, completion certificates, NOC
                  documents, property tax receipts, maintenance bills, etc.
                </p>

                {/* Display existing other documents (edit mode) */}
                {mode === "edit" &&
                  existingDocuments.otherDocuments &&
                  existingDocuments.otherDocuments.length > 0 && (
                    <div className="mt-2 mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Existing Other Documents
                      </h3>
                      <div className="space-y-2">
                        {existingDocuments.otherDocuments.map(
                          (docUrl, index) => (
                            <div
                              key={`existing-other-${index}`}
                              className="flex items-center justify-between bg-purple-50 p-2 rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-purple-700">
                                  Other Document {index + 1}
                                </span>
                                <a
                                  href={getFileUrl(docUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800 text-xs underline"
                                >
                                  View
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setExistingDocuments((prev) => ({
                                    ...prev,
                                    otherDocuments:
                                      prev.otherDocuments?.filter(
                                        (_, i) => i !== index
                                      ) || [],
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Display other documents */}
                {documentFiles.otherDocuments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {documentFiles.otherDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-blue-50 p-2 rounded"
                      >
                        <span className="text-sm text-blue-700">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDocumentFiles((prev) => ({
                              ...prev,
                              otherDocuments: prev.otherDocuments.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === "create" ? "Creating..." : "Updating..."}
                </div>
              ) : mode === "create" ? (
                "List Property"
              ) : (
                "Update Property"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Listing Fee Modal */}
      <ListingFeeModal
        isOpen={showListingFeeModal}
        onClose={() => {
          setShowListingFeeModal(false);
          setPendingPropertyData(null);
        }}
        onPaymentComplete={handlePaymentComplete}
        propertyTitle={formData.title || "Your Property"}
      />
    </div>
  );
};

export default PropertyForm;
