import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  Filter,
  Home as HomeIcon,
  Users,
  Calendar,
  ChevronDown,
  CheckCircle,
  Star,
  Shield,
  Phone,
  MapPin,
  Building,
  Plus,
  Zap,
  IndianRupee,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("RENT");
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState(""); // Changed to empty string for "Any"
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [stateSearchQuery, setStateSearchQuery] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

  // Hardcoded cities list including Test City
  const cities = [
    "Test City",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Varanasi",
    "Srinagar",
    "Aurangabad",
    "Dhanbad",
    "Amritsar",
    "Allahabad",
    "Ranchi",
    "Howrah",
    "Coimbatore",
    "Jabalpur",
    "Gwalior",
    "Vijayawada",
    "Jodhpur",
    "Madurai",
    "Raipur",
    "Kota",
    "Guwahati",
    "Chandigarh",
    "Solapur",
    "Hubli-Dharwad",
    "Bareilly",
    "Moradabad",
    "Mysore",
    "Gurgaon",
    "Aligarh",
    "Jalandhar",
    "Tiruchirappalli",
    "Bhubaneswar",
    "Salem",
    "Warangal",
    "Thiruvananthapuram",
    "Bhiwandi",
    "Saharanpur",
    "Guntur",
    "Amravati",
    "Bikaner",
    "Noida",
    "Jamshedpur",
    "Bhilai",
    "Cuttack",
    "Firozabad",
    "Kochi",
    "Nellore",
    "Bhavnagar",
    "Dehradun",
    "Durgapur",
    "Asansol",
    "Rourkela",
    "Nanded",
    "Kolhapur",
    "Ajmer",
    "Akola",
    "Gulbarga",
    "Jamnagar",
    "Ujjain",
    "Loni",
    "Siliguri",
    "Jhansi",
    "Ulhasnagar",
    "Jammu",
    "Sangli-Miraj",
    "Mangalore",
    "Erode",
    "Belgaum",
    "Ambattur",
    "Tirunelveli",
    "Malegaon",
    "Gaya",
    "Jalgaon",
    "Udaipur",
    "Maheshtala",
    "Tirupur",
    "Davanagere",
    "Kozhikode",
    "Kurnool",
    "Rajpur Sonarpur",
    "Bokaro",
    "South Dumdum",
    "Bellary",
    "Patiala",
    "Gopalpur",
    "Agartala",
    "Bhagalpur",
    "Muzaffarnagar",
    "Bhatpara",
    "Panihati",
    "Latur",
    "Dhule",
    "Rohtak",
    "Korba",
    "Bhilwara",
    "Berhampur",
    "Muzaffarpur",
    "Ahmednagar",
    "Mathura",
    "Kollam",
    "Avadi",
    "Kadapa",
    "Kamarhati",
    "Bilaspur",
    "Shahjahanpur",
    "Satara",
    "Bijapur",
    "Rampur",
    "Shivamogga",
    "Chandrapur",
    "Junagadh",
    "Thrissur",
    "Alwar",
    "Bardhaman",
    "Kulti",
    "Kakinada",
    "Nizamabad",
    "Parbhani",
    "Tumkur",
    "Hisar",
    "Ozhukarai",
    "Bihar Sharif",
    "Panipat",
    "Darbhanga",
    "Bally",
    "Aizawl",
    "Dewas",
    "Ichalkaranji",
    "Tirupati",
    "Karnal",
    "Bathinda",
    "Shivpuri",
    "Ratlam",
    "Handwara",
    "Sangli",
    "Damoh",
    "Satna",
    "Beawar",
    "Puri",
  ];

  // Hardcoded states list
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Puducherry",
    "Andaman and Nicobar Islands",
  ];

  // Filter cities based on search query
  const filterCities = (query: string) => {
    if (!query.trim()) {
      return cities.slice(0, 10); // Show first 10 cities when no search
    }
    return cities
      .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // Limit to 10 results
  };

  // Filter states based on search query
  const filterStates = (query: string) => {
    if (!query.trim()) {
      return states.slice(0, 10); // Show first 10 states when no search
    }
    return states
      .filter((state) => state.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // Limit to 10 results
  };

  // Handle city search input change
  const handleCitySearchChange = (query: string) => {
    setCitySearchQuery(query);
    setFilteredCities(filterCities(query));
    setShowCityDropdown(true);
  };

  // Handle state search input change
  const handleStateSearchChange = (query: string) => {
    setStateSearchQuery(query);
    setFilteredStates(filterStates(query));
    setShowStateDropdown(true);
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearchQuery(city);
    setShowCityDropdown(false);
  };

  // Handle state selection
  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setStateSearchQuery(state);
    setShowStateDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize filtered cities and states
  useEffect(() => {
    setFilteredCities(cities.slice(0, 10));
    setFilteredStates(states.slice(0, 10));
    setCitySearchQuery(selectedCity);
    setStateSearchQuery(selectedState);
  }, []);

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();

    // Add action (RENT, LEASE, SELL)
    params.append("action", activeTab);

    // Add city (always include, even if it's the default)
    if (selectedCity) {
      params.append("city", selectedCity);
    }

    // Add state (always include, even if it's the default)
    if (selectedState) {
      params.append("state", selectedState);
    }

    // Add property type if selected (not "Any")
    if (propertyType) {
      params.append("type", propertyType);
    }

    // Add availability date if selected
    if (availabilityDate) {
      params.append("availabilityDate", availabilityDate);
    }

    // Navigate to properties page with filters
    navigate(`/properties?${params.toString()}`);
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "SELL":
        return "Buy";
      case "RENT":
        return "Rent";
      case "LEASE":
        return "Lease";
      default:
        return "Rent";
    }
  };

  return (
    <>
      <Helmet>
        <title>RealtyTopper - Your Trusted Property Partner</title>
        <meta
          name="description"
          content="Find your dream property with RealtyTopper. Free listings, trusted dealers, and 24/7 support. Buy, sell, rent properties with complete transparency."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-12 rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/house.jpg"
              alt="Dream Property"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          <div className="relative z-10 text-center py-20 px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Your Dream Property
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Next-generation real estate platform where users can buy, sell,
              rent, or list properties with ease and transparency. Our core
              focus is on rentals with a trusted network of professional dealers
              with 20+ years of experience.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-12 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Search Properties
            </h2>
            <p className="text-gray-600 text-lg">
              Find the perfect property that matches your requirements
            </p>
          </div>

          {/* Action Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-xl p-2">
              {["RENT", "LEASE", "SELL"].map((action) => (
                <button
                  key={action}
                  onClick={() => setActiveTab(action)}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    activeTab === action
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {getActionLabel(action)}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Property Type */}
            <div className="relative">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-white hover:border-gray-300"
              >
                <option value="">Any Property Type</option>
                <option value="HOUSE">House</option>
                <option value="FLAT">Flat</option>
                <option value="VILLA">Villa</option>
                <option value="SHOP">Shop</option>
                <option value="SHOWROOM">Showroom</option>
                <option value="FARMHOUSE">Farmhouse</option>
                <option value="PLOT">Plot</option>
              </select>
            </div>

            {/* City Search */}
            <div className="relative" ref={cityDropdownRef}>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                City
              </label>
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => handleCitySearchChange(e.target.value)}
                placeholder="Search for a city..."
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-white hover:border-gray-300"
              />
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-5 py-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-lg border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* State Search */}
            <div className="relative" ref={stateDropdownRef}>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                State
              </label>
              <input
                type="text"
                value={stateSearchQuery}
                onChange={(e) => handleStateSearchChange(e.target.value)}
                placeholder="Search for a state..."
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-white hover:border-gray-300"
              />
              {showStateDropdown && filteredStates.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredStates.map((state, index) => (
                    <button
                      key={index}
                      onClick={() => handleStateSelect(state)}
                      className="w-full px-5 py-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-lg border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Available By */}
            <div className="relative">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Available By
              </label>
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="Select date"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="text-center">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-xl font-bold text-xl transition-all duration-200 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="w-6 h-6 mr-3" />
              Search Properties
            </button>
          </div>
        </div>

        {/* Post Property Ad Section - Prominent Placement */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black opacity-10"></div>

          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Looking for Tenants / Buyers?
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-full">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-lg font-medium">
                      Faster & Verified Tenants/Buyers
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    user ? navigate("/list-property") : navigate("/signup")
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-6 w-6" />
                  <span>
                    {user
                      ? "Post FREE Property Ad"
                      : "Sign Up to Post Property"}
                  </span>
                </button>
              </div>

              {/* Right Graphic */}
              <div className="flex justify-center items-center">
                <div className="relative">
                  {/* House Graphic */}
                  <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg transform rotate-3">
                    <div className="w-24 md:w-32 h-18 md:h-24 bg-gray-200 rounded-t-lg relative">
                      {/* Roof */}
                      <div className="absolute -top-2 left-0 right-0 h-4 bg-blue-600 transform -skew-x-12"></div>
                      {/* Chimney */}
                      <div className="absolute -top-4 right-4 w-3 h-6 bg-blue-700 rounded-t"></div>
                      {/* Door */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-blue-800 rounded-t"></div>
                      {/* Windows */}
                      <div className="absolute top-4 left-4 w-4 h-4 bg-blue-300 rounded"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 bg-blue-300 rounded"></div>
                    </div>
                    {/* Tree */}
                    <div className="absolute -bottom-2 -left-2 w-6 h-8 bg-green-600 rounded-full"></div>
                  </div>

                  {/* Hand dropping key */}
                  <div className="absolute -top-8 -right-4">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <div className="w-6 h-8 bg-blue-300 rounded-t-full relative">
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Categories */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Property Categories
          </h2>
          <p className="text-gray-600 mb-8">
            Explore different types of properties we offer
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
          {[
            {
              name: "Villa",
              propertyType: "VILLA",
              image: "/images/villa.jpg",
              fallbackImage:
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            },
            {
              name: "House",
              propertyType: "HOUSE",
              image: "/images/house.jpg",
              fallbackImage:
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            },
            {
              name: "Apartment",
              propertyType: "APARTMENT",
              image: "/images/apartments.jpg",
              fallbackImage:
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            },
            {
              name: "Plot",
              propertyType: "PLOT",
              image: "/images/plot.jpg",
              fallbackImage:
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            },
            {
              name: "Shop",
              propertyType: "SHOP",
              image: "/images/shop.jpg",
              fallbackImage:
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            },
          ].map((category, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(`/properties?type=${category.propertyType}`)
              }
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer transform hover:scale-105"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = category.fallbackImage;
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View {category.name}s
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Trusted Platform
            </h3>
            <p className="text-gray-600">
              Verified properties and trusted dealers with 20+ years of
              experience
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              24/7 Support
            </h3>
            <p className="text-gray-600">
              Round-the-clock customer support for all your queries
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
