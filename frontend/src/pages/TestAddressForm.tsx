import React, { useState } from "react";

const TestAddressForm = () => {
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    pincode: "",
    locality: "",
    street: "",
    landmark: "",
    subRegion: "",
    type: "",
    flatNumber: "",
    buildingName: "",
    shopNumber: "",
    complexName: "",
    plotNumber: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Testing New Address Fields
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Basic Address Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Bangalore, Mumbai, Delhi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Karnataka, Maharashtra, Delhi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 560001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locality / Area / Layout <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="locality"
              required
              value={formData.locality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., BTM Layout, Koramangala, Whitefield"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street / Road{" "}
              <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Chocolate Factory Road, MG Road"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Near Forum Mall, Opposite Metro Station"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-region / Zone{" "}
              <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <input
              type="text"
              name="subRegion"
              value={formData.subRegion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., South Bengaluru, North Mumbai"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type (to test conditional fields)
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select property type</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="SHOP">Shop</option>
            <option value="PLOT">Plot</option>
          </select>
        </div>

        {/* Property Type Specific Fields */}
        {(formData.type === "APARTMENT" ||
          formData.type === "HOUSE" ||
          formData.type === "VILLA") && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Apartment/House/Villa Specific Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flat / Door Number{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="flatNumber"
                  value={formData.flatNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., A-101, Flat 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building / Apartment Name{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sunshine Apartments, Green Valley"
                />
              </div>
            </div>
          </div>
        )}

        {(formData.type === "COMMERCIAL" || formData.type === "SHOP") && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Commercial/Shop Specific Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop / Unit Number{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="shopNumber"
                  value={formData.shopNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Shop 15, Unit A-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complex / Market Name{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="complexName"
                  value={formData.complexName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Phoenix MarketCity, Forum Mall"
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === "PLOT" && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Plot/Land Specific Fields
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plot / Survey Number{" "}
                <span className="text-gray-500 text-sm">(Optional)</span>
              </label>
              <input
                type="text"
                name="plotNumber"
                value={formData.plotNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Survey No. 123, Plot 45"
              />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Form Data Preview:</h4>
          <pre className="text-sm text-blue-800 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestAddressForm;
