import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaCheck, FaTimes } from 'react-icons/fa';

const PromptPopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Enter Information", 
  message = "Please provide the required information:", 
  placeholder = "Enter your input here...",
  confirmText = "Submit", 
  cancelText = "Cancel",
  confirmButtonClass = "bg-blue-500 hover:bg-blue-600",
  defaultValue = "",
  required = true,
  maxLength = 500,
  type = "text",
  minValue = 0
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      setError("");
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (required && !inputValue.trim()) {
      setError("This field is required");
      return;
    }
    
    if (inputValue.trim().length > maxLength) {
      setError(`Input must be less than ${maxLength} characters`);
      return;
    }
    if (type === "number" && isNaN(inputValue)) {
      setError("Please enter a valid number");
      return;
    }
    if (type === "number" && inputValue < minValue) {
      setError(`${placeholder ? placeholder : "Please enter a number"} must be greater than or equal to ${minValue}`);
      return;
    }

    onConfirm(inputValue.trim());
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaQuestionCircle className="text-blue-500 text-2xl" />
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
          <p className="text-gray-600 leading-relaxed mb-4">{message}</p>
          
          <div className="space-y-2">
            {type === "text" ? <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              maxLength={maxLength}
              autoFocus
            /> : <input
              type={type}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />}
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{required ? "Required field" : "Optional field"}</span>
              {type === "text" && <span>{inputValue.length}/{maxLength}</span>}
            </div>
          </div>
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

export default PromptPopup; 