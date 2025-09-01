import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Shield, Eye, Lock, Users, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>
          Privacy Policy - RealtyTopper | आपकी गोपनीयता हमारी प्राथमिकता
        </title>
        <meta
          name="description"
          content="RealtyTopper Privacy Policy - Learn how we protect your personal information and maintain your privacy while providing real estate services."
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
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
              <Eye className="h-5 w-5 mr-2" />
              Your Privacy Matters
            </h2>
            <p className="text-blue-800">
              At RealtyTopper, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, and safeguard your data when
              you use our real estate platform.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Personal Information
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Contact Information:</strong> Name, email address, phone
                number, and address
              </li>
              <li>
                <strong>Identity Verification:</strong> Aadhaar number and
                Aadhaar card image for verification
              </li>
              <li>
                <strong>Property Information:</strong> Details about properties
                you list or inquire about
              </li>
              <li>
                <strong>Communication Data:</strong> Messages, inquiries, and
                feedback you send to us
              </li>
              <li>
                <strong>Payment Information:</strong> Details for listing fees,
                booking charges, and commission payments
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Technical Information
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Device Information:</strong> IP address, browser type,
                operating system
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, time spent, search
                queries
              </li>
              <li>
                <strong>Cookies:</strong> Small data files to improve your
                experience
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How We Use Your Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Property Services
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Process property listings and inquiries</li>
                  <li>• Connect buyers with sellers</li>
                  <li>• Facilitate property viewings and deals</li>
                  <li>• Handle booking charges and commissions</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Communication
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Respond to your inquiries and requests</li>
                  <li>• Send important updates about your account</li>
                  <li>• Provide customer support</li>
                  <li>• Send promotional offers (with consent)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Security & Verification
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Verify your identity and documents</li>
                  <li>• Prevent fraud and ensure platform safety</li>
                  <li>• Comply with legal requirements</li>
                  <li>• Protect against unauthorized access</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Improvement
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Analyze usage patterns</li>
                  <li>• Improve our services and platform</li>
                  <li>• Develop new features</li>
                  <li>• Personalize your experience</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information Sharing
            </h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>With Your Consent:</strong> When you explicitly agree to
                share information
              </li>
              <li>
                <strong>Property Transactions:</strong> To facilitate deals
                between buyers and sellers
              </li>
              <li>
                <strong>Service Providers:</strong> With trusted partners who
                help us operate our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of merger,
                acquisition, or sale of assets
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                How We Protect Your Data
              </h3>
              <ul className="space-y-2 text-green-700">
                <li>
                  • <strong>Encryption:</strong> All sensitive data is encrypted
                  using industry-standard protocols
                </li>
                <li>
                  • <strong>Secure Storage:</strong> Data is stored on secure
                  servers with multiple layers of protection
                </li>
                <li>
                  • <strong>Access Control:</strong> Limited access to personal
                  information on a need-to-know basis
                </li>
                <li>
                  • <strong>Regular Audits:</strong> We conduct regular security
                  assessments and updates
                </li>
                <li>
                  • <strong>Employee Training:</strong> Our team is trained on
                  data protection best practices
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="mb-4">
              You have the following rights regarding your personal information:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Access & Update
                </h3>
                <p className="text-sm text-gray-600">
                  View and update your personal information in your account
                  settings
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600">
                  Request deletion of your account and associated data
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Opt-Out</h3>
                <p className="text-sm text-gray-600">
                  Unsubscribe from marketing communications
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Data Portability
                </h3>
                <p className="text-sm text-gray-600">
                  Request a copy of your data in a portable format
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>

              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold">Phone:</span>
                <span className="ml-2">8112279602</span>
              </div>

              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
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
              Updates to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of any material changes by posting the updated policy on our
              website and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
