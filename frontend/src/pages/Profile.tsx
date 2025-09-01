import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Edit,
  X,
  Shield,
  Building2,
  Crown,
  ArrowLeft,
  Hash,
  Phone,
  CreditCard,
  Camera,
  Upload,
  Calendar,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../services/api";
import { getImageUrl } from "../utils/imageUtils";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    aadhaar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingAadhaarImage, setUploadingAadhaarImage] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        mobile: user.mobile || "",
        aadhaar: user.aadhaar || "",
      });
    }
  }, [user]);

  // Reset form data when entering edit mode
  const handleEditClick = () => {
    if (user) {
      const newFormData = {
        name: user.name || "",
        mobile: user.mobile || "",
        aadhaar: user.aadhaar || "",
      };
      setFormData(newFormData);
    }
    setIsEditing(true);
  };

  const validatePassword = (
    password: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate mobile number if provided
      if (formData.mobile && formData.mobile.trim()) {
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(formData.mobile.trim())) {
          toast.error("Please enter a valid 10-digit mobile number");
          setLoading(false);
          return;
        }
      }

      // Validate Aadhaar number if provided
      if (formData.aadhaar && formData.aadhaar.trim()) {
        const aadhaarRegex = /^[0-9]{12}$/;
        if (!aadhaarRegex.test(formData.aadhaar.trim())) {
          toast.error("Please enter a valid 12-digit Aadhaar number");
          setLoading(false);
          return;
        }
      }

      const response = await authApi.updateProfile(formData);
      updateUser(response.data.data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingProfilePic(true);

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await authApi.uploadProfilePic(formData);
      const profilePicUrl = response.data.data.profilePicUrl;
      updateUser({ ...user!, profilePic: profilePicUrl });
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Profile pic upload error:", error);
      toast.error(
        error.response?.data?.error || "Failed to upload profile picture"
      );
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleAadhaarImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingAadhaarImage(true);

    try {
      const formData = new FormData();
      formData.append("aadhaarImage", file);

      const response = await authApi.uploadAadhaarImage(formData);
      const aadhaarImageUrl = response.data.data.aadhaarImageUrl;
      updateUser({ ...user!, aadhaarImage: aadhaarImageUrl });
      toast.success("Aadhaar image updated successfully!");
    } catch (error: any) {
      console.error("Aadhaar image upload error:", error);
      toast.error(
        error.response?.data?.error || "Failed to upload aadhaar image"
      );
    } finally {
      setUploadingAadhaarImage(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    setPasswordLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case "ADMIN":
        return <Crown className="h-5 w-5 text-purple-600" />;
      case "DEALER":
        return <Building2 className="h-5 w-5 text-blue-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "ADMIN":
        return "Administrator";
      case "DEALER":
        return "Dealer";
      default:
        return "Regular User";
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "DEALER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Profile - RealtyTopper</title>
      </Helmet>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {user.profilePic ? (
                        <img
                          src={getImageUrl(user.profilePic)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      {!user.profilePic && (
                        <User className="h-10 w-10 text-gray-400" />
                      )}
                      {user.profilePic && (
                        <User className="h-10 w-10 text-gray-400 hidden" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                        disabled={uploadingProfilePic}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profile Picture</p>
                    <p className="text-xs text-gray-500">
                      {uploadingProfilePic
                        ? "Uploading..."
                        : "Click camera icon to upload"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {user.name || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Phone className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="font-medium text-gray-900">
                      {user.mobile || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Aadhaar Number</p>
                    <p className="font-medium text-gray-900">
                      {user.aadhaar
                        ? `${user.aadhaar.slice(0, 4)}-${user.aadhaar.slice(
                            4,
                            8
                          )}-${user.aadhaar.slice(8)}`
                        : "Not provided"}
                    </p>

                    {/* Aadhaar Image Section */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Aadhaar Card Image
                      </p>
                      {user.aadhaarImage ? (
                        <div className="space-y-2">
                          <div className="relative inline-block">
                            <img
                              src={getImageUrl(user.aadhaarImage)}
                              alt="Aadhaar Card"
                              className="h-24 w-32 object-cover rounded border shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                            <div className="hidden h-24 w-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500 text-center">
                                Image Error
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <label
                              htmlFor="aadhaar-image-upload-view"
                              className="cursor-pointer"
                            >
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                <Upload className="h-3 w-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">
                                  {uploadingAadhaarImage
                                    ? "Uploading..."
                                    : "Update Image"}
                                </span>
                              </div>
                            </label>
                            <button
                              onClick={() => {
                                const img = document.createElement("img");
                                img.src = getImageUrl(user.aadhaarImage || "");
                                img.style.maxWidth = "100%";
                                img.style.maxHeight = "80vh";
                                img.style.objectFit = "contain";

                                const modal = document.createElement("div");
                                modal.style.position = "fixed";
                                modal.style.top = "0";
                                modal.style.left = "0";
                                modal.style.width = "100%";
                                modal.style.height = "100%";
                                modal.style.backgroundColor =
                                  "rgba(0, 0, 0, 0.8)";
                                modal.style.display = "flex";
                                modal.style.alignItems = "center";
                                modal.style.justifyContent = "center";
                                modal.style.zIndex = "9999";
                                modal.style.cursor = "pointer";

                                modal.appendChild(img);
                                document.body.appendChild(modal);

                                modal.onclick = () => {
                                  document.body.removeChild(modal);
                                };
                              }}
                              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="h-3 w-3 text-gray-600" />
                              <span className="text-xs font-medium text-gray-700">
                                View Full
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-24 w-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center">
                              No Aadhaar Image
                            </span>
                          </div>
                          <label
                            htmlFor="aadhaar-image-upload-view"
                            className="cursor-pointer"
                          >
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                              <Upload className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-blue-700">
                                {uploadingAadhaarImage
                                  ? "Uploading..."
                                  : "📤 Upload Aadhaar Image"}
                              </span>
                            </div>
                          </label>
                        </div>
                      )}
                      <input
                        id="aadhaar-image-upload-view"
                        type="file"
                        accept="image/*"
                        onChange={handleAadhaarImageUpload}
                        className="hidden"
                        disabled={uploadingAadhaarImage}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF, SVG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Type</p>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon()}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor()}`}
                      >
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Date not available"}
                    </p>
                  </div>
                </div>

                {(user.role === "DEALER" || user.role === "ADMIN") && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Hash className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dealer Code</p>
                        <p className="font-medium text-gray-900 font-mono">
                          {user.dealer?.referralCode ||
                            user.id ||
                            "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {user.dealer && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Dealer Status
                            </p>
                            <p className="font-medium text-gray-900">
                              {user.dealer.status || "ACTIVE"}
                            </p>
                          </div>
                        </div>

                        {user.dealer.commission &&
                          user.dealer.commission > 0 && (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Total Commission
                                </p>
                                <p className="font-medium text-gray-900">
                                  ₹{user.dealer.commission}
                                </p>
                              </div>
                            </div>
                          )}
                      </>
                    )}

                    {user.role === "ADMIN" && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Crown className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Admin Dealer Code
                          </p>
                          <p className="font-medium text-gray-900 font-mono">
                            {user.id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="input pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={user.email}
                      className="input pl-10 bg-gray-50 cursor-not-allowed"
                      placeholder="Email address"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="mobile" className="label">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="mobile"
                      name="mobile"
                      type="text"
                      value={formData.mobile || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({ ...prev, mobile: value }));
                      }}
                      className="input pl-10"
                      placeholder="Enter your 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 10-digit mobile number (e.g., 9876543210)
                  </p>
                </div>

                <div>
                  <label htmlFor="aadhaar" className="label">
                    Aadhaar Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="aadhaar"
                      name="aadhaar"
                      type="text"
                      value={formData.aadhaar || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({ ...prev, aadhaar: value }));
                      }}
                      className="input pl-10"
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength={12}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 12-digit Aadhaar number (e.g., 123456789012)
                  </p>
                </div>

                {/* Aadhaar Image Upload in Edit Mode */}
                <div>
                  <label className="label">Aadhaar Card Image</label>
                  <div className="space-y-3">
                    {user.aadhaarImage && (
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(user.aadhaarImage)}
                          alt="Current Aadhaar"
                          className="h-16 w-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                        <div className="hidden h-16 w-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500 text-center">
                            Image Error
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Current Aadhaar Image</p>
                          <p className="text-xs text-gray-500">
                            Click upload to replace
                          </p>
                        </div>
                      </div>
                    )}

                    <label
                      htmlFor="aadhaar-image-upload-edit"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                        <Upload className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {uploadingAadhaarImage
                            ? "Uploading..."
                            : "📤 Upload/Update Aadhaar Image"}
                        </span>
                      </div>
                    </label>
                    <input
                      id="aadhaar-image-upload-edit"
                      type="file"
                      accept="image/*"
                      onChange={handleAadhaarImageUpload}
                      className="hidden"
                      disabled={uploadingAadhaarImage}
                    />
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF, SVG (Max 5MB)
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn btn-primary disabled:opacity-50"
                  >
                    {loading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Security Settings
              </h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              )}
            </div>

            {!isChangingPassword ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Lock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Password</p>
                    <p className="font-medium text-gray-900">••••••••</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Security Tips
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Use a strong password with at least 8 characters</li>
                    <li>
                      • Include uppercase, lowercase, numbers, and special
                      characters
                    </li>
                    <li>• Never share your password with anyone</li>
                    <li>• Change your password regularly</li>
                  </ul>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="label">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="input pl-10 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="label">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="input pl-10 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        Password strength:
                      </div>
                      <div className="flex space-x-1">
                        {[
                          passwordData.newPassword.length >= 8,
                          /(?=.*[a-z])/.test(passwordData.newPassword),
                          /(?=.*[A-Z])/.test(passwordData.newPassword),
                          /(?=.*\d)/.test(passwordData.newPassword),
                          /(?=.*[@$!%*?&])/.test(passwordData.newPassword),
                        ].map((criterion, index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded ${
                              criterion ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="input pl-10 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 btn btn-primary disabled:opacity-50"
                  >
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
