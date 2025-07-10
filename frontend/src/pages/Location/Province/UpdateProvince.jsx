import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { statusOptions } from "../../../utils/DropdownOptions";


const UpdateProvince = () => {
 
  const location = useLocation();
  const { Province,status } = location.state || {};
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: Province?.name || "",
    isActive: Province?.isActive || statusOptions[0]["value"],
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
      if (!formData[property]) {
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
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/province/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Parent Shop updated successfully!");
      setTimeout(() => navigate("/province",{
        state: {status }}), 500);
    } catch (error) {
      toast.error("Failed to update Parent Shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Update Province
      </h1>
      <Link
        to="/Province"
        state={{ status  }}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" /> Back to Parent Shop List
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Province Name and Owner */}
        <div className="grid grid-cols-1 md:grid-cols-1 px-48">
          <div>
            <label className="block text-gray-700">Province Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              placeholder="Enter parent shop name"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          
        </div>


        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default UpdateProvince;
