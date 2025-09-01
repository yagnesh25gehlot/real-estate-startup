import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  X,
  Send,
  Clock,
  MapPin,
  Mail,
} from "lucide-react";
import {
  showError,
  showSuccess,
  showWarning,
} from "../utils/errorNotifications";

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QueryModal: React.FC<QueryModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      showError(new Error("Please enter your message"), "validation");
      return;
    }

    if (!mobileNumber.trim()) {
      showError(new Error("Please enter your mobile number"), "validation");
      return;
    }

    // Basic mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber.replace(/\s/g, ""))) {
      showError(
        new Error("Please enter a valid 10-digit mobile number"),
        "validation"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          mobileNumber: mobileNumber.trim(),
        }),
      });

      if (response.ok) {
        showSuccess(
          "Your inquiry has been sent successfully! We'll get back to you soon.",
          "Inquiry Sent"
        );
        setMessage("");
        setMobileNumber("");
        onClose();
      } else {
        showError(
          new Error("Failed to send inquiry. Please try again."),
          "inquiry"
        );
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      showError(error, "inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto relative">
        {/* Mobile-friendly close button at top-right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 pr-12">
              Send Inquiry
            </h2>
          </div>

          {/* Motivational Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Need Help? We're Here for You! 🏠
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Whether you're buying, selling, or renting - our expert team is
              ready to assist you with all your real estate needs!
            </p>

            {/* Contact Information */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-blue-700">
                <Phone className="h-4 w-4 mr-2" />
                <span>
                  Call us: <strong>8112279602</strong>
                </span>
              </div>
              <div className="flex items-center text-blue-700">
                <Phone className="h-4 w-4 mr-2" />
                <span>
                  Call us: <strong>9828676477</strong>
                </span>
              </div>
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  Available: <strong>9 AM - 9 PM</strong>
                </span>
              </div>
              <div className="flex items-center text-blue-700">
                <Mail className="h-4 w-4 mr-2" />
                <span>
                  Email: <strong>bussiness.startup.work@gmail.com</strong>
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 placeholder-gray-500"
                placeholder="Tell us about your inquiry... (e.g., I want to buy a 2BHK apartment in Bangalore, I need help with property documentation, etc.)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 placeholder-gray-500"
                placeholder="Enter your 10-digit mobile number"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-base font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-base font-medium"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const FloatingQueryIcon: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Query Icon */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-6 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 z-50 group"
        style={{
          boxShadow: "0 8px 24px rgba(220, 38, 38, 0.5)",
        }}
      >
        <MessageCircle className="h-8 w-8" />

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Need Help? Ask Us!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Query Modal */}
      <QueryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FloatingQueryIcon;
