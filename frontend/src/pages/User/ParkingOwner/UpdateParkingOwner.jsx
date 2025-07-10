// src/pages/User/ParkingOwner/UpdateParkingOwner.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateEmail, validateMobile, validateNIC } from "../../../utils/validations";
import zxcvbn from "zxcvbn"; // For password strength analysis

const UpdateParkingOwner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { filters } = useLocation().state;
  
  // Form data state to manage parking owner input
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    mobile: "",
    email: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    isActive: true,
    approvalStatus: false,
    role: "PARKING_OWNER"
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Fetch parking owner details when the component loads
  useEffect(() => {
    const fetchParkingOwner = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${id}`,
          { withCredentials: true }
        );
        const ownerData = { ...data.user };
        delete ownerData.password;
        delete ownerData.confirmPassword;
        setFormData(ownerData);

        if (data.user.profileImage) {
          setPreviewImage(data.user.profileImage);
        }
      } catch (error) {
        console.error("Error fetching parking owner:", error.message);
        toast.error("Failed to load parking owner details.");
      }
    };

    fetchParkingOwner();
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      const strength = zxcvbn(value).score;
      setPasswordStrength(strength);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const passwordStrengthLabel = (score) => {
    switch (score) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  const passwordStrengthColor = (score) => {
    switch (score) {
      case 0: return "bg-red-500";
      case 1: return "bg-orange-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "";
    }
  };

  // Handle profile image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle field-level validation on blur
  const handleBlur = (field) => {
    let errorMessage = "";
    const trimmedValue = formData[field]?.trim();
    
    if (!trimmedValue && field !== "password" && field !== "confirmPassword") {
      errorMessage = "Required!";
    } else {
      switch (field) {
        case "email":
          if (!validateEmail(trimmedValue)) errorMessage = "Invalid! (Recheck Your Email Format.)";
          break;
        case "mobile":
          if (!validateMobile(trimmedValue)) errorMessage = "Invalid! (It Must be 10 Digits Starting with 0.)";
          break;
        case "nic":
          if (!validateNIC(trimmedValue)) errorMessage = "Invalid! (Recheck Your NIC Format.)";
          break;
        case "confirmPassword":
          if (formData.password !== trimmedValue) errorMessage = "not Match!";
          break;
        default:
          break;
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, [field]: errorMessage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for validation errors
    if (Object.values(errors).some((error) => error)) {
      toast.error("Please fix validation errors before submitting.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (formData.password && passwordStrength < 3) {
      toast.error("Password strength must be at least 'Good'.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    // Prepare form data
    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        formDataToSubmit.append(key, value instanceof File ? value : value.toString());
      }
    });

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/${id}`,
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("Parking owner updated successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => navigate("/parking-owner"), 3000);
    } catch (error) {
      console.error("Error updating parking owner:", error.response?.data || error.message);

      if (error.response && error.response.data) {
        const { message, error: errorDetail } = error.response.data;

        if (message && message.toLowerCase().includes("duplicate")) {
          toast.error(`${errorDetail}`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(message || "Error updating parking owner. Please try again.", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } else {
        toast.error("Error updating parking owner. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">Update Parking Owner</h1>

      {/* Back Button */}
      <Link to="/owner" state={{ filters }} className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600">
        <FaArrowLeft className="mr-2" />
        Back to Parking Owner List
      </Link>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur("firstName")}
              placeholder="Enter first name"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.firstName && <p className="text-red-500 text-sm">First Name is {errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur("lastName")}
              placeholder="Enter last name"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.lastName && <p className="text-red-500 text-sm">Last Name is {errors.lastName}</p>}
          </div>
        </div>

        {/* NIC and Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">NIC</label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              onBlur={() => handleBlur("nic")}
              placeholder="Enter NIC"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.nic ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.nic && <p className="text-red-500 text-sm">NIC is {errors.nic}</p>}
          </div>
          <div>
            <label className="block text-gray-700">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={() => handleBlur("mobile")}
              placeholder="Enter mobile"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.mobile && <p className="text-red-500 text-sm">Mobile is {errors.mobile}</p>}
          </div>
        </div>

        {/* Email and Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              placeholder="Enter email"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.email && <p className="text-red-500 text-sm">Email is {errors.email}</p>}
          </div>
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={() => handleBlur("address")}
              placeholder="Enter address"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.address ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.address && <p className="text-red-500 text-sm">Address is {errors.address}</p>}
          </div>
        </div>

        {/* Username and Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => handleBlur("username")}
              placeholder="Enter username"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.username ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.username && <p className="text-red-500 text-sm">Username is {errors.username}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "password" : "text"}
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="Enter password"
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:ring-cyan-500`}
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="mt-2">
                <div
                  className={`h-2 rounded ${passwordStrengthColor(passwordStrength)}`}
                  style={{ width: `${(passwordStrength + 1) * 20}%` }}
                ></div>
                <p className="text-sm mt-1">
                  Strength: {passwordStrengthLabel(passwordStrength)}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-sm">Password is {errors.password}</p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? "password" : "text"}
              name="confirmPassword"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirm password"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 cursor-pointer"
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">Confirm Password is {errors.confirmPassword}</p>
          )}
        </div>

        {/* Status and Approval */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Status</label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700">Approval Status</label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={true}>Approved</option>
              <option value={false}>Pending</option>
            </select>
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-gray-700">Profile Image</label>
          <input
            type="file"
            name="profileImage"
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {previewImage && (
            <img
              src={
                previewImage.startsWith('blob:')
                  ? previewImage
                  : `${import.meta.env.VITE_BACKEND_URL}${previewImage}`
              }
              alt="Profile Preview"
              className="mt-4 w-24 h-24 rounded-full object-cover mx-auto"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition duration-300"
          >
            Update Parking Owner
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default UpdateParkingOwner;

