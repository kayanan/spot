// src/pages/User/AddUser.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateEmail,
  validateMobile,
  validateNIC,
} from "../../../utils/validations";
import zxcvbn from "zxcvbn"; // For password strength analysis
import DropdownInner from "../../../utils/DropdownInner";
import { designationOptions } from "../../../utils/DropdownOptions";

const AddCustomer = () => {
  const navigate = useNavigate(); // For programmatic navigation
  // Form data state to manage user input
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
    role: "PARKING_OWNER",
    branchId: "",
    privilegeList: [],
    profileImage: null,
    status: "active",
  });
  const [errors, setErrors] = useState({}); // Error state for field validation
  const [branches, setBranches] = useState([]); // List of active branches
  const [previewImage, setPreviewImage] = useState(null); // Profile image preview
  const [showPassword, setShowPassword] = useState(true); // Toggle password visibility
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/branch`,
          {
            withCredentials: true, // Include cookies
          }
        );
        const activeBranches = data.branches.filter(
          (branch) => branch.status === "active"
        );
        setBranches(activeBranches);
      } catch (error) {
        console.error("Error fetching branches:", error.message);
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      const strength = zxcvbn(value).score; // Calculate password strength
      setPasswordStrength(strength);
    }

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const passwordStrengthLabel = (score) => {
    switch (score) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const passwordStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "bg-red-500";
      case 1:
        return "bg-orange-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "";
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setPreviewImage(URL.createObjectURL(file));
      console.log(URL.createObjectURL(file));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBlur = (field) => {
    let errorMessage = "";
    const trimmedValue = formData[field]?.trim();

    // Check if the field is empty
    if (!trimmedValue) {
      errorMessage = "Required!";
    } else {
      // Additional format validations
      switch (field) {
        case "email":
          if (!validateEmail(trimmedValue))
            errorMessage = "Invalid! (Recheck Your Email Format.)";
          break;
        case "mobile":
          if (!validateMobile(trimmedValue))
            errorMessage = "Invalid! (It Must be 10 Digits Starting with 0.)";
          break;
        case "nic":
          if (!validateNIC(trimmedValue))
            errorMessage = "Invalid! (Recheck Your NIC Format.)";
          break;
        case "confirmPassword":
          if (formData.password.trim() !== trimmedValue)
            errorMessage = "not Match.";
          break;
        default:
          break;
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: errorMessage }));
    setFormData((prevFormData) => ({ ...prevFormData, [field]: trimmedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error)) {
      // Trigger Toastify error notification
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

    if (passwordStrength < 3) {
      // Require at least "Good" password
      // Trigger Toastify error notification
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

    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profileImage" && value) {
        formDataToSubmit.append(key, value); // Appending binary file data
      } else {
        formDataToSubmit.append(key, value); // Appending plain text data
      }
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/signup`,
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // Include cookies
        }
      );
      console.log("User added successfully:", response.data);
      // Trigger Toastify success notification
      toast.success("User added successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Navigate after 3 seconds to allow the toast to show
      setTimeout(() => {
        navigate("/user");
      }, 3000);
    } catch (error) {
      console.error(
        "Error adding user:",
        error.response?.data || error.message
      );

      // Check if the server returned a structured error response
      if (error.response && error.response.data) {
        const { message, error: errorDetail } = error.response.data;

        // If we have a "Duplicate" message, show that specifically
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
          // Otherwise, show the server's message or fallback
          toast.error(message || "Error adding user. Please try again.", {
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
        // If there's no structured response, fallback to generic
        toast.error("Error adding user. Please try again.", {
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
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Add New User
      </h1>

      {/* Back Button */}
      <Link
        to="/user"
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" />
        Back to User List
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <DropdownInner
          label={"Select User Type"}
          name={"role"}
          options={designationOptions.slice(1)}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}

        />
        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur("firstName")} // Add onBlur for validation
              placeholder="Enter first name"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.firstName && ( // Show error message if validation fails
              <p className="text-red-500 text-sm">
                First Name is {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur("lastName")} // Add onBlur for validation
              placeholder="Enter last name"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.lastName && ( // Show error message if validation fails
              <p className="text-red-500 text-sm">
                Last Name is {errors.lastName}
              </p>
            )}
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
              onBlur={() => handleBlur("nic")} // Add onBlur for validation
              placeholder="Enter NIC"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.nic ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.nic && (
              <p className="text-red-500 text-sm">NIC is {errors.nic}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={() => handleBlur("mobile")} // Add onBlur for validation
              placeholder="Enter mobile"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm">
                Mobile Number is {errors.mobile}
              </p>
            )}
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
              onBlur={() => handleBlur("email")} // Add onBlur for validation
              placeholder="Enter email"
              required
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">Email is {errors.email}</p>
            )}
          </div>
    
        </div>

        {/* Designation and Username Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        
        </div>

        {/* Password and Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "password" : "text"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="Enter password"
                required
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
                  className={`h-2 rounded ${passwordStrengthColor(
                    passwordStrength
                  )}`}
                  style={{ width: `${(passwordStrength + 1) * 20}%` }}
                ></div>
                <p className="text-sm mt-1">
                  Strength: {passwordStrengthLabel(passwordStrength)}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-sm">
                Password is {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "password" : "text"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")} // Add onBlur for validation
                placeholder="Confirm password"
                required
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
              <p className="text-red-500 text-sm">
                Confirm Password is {errors.confirmPassword}
              </p>
            )}
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
              src={previewImage}
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
            ADD USER
          </button>
        </div>
      </form>
      {/* ToastContainer to display notifications */}
      <ToastContainer />
    </div>
  );
};

export default AddCustomer;
