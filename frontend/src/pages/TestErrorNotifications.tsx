import React from "react";
import {
  showError,
  showSuccess,
  showWarning,
} from "../utils/errorNotifications";

const TestErrorNotifications: React.FC = () => {
  const testNetworkError = () => {
    const error = new Error("Network Error");
    (error as any).code = "NETWORK_ERROR";
    showError(error, "network");
  };

  const testPropertyError = () => {
    const error = new Error("Property not found");
    (error as any).response = {
      status: 404,
      data: { error: "Property not found" },
    };
    showError(error, "property");
  };

  const testBookingError = () => {
    const error = new Error("Property already booked");
    (error as any).response = {
      status: 400,
      data: { error: "Property already booked" },
    };
    showError(error, "booking");
  };

  const testUploadError = () => {
    const error = new Error("File too large");
    (error as any).response = {
      status: 400,
      data: { error: "File size exceeds 5MB limit" },
    };
    showError(error, "upload");
  };

  const testValidationError = () => {
    const error = new Error("Validation failed");
    (error as any).response = {
      status: 422,
      data: {
        errors: [
          "Title is required",
          "Price must be a positive number",
          "Mobile number is invalid",
        ],
      },
    };
    showError(error, "validation");
  };

  const testSuccess = () => {
    showSuccess("Operation completed successfully!", "Success");
  };

  const testWarning = () => {
    showWarning("This action cannot be undone.", "Warning");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Error Notification System Test
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Network Errors</h3>
          <button
            onClick={testNetworkError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Network Error
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Property Errors</h3>
          <button
            onClick={testPropertyError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Property Error
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Booking Errors</h3>
          <button
            onClick={testBookingError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Booking Error
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Upload Errors</h3>
          <button
            onClick={testUploadError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Upload Error
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Validation Errors</h3>
          <button
            onClick={testValidationError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test Validation Error
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Success Messages</h3>
          <button
            onClick={testSuccess}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Success
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Warning Messages</h3>
          <button
            onClick={testWarning}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Test Warning
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          Features of the New Error System:
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Detailed Error Messages:</strong> Each error shows a clear
            title and description
          </li>
          <li>
            <strong>Context-Specific Help:</strong> Different error types show
            relevant suggestions
          </li>
          <li>
            <strong>Actionable Advice:</strong> Users get specific steps to
            resolve issues
          </li>
          <li>
            <strong>Visual Hierarchy:</strong> Errors are styled with proper
            colors and spacing
          </li>
          <li>
            <strong>Longer Duration:</strong> Error messages stay visible for 8
            seconds
          </li>
          <li>
            <strong>Responsive Design:</strong> Works well on both desktop and
            mobile
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TestErrorNotifications;
