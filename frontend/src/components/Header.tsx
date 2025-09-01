import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X, User, LogOut, Home, Plus, ChevronDown } from "lucide-react";
import Logo from "./Logo";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Handle click outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-dropdown")) {
        setIsDesktopDropdownOpen(false);
      }
    };

    if (isDesktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Check if user should see Join Us button (normal users who are not dealers)
  const shouldShowJoinUs = user && user.role === "USER" && !user.dealer;

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              to="/about"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <Logo />
              <span className="text-2xl font-bold text-gray-900">
                RealtyTopper
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center Section */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Home Button with Icon */}
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* List Property Button - Only for authenticated users */}
            {user && (
              <Link
                to="/list-property"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>List Property</span>
              </Link>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Join Us Button for Normal Users */}
                {shouldShowJoinUs && (
                  <Link
                    to="/dealer-signup"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Join Us
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative user-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDesktopDropdownOpen(!isDesktopDropdownOpen);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 border ${
                      isDesktopDropdownOpen
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                    }`}
                    style={{
                      backgroundColor: isDesktopDropdownOpen
                        ? "#dbeafe"
                        : undefined,
                      borderColor: isDesktopDropdownOpen
                        ? "#3b82f6"
                        : undefined,
                    }}
                  >
                    <User
                      className={`h-5 w-5 ${
                        isDesktopDropdownOpen
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDesktopDropdownOpen
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {user.name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        isDesktopDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] ${
                      isDesktopDropdownOpen ? "block" : "hidden"
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role.toLowerCase()}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsDesktopDropdownOpen(false)}
                    >
                      <span className="w-4 h-4 mr-3">📊</span>
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsDesktopDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>

                    <Link
                      to="/my-properties"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsDesktopDropdownOpen(false)}
                    >
                      <Home className="h-4 w-4 mr-3" />
                      My Properties
                    </Link>

                    <Link
                      to="/about"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsDesktopDropdownOpen(false)}
                    >
                      <span className="w-4 h-4 mr-3">ℹ️</span>
                      About Us
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsDesktopDropdownOpen(false)}
                      >
                        <span className="w-4 h-4 mr-3">⚙️</span>
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDesktopDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signup"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Login
                </Link>

                <Link
                  to="/dealer-signup"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="lg:hidden border-t border-gray-200 bg-white absolute top-full left-0 right-0 z-50 shadow-lg max-h-screen overflow-y-auto">
              <div className="px-4 py-6 space-y-4">
                {/* Main Navigation */}
                <div className="space-y-3">
                  <Link
                    to="/"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    Home
                  </Link>

                  {/* List Property Button - Only for authenticated users */}
                  {user && (
                    <Link
                      to="/list-property"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      List Property
                    </Link>
                  )}
                </div>

                {/* Auth Section */}
                {user ? (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    {/* Join Us Button for Normal Users (Mobile) */}
                    {shouldShowJoinUs && (
                      <Link
                        to="/dealer-signup"
                        className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="w-5 h-5 mr-3">🤝</span>
                        Join Us
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="w-5 h-5 mr-3">📊</span>
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Profile
                    </Link>

                    <Link
                      to="/my-properties"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="h-5 w-5 mr-3" />
                      My Properties
                    </Link>

                    <Link
                      to="/list-property"
                      className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      List Property
                    </Link>

                    <Link
                      to="/about"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="w-5 h-5 mr-3">ℹ️</span>
                      About Us
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="w-5 h-5 mr-3">⚙️</span>
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <Link
                      to="/signup"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="w-5 h-5 mr-3">📝</span>
                      Sign Up
                    </Link>

                    <Link
                      to="/login"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="w-5 h-5 mr-3">🔑</span>
                      Login
                    </Link>

                    <Link
                      to="/dealer-signup"
                      className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="w-5 h-5 mr-3">🤝</span>
                      Join Us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
