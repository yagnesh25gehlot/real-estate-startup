import React, { useState } from "react";
import {
  X,
  Upload,
  CheckCircle,
  Star,
  Users,
  Target,
  Shield,
  Phone,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";

interface ListingFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentProof: File) => void;
  propertyTitle: string;
}

const ListingFeeModal: React.FC<ListingFeeModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  propertyTitle,
}) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (JPG, PNG, etc.)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setPaymentProof(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof) {
      toast.error("Please upload payment proof");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPaymentComplete(paymentProof);
      toast.success("Payment proof uploaded successfully!");
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast.error("Failed to upload payment proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaymentProof(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Property Listing Fee
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Complete payment to publish your property
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Property Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Property Details
            </h3>
            <p className="text-blue-800">{propertyTitle}</p>
          </div>

          {/* Fee Information */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-lg font-bold text-gray-900">
                Listing Fee: ₹100
              </h3>
              <div className="bg-green-100 px-3 py-1 rounded-full self-start sm:self-auto">
                <span className="text-green-800 font-semibold text-sm">
                  One-time Payment
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    25x More Visibility
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Reach thousands of genuine buyers
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Genuine Buyers
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    We verify all potential buyers for authenticity
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="bg-orange-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Full Refund
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Get refunded when deal completes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="bg-green-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Premium Support
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Dedicated assistance throughout
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Why Pay Listing Fee?
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  <strong>Massive Reach:</strong> Your property gets featured to
                  thousands of verified buyers
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  <strong>Genuine Buyers:</strong> We pre-screen all potential
                  buyers for authenticity
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  <strong>Complete Refund:</strong> 100% refund when you
                  complete the deal with our buyer
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  <strong>Expert Support:</strong> Our team helps you throughout
                  the selling process
                </span>
              </li>
            </ul>
          </div>

          {/* Commission Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Commission Structure
            </h3>
            <div className="space-y-4 text-sm">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Rent/Lease Properties
                </h4>
                <p className="text-gray-600 mb-2">
                  Commission: <strong>1 month equivalent rent</strong>
                </p>
                <p className="text-gray-500 text-xs">
                  Example: If monthly rent is ₹15,000, commission = ₹15,000
                </p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Sale Properties
                </h4>
                <p className="text-gray-600 mb-2">
                  Commission: <strong>2% of final sale price</strong>
                </p>
                <p className="text-gray-500 text-xs">
                  Example: If property sells for ₹50,00,000, commission =
                  ₹1,00,000
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded border">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-blue-800 text-xs space-y-1">
                  <li>
                    • Commission is charged only when deal is successfully
                    completed
                  </li>
                  <li>
                    • Listing fee (₹100) is refunded when commission is paid
                  </li>
                  <li>• Commission is calculated on the final agreed price</li>
                  <li>
                    • No commission for properties that don't get sold/rented
                  </li>
                  <li>
                    • Commission is shared with our dealer network if applicable
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Upload */}
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Upload Payment Proof
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-proof"
                />
                <label htmlFor="payment-proof" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Click to upload payment screenshot
                  </p>
                  <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
                </label>
              </div>

              {previewUrl && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payment Proof Preview:
                  </h4>
                  <img
                    src={previewUrl}
                    alt="Payment proof"
                    className="max-w-full h-48 object-contain rounded border"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>
                    Call us for special discounts:{" "}
                    <strong>+91-8112279602</strong>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!paymentProof || isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Publish Property</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingFeeModal;
