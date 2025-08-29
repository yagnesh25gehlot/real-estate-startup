import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Bell,
  Send,
  MessageSquare,
  TestTube,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const TestWhatsApp = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("TEST");
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/notifications/whatsapp-status"
      );
      const data = await response.json();
      setConfigStatus(data.data);
    } catch (error) {
      console.error("Error fetching config status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/notifications/test-whatsapp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            type,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("WhatsApp test notification sent!");
        console.log("WhatsApp test response:", data);
      } else {
        toast.error("Failed to send WhatsApp notification");
      }
    } catch (error) {
      console.error("Error sending WhatsApp test:", error);
      toast.error("Error sending WhatsApp notification");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/notifications/send-whatsapp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            type,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("WhatsApp message sent!");
        console.log("WhatsApp message response:", data);
      } else {
        toast.error("Failed to send WhatsApp message");
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      toast.error("Error sending WhatsApp message");
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: "TEST", label: "Test", emoji: "🧪" },
    { value: "PROPERTY_ADDED", label: "Property Added", emoji: "🏠" },
    { value: "PROPERTY_UPDATED", label: "Property Updated", emoji: "✏️" },
    { value: "USER_SIGNUP", label: "User Signup", emoji: "👤" },
    { value: "BOOKING_CREATED", label: "Booking Created", emoji: "📅" },
    { value: "DEALER_REQUEST", label: "Dealer Request", emoji: "🤝" },
    { value: "PAYMENT_RECEIVED", label: "Payment Received", emoji: "💰" },
  ];

  return (
    <>
      <Helmet>
        <title>Test WhatsApp Notifications - RealtyTopper</title>
        <meta
          name="description"
          content="Test WhatsApp notifications for RealtyTopper"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TestTube className="h-8 w-8 mr-3 text-blue-600" />
              WhatsApp Notification Testing
            </h1>
            <p className="text-gray-600 mt-2">
              Test WhatsApp notifications for your RealtyTopper group
            </p>
          </div>

          {/* Configuration Status */}
          <div
            className={`border rounded-lg p-6 mb-8 ${
              statusLoading
                ? "bg-gray-50 border-gray-200"
                : configStatus?.cloudAPI
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center mb-4">
              <Settings
                className={`h-6 w-6 mr-2 ${
                  statusLoading
                    ? "text-gray-600"
                    : configStatus?.cloudAPI
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              />
              <h2 className="text-lg font-semibold text-gray-900">
                WhatsApp Configuration Status
              </h2>
            </div>

            {statusLoading ? (
              <p className="text-gray-600">Loading configuration status...</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  {configStatus?.cloudAPI ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  )}
                  <span
                    className={
                      configStatus?.cloudAPI
                        ? "text-green-800"
                        : "text-yellow-800"
                    }
                  >
                    {configStatus?.cloudAPI
                      ? "✅ WhatsApp Cloud API is configured - Messages will be sent automatically"
                      : "⚠️ WhatsApp Cloud API is not configured - Messages will be generated as URLs for manual sending"}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Group ID:</strong> {configStatus?.groupId}
                  </p>
                  <p>
                    <strong>Phone Number ID:</strong>{" "}
                    {configStatus?.phoneNumberId || "Not configured"}
                  </p>
                  <p>
                    <strong>Access Token:</strong>{" "}
                    {configStatus?.hasAccessToken
                      ? "Configured"
                      : "Not configured"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Group Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-blue-900">
                WhatsApp Group
              </h2>
            </div>
            <p className="text-blue-800 mb-2">
              <strong>Group Link:</strong>{" "}
              <a
                href="https://chat.whatsapp.com/FDiiHAGGLW58LT5soL0CP5?mode=ems_copy_c"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                https://chat.whatsapp.com/FDiiHAGGLW58LT5soL0CP5
              </a>
            </p>
            <p className="text-blue-700 text-sm">
              All notifications from your admin panel will be automatically sent
              to this WhatsApp group.
            </p>
          </div>

          {/* Test Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-green-600" />
              Test Notifications
            </h2>

            <div className="space-y-6">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {notificationTypes.map((notificationType) => (
                    <option
                      key={notificationType.value}
                      value={notificationType.value}
                    >
                      {notificationType.emoji} {notificationType.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your test message here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleTestNotification}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Send Test Notification"}
                </button>

                <button
                  onClick={handleSendCustomMessage}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Send Custom Message"}
                </button>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              How it works
            </h3>
            <div className="space-y-3 text-yellow-800">
              {configStatus?.cloudAPI ? (
                <>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>✅ Messages
                    are sent automatically via WhatsApp Cloud API
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>✅ Real
                    notifications from your admin panel are sent instantly
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>✅ Each
                    notification includes emojis, timestamps, and links
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>
                    ⚠️ Messages are generated as URLs (check browser console)
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>
                    ⚠️ Copy the URL from console and open it in browser
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>
                    ⚠️ Click "Continue to Chat" to send the message
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">4.</span>
                    🔧 To enable automatic sending, configure WhatsApp Cloud API
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Setup Instructions */}
          {!configStatus?.cloudAPI && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                🔧 Setup WhatsApp Cloud API for Automatic Messages
              </h3>
              <div className="space-y-3 text-blue-800">
                <p className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  Go to{" "}
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Facebook Developers
                  </a>{" "}
                  and create a new app
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  Add WhatsApp product to your app
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  Get your Phone Number ID and Access Token
                </p>
                <p className="flex items-start">
                  <span className="font-semibold mr-2">4.</span>
                  Add these environment variables to your backend:
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
                  <br />
                  WHATSAPP_ACCESS_TOKEN="your-access-token"
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TestWhatsApp;
