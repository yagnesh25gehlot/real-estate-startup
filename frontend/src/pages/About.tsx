import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Building2,
  Users,
  TrendingUp,
  Gift,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Award,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - RealtyTopper</title>
        <meta
          name="description"
          content="Learn about RealtyTopper - Your trusted partner in real estate with MLM dealer structure and comprehensive property solutions."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative mb-16 rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/villa.jpg"
              alt="About RealtyTopper"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
          <div className="relative z-10 text-center py-20 px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-blue-300">RealtyTopper</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Next-generation real estate platform where users can buy, sell,
              rent, or list properties with ease and transparency. Our core
              focus is on rentals with a trusted network of professional dealers
              with 20+ years of experience.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To provide a comprehensive real estate platform focused on
              rentals, offering free property listings, massive reach without
              advertising costs, and a trusted network of professional dealers.
              We ensure trust, transparency, and legality in all transactions
              with 24/7 customer support and a "ghar jaisa touch" approach.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Star className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To become India's most trusted rental platform, optimized for
              Rajasthani properties while serving clients across India. We aim
              to create unlimited growth opportunities for dealers with referral
              commissions and performance-based rewards.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              RealtyTopper offers free property listings, massive reach without
              advertising costs, and a multilevel dealer network with referral
              commissions and performance-based rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Rental Focus
              </h3>
              <p className="text-gray-600">
                Our core focus is on the rental business, offering free property
                listings and massive reach without advertising costs. Sellers
                benefit from free leads and zero promotion fees.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Trusted Network
              </h3>
              <p className="text-gray-600">
                A trusted network of professional dealers with 20+ years of
                experience, providing multilevel dealer network with referral
                commissions and performance-based rewards.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ghar Jaisa Touch
              </h3>
              <p className="text-gray-600">
                We ensure trust, transparency, and legality in all transactions
                with 24/7 customer support and a "ghar jaisa touch" - our
                homely, honest approach that sets us apart.
              </p>
            </div>
          </div>
        </div>

        {/* Dealer Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benefits of Joining as a Dealer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the advantages of becoming a RealtyTopper dealer and
              start your journey towards financial success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    MLM Structure
                  </h3>
                  <p className="text-gray-600">
                    Build your own network of dealers and earn commissions from
                    your downline sales through our multi-level marketing
                    structure.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Full Support
                  </h3>
                  <p className="text-gray-600">
                    Get comprehensive support from our team including training,
                    marketing materials, and technical assistance.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Gift className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Gifts & Rewards
                  </h3>
                  <p className="text-gray-600">
                    Earn exciting gifts, offers, and benefits when you complete
                    your targets and achieve milestones.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Professional Growth
                  </h3>
                  <p className="text-gray-600">
                    Develop your skills as a real estate professional with our
                    training programs and industry insights.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Income Potential
                  </h3>
                  <p className="text-gray-600">
                    Unlimited earning potential through direct sales, team
                    building, and performance-based incentives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RealtyTopper
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a smooth property buying and selling experience with
              comprehensive support and innovative solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verified Properties
              </h3>
              <p className="text-gray-600 text-sm">
                All properties are verified and quality-checked for your safety
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Expert Dealers
              </h3>
              <p className="text-gray-600 text-sm">
                Professional dealers with extensive market knowledge
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quality Service
              </h3>
              <p className="text-gray-600 text-sm">
                Dedicated support team available 24/7 for assistance
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Future Ready
              </h3>
              <p className="text-gray-600 text-sm">
                Platform designed for future expansion and growth
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Real Estate Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join RealtyTopper today and discover the opportunities waiting for
            you in the real estate market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/become-dealer"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="h-5 w-5" />
              Become a Dealer
            </Link>
            <Link
              to="/list-property"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Building2 className="h-5 w-5" />
              List Your Property
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
