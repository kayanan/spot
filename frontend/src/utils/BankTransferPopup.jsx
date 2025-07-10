import { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaSpinner, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BankTransferPopup = ({
  isOpen,
  onClose,
  onSubmit,
  amount,
  parkingAreaId,
  parkingOwnerId,
  imagesRequired = true, // New prop to control if images are required
  maxImages = 5 // New prop to control max images
}) => {
  const [formData, setFormData] = useState({
    amount: amount,
    parkingAreaId: parkingAreaId,
    parkingOwnerId: parkingOwnerId,
    referenceNumber: '',
    bankName: '',
    branch: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // Track which fields have been touched
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // Validation patterns
  const validationPatterns = {
    referenceNumber: {
      pattern: /^[A-Za-z0-9]{6,15}$/,
      message: 'Please enter a valid reference number (6-15 characters, letters and numbers only)',
      required: 'Reference number is required'
    },
    bankName: {
      pattern: /^[A-Za-z\s]{2,50}$/,
      message: 'Please enter a valid bank name (2-50 characters, letters and spaces only)',
      required: 'Bank name is required'
    },
    branch: {
      pattern: /^[A-Za-z0-9\s]{2,50}$/,
      message: 'Please enter a valid branch name (2-50 characters, letters, numbers and spaces)',
      required: 'Branch is required'
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (fieldName, value) => {
    const field = validationPatterns[fieldName];
    if (!field) return '';

    if (!value.trim()) {
      return field.required;
    }

    if (!field.pattern.test(value.trim())) {
      return field.message;
    }

    return '';
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast.error('Please upload only JPG, PNG, or WebP images');
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    if (files.length + formData.images.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploadingImages(true);
    try {
      // Create preview URLs for the uploaded files
      const filesWithPreview = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...filesWithPreview]
      }));

      toast.success(`${files.length} image(s) uploaded successfully`);

      // Clear file input
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages
      };
    });

    // Clear image error if images are no longer required or if we have images
    if (!imagesRequired || formData.images.length > 1) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    Object.keys(validationPatterns).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    // Validate images if required
    if (imagesRequired && formData.images.length === 0) {
      newErrors.images = 'Please upload at least one payment receipt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      referenceNumber: true,
      bankName: true,
      branch: true,
      images: true
    });

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        amount,
        images: formData.images.map(img => img.file || img) // Extract file objects
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      toast.error('Failed to submit payment details');
    } finally {
      setLoading(false);
      setFormData({
        amount: "",
        parkingAreaId: '',
        parkingOwnerId: '',
        referenceNumber: '',
        bankName: '',
        branch: '',
        images: []
      });
    }
  };

  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return 'default';
    if (errors[fieldName]) return 'error';
    if (formData[fieldName]?.trim()) return 'success';
    return 'default';
  };

  const getFieldClasses = (fieldName) => {
    const status = getFieldStatus(fieldName);
    const baseClasses = "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200";

    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`;
      case 'success':
        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-cyan-500 focus:border-cyan-500`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bank Transfer Details</h2>
          <button
           onClick={() => {
            onClose() 
            setFormData({
              amount: "",
              parkingAreaId: '',
              parkingOwnerId: '',
              referenceNumber: '',
              bankName: '',
              branch: '',
              images: []
            });
          }}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay
            </label>
            <p className="text-2xl font-bold text-cyan-600">
              LKR {amount.toLocaleString()}
            </p>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClasses('referenceNumber')}
                placeholder="e.g., QT123455efdv, abc123DEF"
              />
              {getFieldStatus('referenceNumber') === 'success' && (
                <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
              )}
              {getFieldStatus('referenceNumber') === 'error' && (
                <FaExclamationTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
              )}
            </div>
            {errors.referenceNumber && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={12} />
                {errors.referenceNumber}
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClasses('bankName')}
                placeholder="e.g., Commercial Bank, Bank of Ceylon"
              />
              {getFieldStatus('bankName') === 'success' && (
                <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
              )}
              {getFieldStatus('bankName') === 'error' && (
                <FaExclamationTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
              )}
            </div>
            {errors.bankName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={12} />
                {errors.bankName}
              </p>
            )}
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClasses('branch')}
                placeholder="e.g., Colombo Main, Kandy City"
              />
              {getFieldStatus('branch') === 'success' && (
                <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
              )}
              {getFieldStatus('branch') === 'error' && (
                <FaExclamationTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
              )}
            </div>
            {errors.branch && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={12} />
                {errors.branch}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Receipt Images {imagesRequired && <span className="text-red-500">*</span>}
              <span className="text-gray-500 text-xs ml-2">
                (Max {maxImages}, {imagesRequired ? 'Required' : 'Optional'})
              </span>
            </label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview || image}
                      alt={`Receipt ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-cyan-300 transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={formData.images.length >= maxImages || uploadingImages}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-md transition-all duration-200 ${formData.images.length >= maxImages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'hover:bg-cyan-50 text-cyan-700 border-cyan-300 hover:border-cyan-400'
                  }`}
              >
                {uploadingImages ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaUpload />
                )}
                {uploadingImages ? 'Uploading...' : `Upload Images (${formData.images.length}/${maxImages})`}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, WebP (max 5MB each)
              </p>
            </div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={12} />
                {errors.images}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onClose() 
                setFormData({
                  amount: "",
                  parkingAreaId: '',
                  parkingOwnerId: '',
                  referenceNumber: '',
                  bankName: '',
                  branch: '',
                  images: []
                });
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankTransferPopup;