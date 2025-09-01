import React from "react";
import FloatingQueryIcon from "../components/FloatingQueryIcon";

const TestFloatingIcon: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test Floating Icon
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Look for the red floating icon in the bottom-right corner
      </p>

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Test Content</h2>
        <p className="text-gray-600">
          This is a test page to verify that the floating query icon is working
          properly. You should see a red circular button with a message icon in
          the bottom-right corner.
        </p>
      </div>

      {/* The floating icon should be visible here */}
      <FloatingQueryIcon />
    </div>
  );
};

export default TestFloatingIcon;

