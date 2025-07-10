import React from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

const ConfirmationPopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-500 hover:bg-red-600",
  icon = "warning"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (icon) {
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500 text-2xl" />;
      case "danger":
        return <FaExclamationTriangle className="text-red-500 text-2xl" />;
      case "info":
        return <FaExclamationTriangle className="text-blue-500 text-2xl" />;
      default:
        return <FaExclamationTriangle className="text-yellow-500 text-2xl" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors font-medium"
          >
            <FaTimes className="text-sm" />
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 flex items-center justify-center gap-2 text-white py-2 px-4 rounded-lg transition-colors font-medium ${confirmButtonClass}`}
          >
            <FaCheck className="text-sm" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup; 