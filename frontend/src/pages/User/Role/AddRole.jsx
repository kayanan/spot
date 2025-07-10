// src/pages/User/AddUser.jsx

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "../../../utils/DropdownInner";
import { statusOptions } from "../../../utils/DropdownOptions";

const AddRole = () => {
  const location = useLocation();
  const { status } = location.state || {};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    isActive: true, // Default status value
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleBlur = (field) => {
    let errorMessage = "";
    if (!formData[field]) {
      errorMessage = "Required!";
    }

    setErrors({ ...errors, [field]: errorMessage });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error)) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/roles/`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Role added successfully!");
      setTimeout(() => navigate("/role"), 300);
    } catch (error) {
      toast.error("Error adding Role. Please try again.");
    }
  };

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Add New Role
      </h1>
      <Link
        to="/role"
        state={{ status }}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" /> Back to Role List
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
          <div>
            <label className="block text-gray-700 mb-1">Role Type</label>
            <input
              required
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              
              placeholder="Enter role type (e.g. ADMIN or admin.)"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.type ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>
          {/* Status Dropdown */}
        <div>
          <Dropdown
            label="Status"
            name="isActive"
            options={statusOptions}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        </div>
        </div>

        {/* Description */}
        <div >
          <label className="block text-gray-700 mb-1 ">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter role description"
            rows="3"
            className={`w-full p-2  border rounded focus:outline-none focus:ring-2 ${
              errors.description ? "border-red-500" : "border-gray-300"
            } focus:ring-cyan-500`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition duration-300"
          >
            ADD ROLE
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddRole;
