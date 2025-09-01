import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Activity,
  TreePine,
  Bell,
  MessageCircle,
} from "lucide-react";
import { adminApi, commissionApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import NotificationBell from "../components/NotificationBell";
import toast from "react-hot-toast";

const Admin = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard data
        const response = await adminApi.getDashboard();
        console.log("Dashboard response:", response);

        // Check if response has data property
        if (response.data && response.data.data) {
          setDashboardData(response.data.data);
        } else if (response.data) {
          setDashboardData(response.data);
        } else {
          setDashboardData(response);
        }
      } catch (error: any) {
        console.error("Failed to fetch admin data:", error);
        setError(error.response?.data?.error || "Failed to load admin data");
        toast.error("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const stats = dashboardData || {};

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - RealtyTopper</title>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your RealtyTopper platform and monitor performance
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Properties
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProperties || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
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
              <div className="p-3 rounded-lg bg-yellow-100">
                <IndianRupee className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/admin/properties")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <span>Manage Properties</span>
            </button>

            <button
              onClick={() => navigate("/admin/bookings")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span>View All Bookings</span>
            </button>

            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <span>Manage Users</span>
            </button>

            <button
              onClick={() => navigate("/admin/dealer-requests")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-5 w-5 text-orange-600 mr-2" />
              <span>Dealer Requests</span>
            </button>

            <button
              onClick={() => navigate("/admin/dealer-tree")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TreePine className="h-5 w-5 text-green-600 mr-2" />
              <span>Dealer Tree</span>
            </button>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bell className="h-5 w-5 text-red-600 mr-2" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => navigate("/admin/inquiries")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span>User Inquiries</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        {stats.recentTransactions && stats.recentTransactions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Transactions
            </h3>

            <div className="space-y-4">
              {stats.recentTransactions
                .slice(0, 5)
                .map((transaction: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-100 mr-4">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Payment: ₹{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.booking?.property?.title || "Property"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            System Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-800">Database</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-800">API Server</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
