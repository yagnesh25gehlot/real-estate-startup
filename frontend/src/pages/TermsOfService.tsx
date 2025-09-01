import React from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms of Service - RealtyTopper | सेवा की शर्तें</title>
        <meta
          name="description"
          content="RealtyTopper Terms of Service - Read our terms and conditions for using our real estate platform and services."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Agreement to Terms
            </h2>
            <p className="text-blue-800">
              By accessing and using RealtyTopper's platform and services, you
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our services.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Service Description
            </h2>
            <p className="mb-4">
              RealtyTopper is a real estate platform that connects property
              owners, buyers, and tenants. Our services include:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  For Property Owners
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Property listing and advertising</li>
                  <li>• Lead generation and buyer connection</li>
                  <li>• Deal facilitation and support</li>
                  <li>• Document verification services</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  For Buyers/Tenants
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Property search and discovery</li>
                  <li>• Booking and inquiry services</li>
                  <li>• Property viewing assistance</li>
                  <li>• Legal and documentation support</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. User Registration and Verification
            </h2>

            <div className="bg-yellow-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Requirements
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>
                  • <strong>Valid Aadhaar:</strong> All users must provide valid
                  Aadhaar number and card image
                </li>
                <li>
                  • <strong>Accurate Information:</strong> All provided
                  information must be true and accurate
                </li>
                <li>
                  • <strong>Age Requirement:</strong> Users must be 18 years or
                  older
                </li>
                <li>
                  • <strong>Account Security:</strong> Users are responsible for
                  maintaining account security
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Fees and Payment Terms
            </h2>

            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Transparent Pricing Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Property Listing Fees
                  </h4>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Minimal advertising fees for property listing</li>
                    <li>• Fully refundable upon successful deal completion</li>
                    <li>• No hidden charges or additional fees</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Commission Structure
                  </h4>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Rent/Lease: 30% of first month rent</li>
                    <li>• Buy/Sell: 2% of property price</li>
                    <li>• Charged only after successful deal completion</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Payment Terms
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All fees must be paid in advance before services are provided
              </li>
              <li>
                Payment methods include online transfers, UPI, and bank deposits
              </li>
              <li>Refunds are processed within 7-10 business days</li>
              <li>Late payments may result in service suspension</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Property Listings and Information
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Property Owner Responsibilities
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate and complete property information</li>
              <li>Upload clear, high-quality property images</li>
              <li>Maintain property availability status</li>
              <li>Respond to inquiries within 24 hours</li>
              <li>Provide all necessary documents for verification</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Prohibited Content
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>False or misleading property information</li>
              <li>Duplicate or spam listings</li>
              <li>Properties without proper ownership documentation</li>
              <li>Illegal or unauthorized properties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Booking and Deal Process
            </h2>

            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Booking Process
              </h3>
              <ol className="space-y-2 text-blue-700">
                <li>
                  <strong>1. Property Selection:</strong> Buyer selects and
                  books a property
                </li>
                <li>
                  <strong>2. Payment:</strong> Booking charges are paid to
                  RealtyTopper
                </li>
                <li>
                  <strong>3. Seller Notification:</strong> Property owner is
                  notified of the booking
                </li>
                <li>
                  <strong>4. Advance Payment:</strong> Seller pays advance
                  amount (50% of commission)
                </li>
                <li>
                  <strong>5. Contact Sharing:</strong> Buyer and seller contact
                  details are shared
                </li>
                <li>
                  <strong>6. Deal Completion:</strong> Full commission is
                  collected upon successful deal
                </li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Cancellation and Refund Policy
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Buyer Cancellation:</strong> Minimum ₹1000 fine deducted
                from booking amount
              </li>
              <li>
                <strong>Seller Cancellation:</strong> Minimum ₹1000 fine
                deducted from advance payment
              </li>
              <li>
                <strong>Happy Scenarios:</strong> Full refund provided when no
                fault is found
              </li>
              <li>
                <strong>Processing Time:</strong> Refunds processed within 7-10
                business days
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. User Conduct and Prohibited Activities
            </h2>

            <div className="bg-red-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Prohibited Activities
              </h3>
              <ul className="space-y-2 text-red-700">
                <li>• Providing false or misleading information</li>
                <li>• Attempting to bypass our platform for direct deals</li>
                <li>• Harassing or threatening other users</li>
                <li>• Violating any applicable laws or regulations</li>
                <li>• Attempting to gain unauthorized access to our systems</li>
                <li>• Spamming or sending unsolicited communications</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="mb-4">
              RealtyTopper acts as an intermediary platform and is not
              responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Direct transactions between buyers and sellers</li>
              <li>Property condition or quality issues</li>
              <li>Legal disputes between parties</li>
              <li>Financial losses due to market conditions</li>
              <li>Third-party service provider issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Dispute Resolution
            </h2>
            <p className="mb-4">
              In case of disputes, we follow this resolution process:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Direct Communication:</strong> Parties attempt to
                resolve issues directly
              </li>
              <li>
                <strong>Platform Mediation:</strong> RealtyTopper mediates the
                dispute
              </li>
              <li>
                <strong>Legal Support:</strong> Professional legal assistance if
                required
              </li>
              <li>
                <strong>Arbitration:</strong> Binding arbitration as a last
                resort
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Termination
            </h2>
            <p className="mb-4">
              We may terminate or suspend your account in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activities</li>
              <li>Repeated complaints from other users</li>
              <li>Non-payment of fees</li>
              <li>Inappropriate behavior or harassment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Contact Information
            </h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="mb-4">
                For questions about these Terms of Service, please contact us:
              </p>

              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold">Phone:</span>
                <span className="ml-2">8112279602</span>
              </div>

              <div className="flex items-center mb-2">
                <span className="font-semibold">Business Hours:</span>
                <span className="ml-2">9 AM - 9 PM (Monday - Sunday)</span>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                We will respond to your inquiry within 24-48 hours during
                business days.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time.
              We will notify users of any material changes by posting the
              updated terms on our website and updating the "Last updated" date.
              Continued use of our services after changes constitutes acceptance
              of the new terms.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
