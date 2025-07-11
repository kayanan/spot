// src/pages/User/UpdateUser.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { designationOptions } from "../../../utils/DropdownOptions";

// Form validation functions
const validateForm = (data) => {
  const errors = {};

  if (!data.firstName?.trim()) {
    errors.firstName = "First name is required";
  }

  if (!data.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!data.nic?.trim()) {
    errors.nic = "NIC is required";
  } else if (!/^(\d{9}[V|v])|(\d{4}\s?\d{4}\s?\d{4})$/.test(data.nic)) {
    errors.nic = "Invalid NIC format";
  }

  if (!data.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^07[01245678][0-9]{7}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Invalid phone number format";
  }

  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.line1?.trim()) {
    errors.line1 = "Address line 1 is required";
  }

  if (!data.city?.trim()) {
    errors.city = "City is required";
  }

  if (!data.district?.trim()) {
    errors.district = "District is required";
  }

  if (!data.province?.trim()) {
    errors.province = "Province is required";
  }

  // Validate vehicles
  if (data.vehicles && data.vehicles.length > 0) {
    data.vehicles.forEach((vehicle, index) => {
      if (!vehicle.vehicleNumber?.trim()) {
        if (!errors.vehicles) errors.vehicles = {};
        errors.vehicles[index] = { vehicleNumber: "Vehicle number is required" };
      }
    });
  }

  // Validate account details
  if (data.accountDetails && data.accountDetails.length > 0) {
    data.accountDetails.forEach((account, index) => {
      if (!account.accountHolderName?.trim()) {
        if (!errors.accountDetails) errors.accountDetails = {};
        errors.accountDetails[index] = { accountHolderName: "Account holder name is required" };
      }
      if (!account.accountNumber?.trim()) {
        if (!errors.accountDetails) errors.accountDetails = {};
        if (!errors.accountDetails[index]) errors.accountDetails[index] = {};
        errors.accountDetails[index].accountNumber = "Account number is required";
      }
      if (!account.bankName?.trim()) {
        if (!errors.accountDetails) errors.accountDetails = {};
        if (!errors.accountDetails[index]) errors.accountDetails[index] = {};
        errors.accountDetails[index].bankName = "Bank name is required";
      }
      if (!account.branchName?.trim()) {
        if (!errors.accountDetails) errors.accountDetails = {};
        if (!errors.accountDetails[index]) errors.accountDetails[index] = {};
        errors.accountDetails[index].branchName = "Branch name is required";
      }
    });
  }

  return errors;
};

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [previewImage, setPreviewImage] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    phoneNumber: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    district: "",
    province: "",
    zipCode: "",
    role: [],
    privilegeList: [],
    isActive: true,
    approvalStatus: false,
    vehicles: [],
    accountDetails: [],
  });

  // Arrays for dynamic fields
  const [roleFields, setRoleFields] = useState([]);
  const [vehicleFields, setVehicleFields] = useState([]);
  const [accountFields, setAccountFields] = useState([]);

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/province/`, {
          withCredentials: true,
        });
        setProvinces(response.data.provinces || []);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Failed to load provinces.");
      } finally {
        setLoading(false);
      }
    };
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/role/`, {
          withCredentials: true,
        });
        setRoles(response.data.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to load roles.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();

    fetchProvinces();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Fetch districts when province changes
  const handleProvinceChange = async (provinceId) => {
    try {
      setLoading(true);
      setDistricts([]);
      setCities([]);
      handleChange({ target: { name: "district", value: "" } });
      handleChange({ target: { name: "city", value: "" } });

      if (provinceId) {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/district/${provinceId}`, {
          withCredentials: true,
        });
        setDistricts(response.data.districts || []);
        // Set the province name instead of ID
        const selectedProvince = provinces.find(p => p._id === provinceId);
        if (selectedProvince) {
          handleChange({ target: { name: "province", value: selectedProvince.name } });
        }
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Failed to load districts.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cities when district changes
  const handleDistrictChange = async (districtId) => {
    try {
      setLoading(true);
      setCities([]);
      handleChange({ target: { name: "city", value: "" } });

      if (districtId) {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/city/`, {
          params: { districtId },
          withCredentials: true,
        });
        setCities(response.data.cities || []);
        // Set the district name instead of ID
        const selectedDistrict = districts.find(d => d._id === districtId);
        if (selectedDistrict) {
          handleChange({ target: { name: "district", value: selectedDistrict.name } });
        }
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities.");
    } finally {
      setLoading(false);
    }
  };

  // Handle city selection
  const handleCityChange = (cityId) => {
    const selectedCity = cities.find(c => c._id === cityId);
    if (selectedCity) {
      handleChange({ target: { name: "city", value: selectedCity.name } });
    }
  };

  // Fetch user details when the component loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${id}`, {
          withCredentials: true,
        });
        const userData = { ...data.user };
        delete userData.password;
        if (userData?.phoneNumber) {
          userData.phoneNumber = userData.phoneNumber.replace(/^94/g, '0');
        }

        // Ensure arrays are properly initialized
        userData.role = Array.isArray(userData.role) ? userData.role : [];
        userData.vehicles = Array.isArray(userData.vehicles) ? userData.vehicles : [];
        userData.accountDetails = Array.isArray(userData.accountDetails) ? userData.accountDetails : [];

        setFormData(userData);
        setRoleFields(userData.role);
        setVehicleFields(userData.vehicles);
        setAccountFields(userData.accountDetails);
      } catch (error) {
        console.error("Error fetching user:", error.message);
        toast.error("Failed to load user details.");
      }
    };

    fetchUser();
  }, [id]);

  // Load location data when provinces are loaded and user data is available
  useEffect(() => {
    const loadLocationData = async () => {
      if (provinces.length > 0 && formData.province) {
        const provinceObj = provinces.find(p => p.name === formData.province);
        if (provinceObj) {
          await handleProvinceChange(provinceObj._id);
        }
      }
    };

    loadLocationData();
  }, [provinces, formData.province]);

  // Load district data when districts are loaded and user data is available
  useEffect(() => {
    const loadDistrictData = async () => {
      if (districts.length > 0 && formData.district) {
        const districtObj = districts.find(d => d.name === formData.district);
        if (districtObj) {
          await handleDistrictChange(districtObj._id);
        }
      }
    };

    loadDistrictData();
  }, [districts, formData.district]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDefaultVehicleChange = (index) => {
    const updatedVehicles = vehicleFields.map((vehicle, i) => ({
      ...vehicle,
      isDefault: i === index
    }));
    setVehicleFields(updatedVehicles);
    setFormData(prev => ({ ...prev, vehicles: updatedVehicles }));
  };

  const handleDefaultAccountChange = (index) => {
    const updatedAccounts = accountFields.map((account, i) => ({
      ...account,
      isDefault: i === index
    }));
    setAccountFields(updatedAccounts);
    setFormData(prev => ({ ...prev, accountDetails: updatedAccounts }));
  };

  // Add/Remove functions for dynamic arrays
  const addRole = () => {
    setRoleFields(prev => [...prev, ""]);
    setFormData(prev => ({
      ...prev,
      role: Array.isArray(prev.role) ? [...prev.role, ""] : [""]
    }));
  };

  const removeRole = (index) => {
    setRoleFields(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      role: Array.isArray(prev.role) ? prev.role.filter((_, i) => i !== index) : []
    }));
  };

  const addVehicle = () => {
    const newVehicle = { vehicleNumber: "", isDefault: false };
    setVehicleFields(prev => [...prev, newVehicle]);
    setFormData(prev => ({
      ...prev,
      vehicles: Array.isArray(prev.vehicles) ? [...prev.vehicles, newVehicle] : [newVehicle]
    }));
  };

  const removeVehicle = (index) => {
    setVehicleFields(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      vehicles: Array.isArray(prev.vehicles) ? prev.vehicles.filter((_, i) => i !== index) : []
    }));
  };

  const addAccount = () => {
    const newAccount = {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      branchName: "",
      isDefault: false
    };
    setAccountFields(prev => [...prev, newAccount]);
    setFormData(prev => ({
      ...prev,
      accountDetails: Array.isArray(prev.accountDetails) ? [...prev.accountDetails, newAccount] : [newAccount]
    }));
  };

  const removeAccount = (index) => {
    setAccountFields(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      accountDetails: Array.isArray(prev.accountDetails) ? prev.accountDetails.filter((_, i) => i !== index) : []
    }));
  };

  // Handle dynamic field changes
  const handleRoleChange = (index, value) => {
    const updatedRoles = Array.isArray(formData.role) ? [...formData.role] : [];
    updatedRoles[index] = value;
    setFormData(prev => ({ ...prev, role: updatedRoles }));
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = Array.isArray(formData.vehicles) ? [...formData.vehicles] : [];
    if (updatedVehicles[index]) {
      updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, vehicles: updatedVehicles }));
  };

  const handleAccountChange = (index, field, value) => {
    const updatedAccounts = Array.isArray(formData.accountDetails) ? [...formData.accountDetails] : [];
    if (updatedAccounts[index]) {
      updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, accountDetails: updatedAccounts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    formData.role = formData.role.map(role => roles.find(r => r.name === role)?._id)
    formData.province = provinces.find(province => province.name === formData.province)?._id;
    formData.district = districts.find(district => district.name === formData.district)?._id;
    formData.city = cities.find(city => city.name === formData.city)?._id;
    try {
      

      const dataToSend = { _id: formData._id, ...formData };

     
      const formDataToSend = new FormData();

      Object.keys(dataToSend).forEach(key => {
        const value = dataToSend[key];
      
        if (value instanceof File) {
          formDataToSend.append(key, value); // single file
        } else if (Array.isArray(value)) {
          if (value[0] instanceof File) {
            value.forEach(file => formDataToSend.append(key, file)); // multiple files
          } else {
            formDataToSend.append(key, JSON.stringify(value)); // object/primitive array
          }
        } else if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value)); // object
        } else {
          formDataToSend.append(key, value); // string, number, etc.
        }
      });
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/update/${id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      toast.success("User updated successfully!");
      setTimeout(() => navigate("/user"), 3000);
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
      if (error.response?.data) {
        const { message, error: errorDetail } = error.response.data;
        if (message?.toLowerCase().includes("duplicate")) {
          toast.error(errorDetail);
        } else {
          toast.error(message || "Error updating user. Please try again.");
        }
      } else {
        toast.error("Error updating user. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/user" className="flex items-center text-white hover:text-gray-100 transition duration-150">
              <FaArrowLeft className="mr-2" />
              <span>Back to User List</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Update Customer</h1>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Main Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? 'border-red-300' : 'border-gray-200'
                          }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? 'border-red-300' : 'border-gray-200'
                          }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-200'
                        }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">NIC</label>
                      <input
                        type="text"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        placeholder="NIC number"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent ${errors.nic ? 'border-red-300' : 'border-gray-200'
                          }`}
                      />
                      {errors.nic && (
                        <p className="mt-1 text-xs text-red-500">{errors.nic}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="07XXXXXXXXX"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent ${errors.phoneNumber ? 'border-red-300' : 'border-gray-200'
                          }`}
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    name="line1"
                    value={formData.line1}
                    onChange={handleChange}
                    placeholder="Address line 1"
                    className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent ${errors.line1 ? 'border-red-300' : 'border-gray-200'
                      }`}
                  />
                  {errors.line1 && (
                    <p className="mt-1 text-xs text-red-500">{errors.line1}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="line2"
                    value={formData.line2}
                    onChange={handleChange}
                    placeholder="Address line 2 (optional)"
                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Province *</label>
                  <input type="hidden" name="province" value={formData.province} />
                  <select
                    value={provinces.find(p => p.name === formData.province)?._id || ""}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent ${errors.province ? 'border-red-300' : 'border-gray-200'
                      }`}
                    disabled={loading}
                  >
                    <option value="">{loading ? 'Loading provinces...' : 'Select Province'}</option>
                    {provinces.map((province) => (
                      <option key={province._id} value={province._id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="mt-1 text-xs text-red-500">{errors.province}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">District *</label>
                  <input type="hidden" name="district" value={formData.district} />
                  <select
                    value={districts.find(d => d.name === formData.district)?._id || ""}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className={`w-full p-2 text-sm border text-black rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent ${errors.district ? 'border-red-300' : 'border-gray-200'
                      }`}
                    disabled={loading || !formData.province}
                  >
                    <option value="" className="text-black">{loading ? 'Loading districts...' : 'Select District'}</option>
                    {districts.map((district) => (
                      <option key={district._id} value={district._id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="mt-1 text-xs text-red-500">{errors.district}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                  <input type="hidden" name="city" value={formData.city} />
                  <select
                    value={cities.find(c => c.name === formData.city)?._id || ""}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent ${errors.city ? 'border-red-300' : 'border-gray-200'
                      }`}
                    disabled={loading || !formData.district}
                  >
                    <option value="">{loading ? 'Loading cities...' : 'Select City'}</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Zip code"
                    className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent ${errors.zipCode ? 'border-red-300' : 'border-gray-200'
                      }`}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account & Roles Section */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Account & Roles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Profile Image</label>
                  <div className="flex items-center space-x-2">
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-300"
                      />
                    )}
                    <input
                      type="file"
                      name="profileImage"
                      onChange={handleImageUpload}
                      className="flex-1 p-1 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Roles Section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-600">Roles</label>
                  <button
                    type="button"
                    onClick={addRole}
                    className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Role
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-white rounded-md border border-gray-200 p-1">
                      <select
                        value={formData.role[index] || ""}
                        onChange={(e) => handleRoleChange(index, e.target.value)}
                        className="text-xs border-none focus:ring-0 focus:outline-none"
                      >
                        <option value="">Select Role</option>
                        {designationOptions.slice(1).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {roleFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRole(index)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors duration-150"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Sections */}
            <div className="space-y-4">
              {/* Vehicle Information */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Vehicles
                  </h3>
                  <button
                    type="button"
                    onClick={addVehicle}
                    className="inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Vehicle
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vehicleFields.map((field, index) => (
                    <div key={index} className="bg-white p-3 rounded-md border border-orange-200 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Vehicle {index + 1}</span>
                        {vehicleFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVehicle(index)}
                            className="text-red-400 hover:text-red-600 transition-colors duration-150"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.vehicles[index]?.vehicleNumber || ""}
                        onChange={(e) => handleVehicleChange(index, "vehicleNumber", e.target.value)}
                        placeholder="Vehicle number"
                        className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent mb-2"
                      />
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.vehicles[index]?.isDefault}
                          onChange={() => handleDefaultVehicleChange(index)}
                          className="form-radio h-3 w-3 text-orange-600"
                        />
                        <span className="ml-1 text-xs text-gray-600">Default</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Bank Accounts
                  </h3>
                  <button
                    type="button"
                    onClick={addAccount}
                    className="inline-flex items-center px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Account
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accountFields.map((field, index) => (
                    <div key={index} className="bg-white p-3 rounded-md border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Account {index + 1}</span>
                        {accountFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAccount(index)}
                            className="text-red-400 hover:text-red-600 transition-colors duration-150"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={formData.accountDetails[index]?.accountHolderName || ""}
                          onChange={(e) => handleAccountChange(index, "accountHolderName", e.target.value)}
                          placeholder="Account holder name"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={formData.accountDetails[index]?.accountNumber || ""}
                          onChange={(e) => handleAccountChange(index, "accountNumber", e.target.value)}
                          placeholder="Account number"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={formData.accountDetails[index]?.bankName || ""}
                          onChange={(e) => handleAccountChange(index, "bankName", e.target.value)}
                          placeholder="Bank name"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={formData.accountDetails[index]?.branchName || ""}
                          onChange={(e) => handleAccountChange(index, "branchName", e.target.value)}
                          placeholder="Branch name"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.accountDetails[index]?.isDefault}
                            onChange={() => handleDefaultAccountChange(index)}
                            className="form-radio h-3 w-3 text-emerald-600"
                          />
                          <span className="ml-1 text-xs text-gray-600">Default</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transform transition-all duration-150 hover:scale-105 font-medium"
              >
                Update Customer
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UpdateCustomer;

