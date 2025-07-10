import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { statusOptions } from "../../../utils/DropdownOptions";
import DropdownInner from "../../../utils/DropdownInner";


const UpdateRole = () => {
 
  const location = useLocation();
  const { Role } = location.state || {};
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    type: Role?.type || "",
    description: Role?.description || "",
    isActive: Role?.isActive ?? statusOptions[0]["value"],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (field) => {
    let errorMessage = "";
    if (!formData[field]) {
      errorMessage = "Required!";
    }
    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Remove empty fields
    for (const property in formData) {
      if (!formData[property] && !(formData[property] === false)) {
        delete formData[property];
      }
    }

    if (Object.values(errors).some((error) => error)) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
    
      await axios.put(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/roles/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Role updated successfully!");
      setTimeout(() => navigate("/role",{
        state: {status }}), 500);
    } catch (error) {
      toast.error("Failed to update Role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Update Role
      </h1>
      <Link
        to="/role"
      state={{ status  }}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" /> Back to Role List
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-1">Role Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              onBlur={() => handleBlur("type")}
              placeholder="Enter role type"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.type ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
          {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>
          <div>
          <DropdownInner
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Role"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default UpdateRole;
