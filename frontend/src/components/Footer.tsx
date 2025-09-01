import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  X,
  Clock,
} from "lucide-react";
import Logo from "./Logo";
import FloatingQueryIcon from "./FloatingQueryIcon";

const Footer: React.FC = () => {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Logo variant="white" size="lg" className="mb-4" />
            <p className="text-gray-300 mb-6">
              Your trusted partner in real estate. We connect you with the best
              properties across multiple cities with verified listings and
              secure transactions.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61579263880439"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/realtytopper/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/list-property"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  List Property
                </Link>
              </li>
              <li>
                <Link
                  to="/become-dealer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Become a Dealer
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cookies Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <a
                  href="tel:+918112279602"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +91 8112279602
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <a
                  href="tel:+919828676477"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +91 9828676477
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <a
                  href="mailto:bussiness.startup.work@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  bussiness.startup.work@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-green-400" />
                <a
                  href="https://chat.whatsapp.com/C9OEMS9fNdI2S2LKeR9aKP?mode=ac_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Join WhatsApp Group
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 VRUSKARAMA REAL ESTATE PRIVATE LIMITED. All rights
              reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies-policy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookies Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <FloatingQueryIcon />

      {/* Custom Inquiry Modal for Footer */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={() => setIsInquiryModalOpen(false)}
              className="absolute top-3 right-3 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 pr-12">
                  Contact Us
                </h2>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Get in Touch! 🏠
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  Whether you're buying, selling, or renting - our expert team
                  is ready to assist you with all your real estate needs!
                </p>

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

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  For immediate assistance, please call us directly. For general
                  inquiries, you can use the floating inquiry button on any
                  page.
                </p>
                <button
                  onClick={() => setIsInquiryModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
