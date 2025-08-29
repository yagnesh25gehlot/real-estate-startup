import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../services/api";

interface TelegramStatus {
  telegramConnected: boolean;
  message: string;
}

const TestTelegram: React.FC = () => {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("Hello from RealtyTopper! 🏠");
  const [testResult, setTestResult] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications/telegram-status");
      setStatus(response.data);
    } catch (error) {
      console.error("Failed to check Telegram status:", error);
      setStatus({
        telegramConnected: false,
        message: "Failed to check Telegram status",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    try {
      const response = await api.post("/notifications/test-telegram", {
        message: testMessage,
        type: "TEST",
      });
      setTestResult(response.data);
    } catch (error) {
      console.error("Failed to send test message:", error);
      setTestResult({
        success: false,
        error: "Failed to send test message",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Test Telegram Notifications - RealtyTopper</title>
        <meta
          name="description"
          content="Test Telegram notification integration"
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🤖 Telegram Notification Test
          </h1>

          {/* Status Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Connection Status
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>Checking status...</span>
                </div>
              ) : status ? (
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      status.telegramConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <p
                      className={`font-medium ${
                        status.telegramConnected
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {status.telegramConnected
                        ? "✅ Connected"
                        : "❌ Not Connected"}
                    </p>
                    <p className="text-gray-600 text-sm">{status.message}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Status not available</p>
              )}
            </div>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh Status
            </button>
          </div>

          {/* Test Message Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Send Test Message
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your test message..."
                />
              </div>
              <button
                onClick={sendTestMessage}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Test Message"}
              </button>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Test Result
              </h2>
              <div
                className={`rounded-lg p-4 ${
                  testResult.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      testResult.success ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span
                    className={`font-medium ${
                      testResult.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {testResult.success ? "Success" : "Failed"}
                  </span>
                </div>
                <p className="text-gray-700">{testResult.message}</p>
                {testResult.notification && (
                  <div className="mt-3 p-3 bg-gray-100 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Sent:</strong> {testResult.notification.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📋 Configuration Information
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>
                <strong>Bot Token:</strong>{" "}
                8110714233:AAFH_kwId5WNcPvBcaUpBDxC1SmXlckkquU
              </p>
              <p>
                <strong>Group ID:</strong> -1003068406152
              </p>
              <p>
                <strong>Group Name:</strong> RealtyTopper Alerts
              </p>
              <p>
                <strong>Bot Username:</strong> @realtytopper_notifications_bot
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📱 How to Receive Notifications
            </h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <p>
                1. <strong>Join the Telegram group:</strong> "RealtyTopper
                Alerts"
              </p>
              <p>
                2. <strong>Enable notifications:</strong> Make sure push
                notifications are enabled for the group
              </p>
              <p>
                3. <strong>Test the integration:</strong> Use the test message
                above to verify everything works
              </p>
              <p>
                4. <strong>Monitor activity:</strong> You'll receive
                notifications for:
              </p>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• New property listings</li>
                <li>• Booking confirmations</li>
                <li>• User registrations</li>
                <li>• Payment confirmations</li>
                <li>• System alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTelegram;
