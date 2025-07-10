import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCar, FaMotorcycle, FaBus, FaMapMarkerAlt, FaMoneyBillWave, FaStar, FaUser, FaPhone, FaIdCard, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SpotDetailsPopup = ({
    isOpen,
    onClose,
    onSubmit,
    spotData,
    userData,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        customerMobile: userData?.mobileNumber || '',
        customerName: userData?.firstName + " " + userData?.lastName || ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && spotData) {
            setFormData({
                vehicleNumber: '',
                customerMobile: userData?.mobileNumber || '',
                customerName: userData?.firstName + " " + userData?.lastName || ''
            });
            setErrors({});
        }
    }, [isOpen, spotData]);

    const validateForm = () => {
        const newErrors = {};

        // Customer name validation
        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Customer name is required';
        }

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
            const reservationData = {
                ...formData,
                vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
                customerMobile: formData.customerMobile.trim(),
                customerName: formData.customerName.trim(),
                parkingAreaId: spotData.id,
                spotName: spotData.name,
                vehicleType: spotData.vehicleType
            };

            await onSubmit(reservationData);
            setFormData({
                vehicleNumber: '',
                customerMobile: '',
                customerName: ''
            });
            setErrors({});
            onClose();
        } catch (error) {
            toast.error('Failed to confirm reservation');
        }
    };

    const handleClose = () => {
        setFormData({
            vehicleNumber: '',
            customerMobile: '',
            customerName: ''
        });
        setErrors({});
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType) {
            case 'car':
                return <FaCar className="h-6 w-6 text-cyan-600" />;
            case 'motorcycle':
                return <FaMotorcycle className="h-6 w-6 text-emerald-600" />;
            case 'bus':
                return <FaBus className="h-6 w-6 text-purple-600" />;
            default:
                return <FaCar className="h-6 w-6 text-gray-600" />;
        }
    };

    const getVehicleTypeLabel = (vehicleType) => {
        switch (vehicleType) {
            case 'car':
                return 'Car';
            case 'motorcycle':
                return 'Motorcycle';
            case 'bus':
                return 'Bus';
            default:
                return 'Vehicle';
        }
    };

    if (!isOpen || !spotData) return null;

    const totalPrice = spotData.price * parseInt(formData.duration);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Spot Details & Reservation</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Spot Details */}
                <div className="p-6 space-y-6">
                    {/* Spot Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                {getVehicleIcon(spotData.vehicleType)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{spotData.name}</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        <span>{spotData.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMoneyBillWave className="text-green-500" />
                                        <span>Rs. {spotData.price}/hour</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaStar className="text-yellow-500" />
                                        <span>Rating: {spotData.rating || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-500" />
                                    <span>Distance: {`${spotData.distance} Km` || 'N/A'}</span>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Form */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">Reservation Details</h4>

                        {/* Customer Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.customerName && (
                                <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                            )}
                        </div>

                        {/* Vehicle Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaIdCard className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="ABC-1234"
                                    maxLength="10"
                                />
                            </div>
                            {errors.vehicleNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Format: ABC-1234 or ABC 1234
                            </p>
                        </div>

                        {/* Customer Mobile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="customerMobile"
                                    value={formData.customerMobile}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.customerMobile ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="0771234567"
                                    maxLength="12"
                                />
                            </div>
                            {errors.customerMobile && (
                                <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                With or without country code (+94)
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (Hours)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(hour => (
                                        <option key={hour} value={hour}>
                                            {hour} {hour === 1 ? 'Hour' : 'Hours'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="bg-cyan-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Estimated Total Price:</span>
                                <span className="text-xl font-bold text-cyan-600">
                                    Rs. {totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.duration} hour(s) × Rs. {spotData.price}/hour
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
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
                        disabled={loading || !spotData.available}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            'Confirm Reservation'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpotDetailsPopup; 