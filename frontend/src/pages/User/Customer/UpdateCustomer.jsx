// src/pages/User/UpdateUser.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { designationOptions } from "../../../utils/DropdownOptions";

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nic: z.string().min(1, "NIC is required").regex(/^(\d{9}[V|v])|(\d{4}\s?\d{4}\s?\d{4})$/, "Invalid NIC format"),
  mobile: z.string().min(1, "Mobile number is required").regex(/^07[01245678][0-9]{7}$/, "Invalid mobile number format"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  address: z.string().optional(),
  username: z.string().optional(),
  role: z.array(z.string()).optional(),
  privilegeList: z.array(z.string()).optional(),
  status: z.string().optional(),
  vehicles: z.array(z.object({
    vehicleNumber: z.string().min(1, "Vehicle number is required"),
    isDefault: z.boolean().optional()
  })).optional(),
  cardDetails: z.array(z.object({
    nameOnCard: z.string().optional(),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    isDefault: z.boolean().optional()
  })).optional(),
  accountDetails: z.array(z.object({
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    isDefault: z.boolean().optional()
  })).optional(),
});

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [previewImage, setPreviewImage] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(customerSchema),
  });

  const { fields: roleFields, append: appendRole, remove: removeRole } = useFieldArray({
    control,
    name: "role",
  });

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: "vehicles",
  });

  const { fields: cardFields, append: appendCard, remove: removeCard } = useFieldArray({
    control,
    name: "cardDetails",
  });

  const { fields: accountFields, append: appendAccount, remove: removeAccount } = useFieldArray({
    control,
    name: "accountDetails",
  });

  // Fetch user details when the component loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${id}`, {
          withCredentials: true,
        });
        const userData = { ...data.user };
        delete userData.password;
        if (userData?.mobile) {
          userData.mobile = userData.mobile.replace(/^94/g, '0');
        }
        reset(userData);
      } catch (error) {
        console.error("Error fetching user:", error.message);
        toast.error("Failed to load user details.");
      }
    };

    fetchUser();
  }, [id, reset]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("profileImage", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDefaultVehicleChange = (index) => {
    const currentVehicles = vehicleFields.map((_, i) => ({
      ...control._formValues.vehicles[i],
      isDefault: i === index
    }));
    setValue("vehicles", currentVehicles);
  };

  const handleDefaultCardChange = (index) => {
    const currentCards = cardFields.map((_, i) => ({
      ...control._formValues.cardDetails[i],
      isDefault: i === index
    }));
    setValue("cardDetails", currentCards);
  };

  const handleDefaultAccountChange = (index) => {
    const currentAccounts = accountFields.map((_, i) => ({
      ...control._formValues.accountDetails[i],
      isDefault: i === index
    }));
    setValue("accountDetails", currentAccounts);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    const dataToSend = { _id: getValues()["_id"], ...data };
    
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
        if (dataToSend[key] instanceof File) {
          formData.append(key, dataToSend[key]);
        } else if (Array.isArray(dataToSend[key])) {
          formData.append(key, JSON.stringify(dataToSend[key]));
        } else if (typeof dataToSend[key] === 'object') {
          formData.append(key, JSON.stringify(dataToSend[key]));
        } else {
          formData.append(key, dataToSend[key]);
        }
      }
    });

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/update/${id}`,
        formData,
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
          <form onSubmit={handleSubmit(onSubmit)}>
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
                        {...register("firstName")}
                        placeholder="First name"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        {...register("lastName")}
                        placeholder="Last name"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="Email address"
                      className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
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
                        {...register("nic")}
                        placeholder="NIC number"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                          errors.nic ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.nic && (
                        <p className="mt-1 text-xs text-red-500">{errors.nic.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                      <input
                        type="text"
                        {...register("mobile")}
                        placeholder="07XXXXXXXXX"
                        className={`w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                          errors.mobile ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                    <input
                      type="text"
                      {...register("address")}
                      placeholder="Address"
                      className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    {...register("username")}
                    placeholder="Username"
                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    {...register("status")}
                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                      {...register("profileImage")}
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
                    onClick={() => appendRole("")}
                    className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Role
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-1 bg-white rounded-md border border-gray-200 p-1">
                      <select
                        {...register(`role.${index}`)}
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
                    onClick={() => appendVehicle({ vehicleNumber: "", isDefault: false })}
                    className="inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Vehicle
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vehicleFields.map((field, index) => (
                    <div key={field.id} className="bg-white p-3 rounded-md border border-orange-200 relative">
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
                        {...register(`vehicles.${index}.vehicleNumber`)}
                        placeholder="Vehicle number"
                        className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent mb-2"
                      />
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={control._formValues.vehicles?.[index]?.isDefault}
                          onChange={() => handleDefaultVehicleChange(index)}
                          className="form-radio h-3 w-3 text-orange-600"
                        />
                        <span className="ml-1 text-xs text-gray-600">Default</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Details */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Payment Cards
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendCard({
                      nameOnCard: "",
                      cardNumber: "",
                      expiryDate: "",
                      cvv: "",
                      isDefault: false
                    })}
                    className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Card
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cardFields.map((field, index) => (
                    <div key={field.id} className="bg-white p-3 rounded-md border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Card {index + 1}</span>
                        {cardFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCard(index)}
                            className="text-red-400 hover:text-red-600 transition-colors duration-150"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          {...register(`cardDetails.${index}.nameOnCard`)}
                          placeholder="Name on card"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          {...register(`cardDetails.${index}.cardNumber`)}
                          placeholder="Card number"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            {...register(`cardDetails.${index}.expiryDate`)}
                            placeholder="MM/YY"
                            className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            {...register(`cardDetails.${index}.cvv`)}
                            placeholder="CVV"
                            className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={control._formValues.cardDetails?.[index]?.isDefault}
                            onChange={() => handleDefaultCardChange(index)}
                            className="form-radio h-3 w-3 text-blue-600"
                          />
                          <span className="ml-1 text-xs text-gray-600">Default</span>
                        </label>
                      </div>
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
                    onClick={() => appendAccount({
                      accountHolderName: "",
                      accountNumber: "",
                      bankName: "",
                      branchName: "",
                      isDefault: false
                    })}
                    className="inline-flex items-center px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition duration-150"
                  >
                    <FaPlus className="mr-1" /> Add Account
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accountFields.map((field, index) => (
                    <div key={field.id} className="bg-white p-3 rounded-md border border-emerald-200">
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
                          {...register(`accountDetails.${index}.accountHolderName`)}
                          placeholder="Account holder name"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.accountNumber`)}
                          placeholder="Account number"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.bankName`)}
                          placeholder="Bank name"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.branchName`)}
                          placeholder="Branch name"
                          className="w-full p-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={control._formValues.accountDetails?.[index]?.isDefault}
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
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transform transition-all duration-150 hover:scale-105 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? "Updating..." : "Update Customer"}
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

