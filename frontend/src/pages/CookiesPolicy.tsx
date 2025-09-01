import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Cookie, Settings, Shield, Info, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CookiesPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Cookies Policy - RealtyTopper | कुकीज़ नीति</title>
        <meta
          name="description"
          content="RealtyTopper Cookies Policy - Learn how we use cookies to improve your experience on our real estate platform."
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
            <Cookie className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Cookies Policy</h1>
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
              <Info className="h-5 w-5 mr-2" />
              About Cookies
            </h2>
            <p className="text-blue-800">
              This Cookies Policy explains how RealtyTopper uses cookies and
              similar technologies to enhance your experience on our real estate
              platform. By using our website, you consent to the use of cookies
              as described in this policy.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What Are Cookies?
            </h2>
            <p className="mb-4">
              Cookies are small text files that are stored on your device
              (computer, tablet, or mobile phone) when you visit our website.
              They help us provide you with a better experience by:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Functionality
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Remember your preferences</li>
                  <li>• Keep you logged in</li>
                  <li>• Store your search history</li>
                  <li>• Improve page loading speed</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
                <ul className="text-sm space-y-1">
                  <li>• Understand how you use our site</li>
                  <li>• Identify popular properties</li>
                  <li>• Improve our services</li>
                  <li>• Personalize your experience</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Types of Cookies We Use
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Essential Cookies
                </h3>
                <p className="text-gray-600 mb-3">
                  These cookies are necessary for the website to function
                  properly and cannot be disabled.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Security cookies to protect against fraud</li>
                  <li>Session cookies to maintain your browsing session</li>
                  <li>Load balancing cookies for optimal performance</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Functional Cookies
                </h3>
                <p className="text-gray-600 mb-3">
                  These cookies enhance your experience by remembering your
                  preferences and choices.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Language and region preferences</li>
                  <li>Property search filters and history</li>
                  <li>Favorite properties and saved searches</li>
                  <li>Form data to avoid re-entering information</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-orange-600" />
                  Analytics Cookies
                </h3>
                <p className="text-gray-600 mb-3">
                  These cookies help us understand how visitors use our website
                  to improve our services.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Page views and time spent on pages</li>
                  <li>Property search patterns and popular areas</li>
                  <li>User journey and navigation paths</li>
                  <li>Error tracking and performance monitoring</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <Cookie className="h-5 w-5 mr-2 text-purple-600" />
                  Marketing Cookies
                </h3>
                <p className="text-gray-600 mb-3">
                  These cookies are used to deliver relevant advertisements and
                  track marketing campaign effectiveness.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Targeted property recommendations</li>
                  <li>Social media integration</li>
                  <li>Email marketing campaign tracking</li>
                  <li>Third-party advertising networks</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Third-Party Cookies
            </h2>
            <p className="mb-4">
              We may use third-party services that place cookies on your device.
              These services include:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Analytics Services
                </h3>
                <ul className="text-sm space-y-1 text-yellow-700">
                  <li>• Google Analytics for website analytics</li>
                  <li>• Hotjar for user behavior analysis</li>
                  <li>• Facebook Pixel for social media tracking</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Payment Services
                </h3>
                <ul className="text-sm space-y-1 text-yellow-700">
                  <li>• Payment gateway cookies for transactions</li>
                  <li>• Banking partner cookies for verification</li>
                  <li>• UPI service cookies for payments</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cookie Duration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Session Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Deleted when you close your browser
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Persistent Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Remain on your device for up to 2 years
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Third-Party Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Duration set by third-party services
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Managing Your Cookie Preferences
            </h2>

            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                How to Control Cookies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Browser Settings
                  </h4>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Chrome: Settings → Privacy and Security → Cookies</li>
                    <li>• Firefox: Options → Privacy & Security → Cookies</li>
                    <li>• Safari: Preferences → Privacy → Cookies</li>
                    <li>• Edge: Settings → Cookies and site permissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Our Cookie Banner
                  </h4>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Accept all cookies for full functionality</li>
                    <li>• Customize preferences for specific types</li>
                    <li>• Reject non-essential cookies</li>
                    <li>• Change preferences anytime in settings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Important Note
              </h3>
              <p className="text-yellow-700 text-sm">
                Disabling certain cookies may affect the functionality of our
                website. Essential cookies cannot be disabled as they are
                necessary for basic website operations.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Collected Through Cookies
            </h2>
            <p className="mb-4">
              Cookies may collect the following types of information:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Technical Information
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Device type and browser</li>
                  <li>• IP address and location</li>
                  <li>• Operating system</li>
                  <li>• Screen resolution</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Usage Information
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Pages visited and time spent</li>
                  <li>• Property searches and filters</li>
                  <li>• Click patterns and interactions</li>
                  <li>• Error messages and performance</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Updates to This Policy
            </h2>
            <p className="mb-4">
              We may update this Cookies Policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Posting the updated policy on our website</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending email notifications for significant changes</li>
              <li>Displaying a banner on our website for major updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="mb-4">
                If you have any questions about our use of cookies or this
                Cookies Policy, please contact us:
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
        </div>
      </div>
    </>
  );
};

export default CookiesPolicy;
