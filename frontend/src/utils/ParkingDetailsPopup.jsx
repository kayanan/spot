import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCar, FaPhone, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';

const ParkingDetailsPopup = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Parking Details",
  initialData = {},
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    customerMobile: '',
    endsAt: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (isOpen) {
//       setFormData({
//         vehicleNumber: '',
//         customerMobile: '',
//         ...initialData
//       });
//       setErrors({});
//     }
//   }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors = {};

    // Vehicle number validation (Sri Lankan format)
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    } else if (!/^[A-Z a-z]{2,3}\s?\d{4}$/.test(formData.vehicleNumber.trim().toUpperCase())) {
      newErrors.vehicleNumber = 'Please enter a valid vehicle number (e.g., ABC-1234 or ABC 1234)';
    }

    // Mobile number validation (Sri Lankan format)
    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = 'Mobile number is required';
    } else if (!/^(\+94|0)?[1-9][0-9]{8}$/.test(formData.customerMobile.trim())) {
      newErrors.customerMobile = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    if(e.target.name === "endsAt"){
      if(dayjs(e.target.value).isBefore(dayjs())){
        setErrors({
          endsAt: "Ends at cannot be in the past"
        });
        return;
      }
    }
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        customerMobile: formData.customerMobile.trim(),
        endsAt: formData?.endsAt
      });
      setFormData({
        vehicleNumber: '',
        customerMobile: '',
        endsAt: '',
        ...initialData
      });
      setErrors({});
      onClose();
    } catch (error) {
      toast.error('Failed to submit parking details');
    }
  };

  const handleClose = () => {
    setFormData({
      vehicleNumber: '',
      customerMobile: '',
      endsAt: '',
      ...initialData
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ABC-1234"
                maxLength="10"
              />
            </div>
            {errors.vehicleNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter vehicle number in format: ABC-1234 or ABC 1234
            </p>
          </div>

          {/* Customer Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="customerMobile"
                value={formData.customerMobile}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.customerMobile ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0771234567"
                maxLength="12"
              />
            </div>
            {errors.customerMobile && (
              <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter mobile number with or without country code (+94)
            </p>
          </div>
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends At (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaClock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleInputChange}
                min= {dayjs().format("YYYY-MM-DDTHH:mm")}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.endsAt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.endsAt && (
              <p className="mt-1 text-sm text-red-600">{errors.endsAt}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter duration in format: YYYY-MM-DD HH:MM
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-400 flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Okay'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingDetailsPopup; 