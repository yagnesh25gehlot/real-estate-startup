import React from "react";
import toast from "react-hot-toast";

export interface ErrorDetails {
  title: string;
  message: string;
  suggestions?: string[];
  action?: string;
}

export class ErrorNotificationService {
  /**
   * Show a detailed error notification with comprehensive information
   */
  static showError(error: any, context?: string): void {
    const errorDetails = this.parseError(error, context);

    // Show the main error message
    toast.error(
      (t) => (
        <div className="text-left">
          <div className="font-semibold text-red-800 mb-1">
            {errorDetails.title}
          </div>
          <div className="text-sm text-red-700 mb-2">
            {errorDetails.message}
          </div>
          {errorDetails.suggestions && errorDetails.suggestions.length > 0 && (
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Suggestions:</div>
              <ul className="list-disc list-inside space-y-1">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {errorDetails.action && (
            <div className="text-xs text-blue-600 mt-2 font-medium">
              {errorDetails.action}
            </div>
          )}
        </div>
      ),
      {
        duration: 8000,
        position: "top-right",
        style: {
          minWidth: "400px",
          maxWidth: "500px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
        },
      }
    );
  }

  /**
   * Show a success notification
   */
  static showSuccess(message: string, title?: string): void {
    toast.success(
      (t) => (
        <div className="text-left">
          {title && (
            <div className="font-semibold text-green-800 mb-1">{title}</div>
          )}
          <div className="text-sm text-green-700">{message}</div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
        style: {
          minWidth: "300px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          color: "#166534",
        },
      }
    );
  }

  /**
   * Show a warning notification
   */
  static showWarning(message: string, title?: string): void {
    toast(
      (t) => (
        <div className="text-left">
          {title && (
            <div className="font-semibold text-yellow-800 mb-1">{title}</div>
          )}
          <div className="text-sm text-yellow-700">{message}</div>
        </div>
      ),
      {
        duration: 6000,
        position: "top-right",
        icon: "⚠️",
        style: {
          minWidth: "300px",
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          color: "#92400e",
        },
      }
    );
  }

  /**
   * Parse different types of errors and return detailed information
   */
  private static parseError(error: any, context?: string): ErrorDetails {
    // Network errors
    if (
      error.code === "NETWORK_ERROR" ||
      error.message?.includes("Network Error")
    ) {
      return {
        title: "Network Connection Error",
        message:
          "Unable to connect to the server. Please check your internet connection.",
        suggestions: [
          "Check your internet connection",
          "Try refreshing the page",
          "Check if the server is running",
          "Try again in a few moments",
        ],
        action: "If the problem persists, contact support.",
      };
    }

    // Timeout errors
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return {
        title: "Request Timeout",
        message:
          "The request took too long to complete. This might be due to a slow connection or server load.",
        suggestions: [
          "Check your internet speed",
          "Try again in a few moments",
          "Close other applications using the internet",
          "Try using a different network if available",
        ],
        action:
          "If the problem continues, the server might be experiencing high load.",
      };
    }

    // Server errors
    if (error.response?.status === 500) {
      return {
        title: "Server Error",
        message: "An internal server error occurred. This is not your fault.",
        suggestions: [
          "Try again in a few moments",
          "Refresh the page",
          "Clear your browser cache",
          "Contact support if the problem persists",
        ],
        action: "Our team has been notified of this issue.",
      };
    }

    // Not found errors
    if (error.response?.status === 404) {
      return {
        title: "Resource Not Found",
        message: "The requested resource could not be found on the server.",
        suggestions: [
          "Check if the URL is correct",
          "Try refreshing the page",
          "Navigate back to the previous page",
          "Contact support if you believe this is an error",
        ],
        action:
          "This might be a temporary issue or the resource may have been moved.",
      };
    }

    // Unauthorized errors
    if (error.response?.status === 401) {
      return {
        title: "Authentication Required",
        message: "You need to be logged in to perform this action.",
        suggestions: [
          "Please log in to your account",
          "Check if your session has expired",
          "Try refreshing the page",
          "Contact support if you believe you should have access",
        ],
        action: "You will be redirected to the login page.",
      };
    }

    // Forbidden errors
    if (error.response?.status === 403) {
      return {
        title: "Access Denied",
        message: "You do not have permission to perform this action.",
        suggestions: [
          "Check if you have the required permissions",
          "Contact your administrator",
          "Try logging out and logging back in",
          "Contact support for assistance",
        ],
        action: "If you believe this is an error, please contact support.",
      };
    }

    // Validation errors
    if (error.response?.status === 422 || error.response?.status === 400) {
      const validationErrors =
        error.response?.data?.errors || error.response?.data?.error;
      if (validationErrors) {
        return {
          title: "Validation Error",
          message: Array.isArray(validationErrors)
            ? validationErrors.join(", ")
            : validationErrors,
          suggestions: [
            "Please check the information you entered",
            "Make sure all required fields are filled",
            "Check the format of your data",
            "Try again with corrected information",
          ],
          action: "Please correct the errors and try again.",
        };
      }
    }

    // Property-specific errors
    if (
      context === "property" ||
      error.response?.data?.error?.includes("property")
    ) {
      return this.parsePropertyError(error);
    }

    // Booking-specific errors
    if (
      context === "booking" ||
      error.response?.data?.error?.includes("booking")
    ) {
      return this.parseBookingError(error);
    }

    // File upload errors
    if (context === "upload" || error.response?.data?.error?.includes("file")) {
      return this.parseUploadError(error);
    }

    // Default error
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return {
      title: "Error",
      message: errorMessage,
      suggestions: [
        "Try refreshing the page",
        "Check your internet connection",
        "Try again in a few moments",
        "Contact support if the problem persists",
      ],
      action: "If this error continues, please contact our support team.",
    };
  }

  /**
   * Parse property-related errors
   */
  private static parsePropertyError(error: any): ErrorDetails {
    const errorMessage = error.response?.data?.error || error.message || "";

    if (errorMessage.includes("not found")) {
      return {
        title: "Property Not Found",
        message: "The property you are looking for could not be found.",
        suggestions: [
          "Check if the property ID is correct",
          "The property may have been removed",
          "Try searching for other properties",
          "Contact support if you believe this is an error",
        ],
        action: "You will be redirected to the properties page.",
      };
    }

    if (
      errorMessage.includes("permission") ||
      errorMessage.includes("unauthorized")
    ) {
      return {
        title: "Property Access Denied",
        message:
          "You do not have permission to access or modify this property.",
        suggestions: [
          "Check if you are the owner of this property",
          "Contact the property owner for access",
          "Try logging in with a different account",
          "Contact support for assistance",
        ],
        action:
          "If you believe you should have access, please contact support.",
      };
    }

    if (errorMessage.includes("already exists")) {
      return {
        title: "Property Already Exists",
        message:
          "A property with similar details already exists in our system.",
        suggestions: [
          "Check if you have already listed this property",
          "Try searching for your existing listing",
          "Contact support to merge duplicate listings",
          "Modify the property details to make it unique",
        ],
        action: "Please review your property details and try again.",
      };
    }

    return {
      title: "Property Error",
      message:
        errorMessage || "An error occurred while processing the property.",
      suggestions: [
        "Check all required fields are filled",
        "Verify the property details are correct",
        "Try again in a few moments",
        "Contact support if the problem persists",
      ],
      action: "Please try again or contact support for assistance.",
    };
  }

  /**
   * Parse booking-related errors
   */
  private static parseBookingError(error: any): ErrorDetails {
    const errorMessage = error.response?.data?.error || error.message || "";

    if (errorMessage.includes("already booked")) {
      return {
        title: "Property Already Booked",
        message: "This property has already been booked by another user.",
        suggestions: [
          "Check other available properties",
          "Contact the property owner for availability",
          "Try booking a different property",
          "Set up notifications for similar properties",
        ],
        action: "You can browse other available properties.",
      };
    }

    if (errorMessage.includes("payment")) {
      return {
        title: "Payment Error",
        message: "There was an issue with the payment processing.",
        suggestions: [
          "Check your payment details",
          "Ensure you have sufficient funds",
          "Try using a different payment method",
          "Contact your bank if the issue persists",
        ],
        action: "Please try again with correct payment information.",
      };
    }

    if (errorMessage.includes("dealer code")) {
      return {
        title: "Invalid Dealer Code",
        message: "The dealer code you entered is not valid.",
        suggestions: [
          "Check the dealer code spelling",
          "Contact the dealer for the correct code",
          "Try booking without a dealer code",
          "Contact support for assistance",
        ],
        action: "Please enter a valid dealer code or try booking directly.",
      };
    }

    return {
      title: "Booking Error",
      message:
        errorMessage || "An error occurred while processing your booking.",
      suggestions: [
        "Check all booking details are correct",
        "Ensure you are logged in",
        "Try again in a few moments",
        "Contact support if the problem persists",
      ],
      action: "Please try again or contact support for assistance.",
    };
  }

  /**
   * Parse file upload errors
   */
  private static parseUploadError(error: any): ErrorDetails {
    const errorMessage = error.response?.data?.error || error.message || "";

    if (errorMessage.includes("size") || errorMessage.includes("large")) {
      return {
        title: "File Too Large",
        message: "The file you are trying to upload is too large.",
        suggestions: [
          "Compress the image to reduce file size",
          "Use a lower resolution image",
          "Try a different image format (JPEG, PNG)",
          "Maximum file size is 5MB",
        ],
        action: "Please select a smaller file and try again.",
      };
    }

    if (errorMessage.includes("format") || errorMessage.includes("type")) {
      return {
        title: "Invalid File Format",
        message: "The file format is not supported.",
        suggestions: [
          "Use JPEG, PNG, or PDF files only",
          "Check the file extension",
          "Convert the file to a supported format",
          "Try uploading a different file",
        ],
        action: "Please select a file in a supported format.",
      };
    }

    if (
      errorMessage.includes("corrupted") ||
      errorMessage.includes("damaged")
    ) {
      return {
        title: "File Corrupted",
        message: "The file appears to be corrupted or damaged.",
        suggestions: [
          "Try uploading the original file",
          "Check if the file opens correctly on your device",
          "Try a different file",
          "Contact support if the problem persists",
        ],
        action: "Please select a different file and try again.",
      };
    }

    return {
      title: "Upload Error",
      message: errorMessage || "An error occurred while uploading the file.",
      suggestions: [
        "Check your internet connection",
        "Try uploading a smaller file",
        "Try a different file format",
        "Contact support if the problem persists",
      ],
      action: "Please try again or contact support for assistance.",
    };
  }
}

// Convenience functions for common error types
export const showError = (error: any, context?: string) =>
  ErrorNotificationService.showError(error, context);
export const showSuccess = (message: string, title?: string) =>
  ErrorNotificationService.showSuccess(message, title);
export const showWarning = (message: string, title?: string) =>
  ErrorNotificationService.showWarning(message, title);
