import React, { useEffect } from "react";
import { X } from "lucide-react";
import PropertyForm from "./PropertyForm";

interface PropertyEditModalProps {
  property: any;
  onClose: () => void;
  onSave: (updatedProperty: any) => void;
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  property,
  onClose,
  onSave,
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full p-2 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <PropertyForm
          mode="edit"
          property={property}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
};

export default PropertyEditModal;
