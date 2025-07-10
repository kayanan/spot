import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaUser, FaPhone, FaIdCard, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const UserDetailsPopup = ({
    isOpen,
    onClose,
    onSubmit,
    title = "User Details",
    initialData = {},
    loading = false
}) => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nic: '',
        customerMobile: '',
        email: '',
        ...initialData
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                nic: '',
                customerMobile: '',
                ...initialData
            });
            setErrors({});
        }
    }, [isOpen, initialData]);

    const validateForm = () => {
        const newErrors = {};

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
            newErrors.firstName = 'First name can only contain letters and spaces';
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }

        // Email validation
        if (!formData.nic.trim()) {
            newErrors.nic = 'NIC number is required';
        } else if (!/^[0-9]{9}[Vv]$/.test(formData.nic.trim()) && !/^[0-9]{12}$/.test(formData.nic.trim())) {
            newErrors.nic = 'Please enter a valid NIC number';
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
            const [checkDuplicateEntry, result] = await Promise.all([
                axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/check-duplicate-entry`, {
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    nic: formData.nic.trim(),
                    customerMobile: formData.customerMobile.trim()
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/role/`)
            ])
            if(checkDuplicateEntry.data.status === false){
                setErrors(checkDuplicateEntry.data.errorResponse);
                return;
            }
            
            const role = result.data.roles.find(role => role.type === "CUSTOMER");

            const user = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/signup`, {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                nic: formData.nic.trim(),
                phoneNumber: formData.customerMobile.trim(),
                role: [role._id],
                approvalStatus:true,
                addedBy: "MANAGER"
            });
            console.log(user,"user.data.data---------------------------------------------------");

            await onSubmit({customerMobile:formData.customerMobile.trim(),vehicleNumber:formData.vehicleNumber.trim()});

            // Reset form after successful submission
            setFormData({
                firstName: '',
                lastName: '',
                nic: '',
                customerMobile: '',
                ...initialData
            });
            setErrors({});
            onClose();
        } catch (error) {
            if (error.response.data.errorResponse) {

                setErrors(error.response.data.errorResponse);
                return;
            }

            toast.error('Failed to submit user details');
        }
    };

    const handleClose = () => {
        setFormData({
            firstName: '',
            lastName: '',
            nic: '',
            customerMobile: '',
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
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="John"
                                maxLength="50"
                            />
                        </div>
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaIdCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Doe"
                                maxLength="50"
                            />
                        </div>
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.nic ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="example@gmail.com"
                                maxLength="100"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            NIC Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaIdCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="nic"
                                value={formData.nic}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.nic ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="123456789V or 123456789123"
                                maxLength="100"
                            />
                        </div>
                        {errors.nic && (
                            <p className="mt-1 text-sm text-red-600">{errors.nic}</p>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number
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
                                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.customerMobile ? 'border-red-500' : 'border-gray-300'
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

export default UserDetailsPopup; 