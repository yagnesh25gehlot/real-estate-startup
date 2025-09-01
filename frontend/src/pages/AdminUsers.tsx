import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  Shield,
  Phone,
  CreditCard,
  Hash,
  Lock,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  X,
  ZoomIn,
  Plus,
  Edit,
  Trash2,
  Save,
  Camera,
  Upload,
} from "lucide-react";
import { adminApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageUtils";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [blockingUser, setBlockingUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(
    null
  );
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState<string | null>(
    null
  );
  const [uploadingAadhaarImage, setUploadingAadhaarImage] = useState<
    string | null
  >(null);
  const navigate = useNavigate();

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    aadhaar: "",
    role: "USER" as "USER" | "DEALER" | "ADMIN",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [createForm, setCreateForm] = useState({
    email: "",
    name: "",
    password: "",
    mobile: "",
    aadhaar: "",
    role: "USER" as "USER" | "DEALER" | "ADMIN",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getAllUsers();
      setUsers(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      setError(error.response?.data?.error || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await adminApi.createUser(createForm);
      toast.success("User created successfully");
      setShowCreateModal(false);
      setCreateForm({
        email: "",
        name: "",
        password: "",
        mobile: "",
        aadhaar: "",
        role: "USER",
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      await adminApi.updateUser(userId, editForm);
      toast.success("User updated successfully");
      setEditingUser(null);
      setEditForm({
        name: "",
        mobile: "",
        aadhaar: "",
        role: "USER",
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user");
    }
  };

  const handleUpdatePassword = async (userId: string) => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await adminApi.updateUserPassword(userId, passwordForm.password);
      toast.success("Password updated successfully");
      setShowPasswordModal(null);
      setPasswordForm({
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update password");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingUser(userId);
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleProfilePicUpload = async (
    userId: string,
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

    setUploadingProfilePic(userId);

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      await adminApi.uploadUserProfilePic(userId, formData);
      toast.success("Profile picture updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to upload profile picture"
      );
    } finally {
      setUploadingProfilePic(null);
    }
  };

  const handleAadhaarImageUpload = async (
    userId: string,
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

    setUploadingAadhaarImage(userId);

    try {
      const formData = new FormData();
      formData.append("aadhaarImage", file);

      await adminApi.uploadUserAadhaarImage(userId, formData);
      toast.success("Aadhaar image updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to upload aadhaar image"
      );
    } finally {
      setUploadingAadhaarImage(null);
    }
  };

  const startEditing = (user: any) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      mobile: user.mobile || "",
      aadhaar: user.aadhaar || "",
      role: user.role || "USER",
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({
      name: "",
      mobile: "",
      aadhaar: "",
      role: "USER",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "DEALER":
        return "bg-blue-100 text-blue-800";
      case "USER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleBlockUser = async (userId: string) => {
    try {
      setBlockingUser(userId);
      await adminApi.blockUser(userId);
      toast.success("User blocked successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to block user");
    } finally {
      setBlockingUser(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      setBlockingUser(userId);
      await adminApi.unblockUser(userId);
      toast.success("User unblocked successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to unblock user");
    } finally {
      setBlockingUser(null);
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Helmet>
        <title>Admin Users - RealtyTopper</title>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor all platform users
          </p>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          {users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Users Found
              </h3>
              <p className="text-gray-600">
                There are no users to display at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aadhaar Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aadhaar Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
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
                                <Users className="h-5 w-5 text-gray-600" />
                              )}
                              {user.profilePic && (
                                <Users className="h-5 w-5 text-gray-600 hidden" />
                              )}
                            </div>
                            {editingUser === user.id && (
                              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                <Camera className="h-3 w-3" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleProfilePicUpload(user.id, e)
                                  }
                                  className="hidden"
                                  disabled={uploadingProfilePic === user.id}
                                />
                              </label>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {editingUser === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      name: e.target.value,
                                    })
                                  }
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                />
                              ) : (
                                user.name || "Unknown User"
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {editingUser === user.id ? (
                              <input
                                type="tel"
                                value={editForm.mobile}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    mobile: e.target.value,
                                  })
                                }
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                placeholder="Mobile number"
                              />
                            ) : (
                              <div className="text-sm text-gray-600">
                                {user.mobile || "Not provided"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.password ? (
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900 font-mono">
                              {passwordVisibility[user.id]
                                ? user.password
                                : "••••••••"}
                            </div>
                            <button
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title={
                                passwordVisibility[user.id]
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {passwordVisibility[user.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <div className="text-xs text-gray-500 ml-2">
                              (Hashed)
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No password
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <input
                            type="text"
                            value={editForm.aadhaar}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                aadhaar: e.target.value,
                              })
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                            placeholder="12-digit Aadhaar"
                            maxLength={12}
                          />
                        ) : user.aadhaar ? (
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900 font-mono">
                              {user.aadhaar}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Not provided
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.aadhaarImage ? (
                            <>
                              <img
                                src={getImageUrl(user.aadhaarImage)}
                                alt="Aadhaar"
                                className="h-8 w-12 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() =>
                                  openImageModal(getImageUrl(user.aadhaarImage))
                                }
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <button
                                onClick={() =>
                                  openImageModal(getImageUrl(user.aadhaarImage))
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="View full size"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No image
                            </span>
                          )}
                          {editingUser === user.id && (
                            <label className="cursor-pointer">
                              <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                                <Upload className="h-4 w-4" />
                                <span>
                                  {uploadingAadhaarImage === user.id
                                    ? "Uploading..."
                                    : "Upload"}
                                </span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleAadhaarImageUpload(user.id, e)
                                }
                                className="hidden"
                                disabled={uploadingAadhaarImage === user.id}
                              />
                            </label>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                role: e.target.value as
                                  | "USER"
                                  | "DEALER"
                                  | "ADMIN",
                              })
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="USER">USER</option>
                            <option value="DEALER">DEALER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              user.role
                            )}`}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.dealer || user.role === "ADMIN" ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Hash className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900 font-medium">
                                {user.dealer?.referralCode || user.id || "N/A"}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {user.dealer?.status || "ACTIVE"}
                            </div>
                            {user.dealer?.commission > 0 && (
                              <div className="text-xs text-green-600">
                                Commission: ₹{user.dealer.commission}
                              </div>
                            )}
                            {user.role === "ADMIN" && (
                              <div className="text-xs text-purple-600">
                                Admin Dealer Code
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Not a dealer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "BLOCKED"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.status === "BLOCKED" ? "Blocked" : "Active"}
                          </span>
                          {user.role !== "ADMIN" && (
                            <div className="flex space-x-1">
                              {user.status === "BLOCKED" ? (
                                <button
                                  onClick={() => handleUnblockUser(user.id)}
                                  disabled={blockingUser === user.id}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Unblock user"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockUser(user.id)}
                                  disabled={blockingUser === user.id}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Block user"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {editingUser === user.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateUser(user.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Save changes"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-800 p-1"
                                title="Cancel editing"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(user)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowPasswordModal(user.id)}
                                className="text-purple-600 hover:text-purple-800 p-1"
                                title="Change password"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                              {user.role !== "ADMIN" && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={deletingUser === user.id}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for OAuth users"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={createForm.mobile}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, mobile: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={createForm.aadhaar}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, aadhaar: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: e.target.value as "USER" | "DEALER" | "ADMIN",
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">USER</option>
                  <option value="DEALER">DEALER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change User Password</h3>
              <button
                onClick={() => setShowPasswordModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleUpdatePassword(showPasswordModal)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowPasswordModal(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Aadhaar Card Image</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Aadhaar Card"
                className="max-w-full max-h-[70vh] object-contain rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <div className="hidden text-center text-gray-500">
                <p>Failed to load image</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
