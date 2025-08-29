import React, { useState } from "react";
import {
  X,
  Upload,
  IndianRupee,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";
import { bookingsApi } from "../services/api";
import toast from "react-hot-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    dealerCode: "",
    paymentRef: "",
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Calculate booking charges based on property action (same logic as PropertyDetail)
  const calculateBookingCharges = (prop: any) => {
    if (prop.action === "RENT") {
      // For rent: 1 month rent
      return prop.perMonthCharges || 0;
    } else if (prop.action === "LEASE") {
      // For lease: Total amount / Total duration (1 month equivalent)
      // If duration is 0, use total amount as booking charges
      if (!prop.leaseDuration || prop.leaseDuration === 0) {
        return prop.perMonthCharges || 0;
      }
      return Math.round((prop.perMonthCharges || 0) / prop.leaseDuration);
    } else {
      // For SELL: Use stored booking charges or 0
      return prop.bookingCharges || 0;
    }
  };

  const bookingCharges = calculateBookingCharges(property);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentRef.trim()) {
      toast.error("Payment reference is required");
      return;
    }

    if (formData.paymentRef.trim().length < 4) {
      toast.error("Payment reference must be at least 4 characters");
      return;
    }

    setLoading(true);
    try {
      await bookingsApi.createBooking({
        propertyId: property.id,
        dealerCode: formData.dealerCode || undefined,
        paymentRef: formData.paymentRef,
        paymentProof: paymentProof || undefined,
      });

      toast.success(
        "Booking submitted successfully! Admin will review and confirm."
      );
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit booking");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      setPaymentProof(file);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Book Property</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Booking Date:{" "}
                {startDate.toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <IndianRupee className="h-4 w-4 mr-1" />
              <span className="font-semibold">
                ₹{formatPrice(bookingCharges)} booking amount
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Property Type:</span>{" "}
              {property.type} • {property.action}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Location:</span> {property.location}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dealer Code (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer Code (Optional)
              </label>
              <input
                type="text"
                value={formData.dealerCode}
                onChange={(e) =>
                  setFormData({ ...formData, dealerCode: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter dealer referral code"
              />
            </div>

            {/* Contact Information */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Need Help?</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  📞 Call: <strong>+91 7023176884</strong>
                </p>
                <p>
                  💬 WhatsApp: <strong>+91 7023176884</strong>
                </p>
                <p>
                  📧 Email: <strong>bussiness.startup.work@gmail.com</strong>
                </p>
              </div>
            </div>

            {/* UPI Payment Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Payment Instructions
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  1. Pay ₹{formatPrice(bookingCharges)} to UPI ID:{" "}
                  <strong>8290936884@ybl</strong>
                </p>
                <p>2. Enter the payment reference below</p>
                <p>3. Upload payment proof (required)</p>
              </div>
            </div>

            {/* Booking Type Information */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Booking Information
              </h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>
                  ✅ <strong>Permanent Booking:</strong> This reserves the
                  property permanently
                </p>
                <p>
                  ✅ <strong>Admin Review:</strong> Your booking will be
                  reviewed and confirmed
                </p>
                <p>
                  ✅ <strong>Secure Payment:</strong> Payment is processed
                  securely via UPI
                </p>
              </div>
            </div>

            {/* Payment Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paymentRef}
                onChange={(e) =>
                  setFormData({ ...formData, paymentRef: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter UPI transaction reference"
                required
              />
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Proof <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="payment-proof"
                />
                <label htmlFor="payment-proof" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {paymentProof
                      ? paymentProof.name
                      : "Click to upload payment screenshot"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, PDF up to 5MB
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Submit Booking - ₹{formatPrice(bookingCharges)}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              This booking reserves the property permanently. Admin will review
              and confirm your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
