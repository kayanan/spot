import { useState } from "react";
import { useNavigate, Link,useLocation } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "../../../utils/DropdownInner";
import { statusOptions } from "../../../utils/DropdownOptions";

const AddDistrict = () => {
   const location = useLocation();
   const { Province ,status} = location.state || {};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    provinceId:Province._id,
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
      await axios.post(`${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/district`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      toast.success("District added successfully!");
      setTimeout(() => navigate(`/province/view/${Province._id}`,{
        state: {Province ,status},
      }), 300);
    } catch (error) {
      toast.error("Error adding District. Please try again.");
    }
  };

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Add New District
      </h1>
      <Link
        to={`/province/view/${Province._id}`}
        state={{ Province ,status }}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" /> Back to District List
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Owner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">District Name</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              placeholder="Enter district name"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-cyan-500`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
          <Dropdown
            label="Status"
            name="status"
            options={statusOptions}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        </div>
          
        </div>

        {/* Status Dropdown */}
        

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition duration-300"
          >
            ADD DISTRICT
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddDistrict;
