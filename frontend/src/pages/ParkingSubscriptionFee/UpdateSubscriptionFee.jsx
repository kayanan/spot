import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateSubscriptionFee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [formData, setFormData] = useState({
    vehicleType: "",
    startDate: "",
    endDate: "",
    below100: "",
    between100and300: "",
    between300and500: "",
    above500: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicleTypes();
    fetchSubscriptionFee();
  }, [id]);

  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/vehicle/types`,
        { withCredentials: true }
      );
      setVehicleTypes(response.data.vehicleTypes || []);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      toast.error("Failed to fetch vehicle types");
    }
  };

  const fetchSubscriptionFee = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/parking-subscription-fee/${id}`,
        { withCredentials: true }
      );
      const fee = response.data;
      setFormData({
        vehicleType: fee.vehicleType,
        startDate: fee.startDate.split('T')[0],
        endDate: fee.endDate.split('T')[0],
        below100: fee.below100.toString(),
        between100and300: fee.between100and300.toString(),
        between300and500: fee.between300and500.toString(),
        above500: fee.above500.toString(),
      });
    } catch (error) {
      console.error("Error fetching subscription fee:", error);
      toast.error("Failed to fetch subscription fee details");
      navigate("/parking-subscription-fee");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.below100) newErrors.below100 = "Fee for below 100 is required";
    if (!formData.between100and300) newErrors.between100and300 = "Fee for 100-300 is required";
    if (!formData.between300and500) newErrors.between300and500 = "Fee for 300-500 is required";
    if (!formData.above500) newErrors.above500 = "Fee for above 500 is required";

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
        console.log(formData);
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/parking-subscription-fee/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Subscription fee updated successfully!");
      setTimeout(() => navigate("/parking-subscription-fee"), 1500);
    } catch (error) {
      toast.error("Error updating subscription fee. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Update Subscription Fee
      </h1>
      <Link
        to="/parking-subscription-fee"
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" /> Back to Subscription Fees
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Type Selection */}
        <div>
          <label className="block text-gray-700 mb-2">Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.vehicleType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Vehicle Type</option>
            {vehicleTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.vehicleType.toUpperCase()}
              </option>
            ))}
          </select>
          {errors.vehicleType && (
            <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.startDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Fee Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Below 100</label>
            <input
              type="number"
              name="below100"
              value={formData.below100}
              onChange={handleChange}
              placeholder="Enter fee for below 100"
              className={`w-full p-2 border rounded ${
                errors.below100 ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.below100 && (
              <p className="text-red-500 text-sm mt-1">{errors.below100}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Between 101-300</label>
            <input
              type="number"
              name="between100and300"
              value={formData.between100and300}
              onChange={handleChange}
              placeholder="Enter fee for 100-300"
              className={`w-full p-2 border rounded ${
                errors.between100and300 ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.between100and300 && (
              <p className="text-red-500 text-sm mt-1">{errors.between100and300}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Between 301-500</label>
            <input
              type="number"
              name="between300and500"
              value={formData.between300and500}
              onChange={handleChange}
              placeholder="Enter fee for 300-500"
              className={`w-full p-2 border rounded ${
                errors.between300and500 ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.between300and500 && (
              <p className="text-red-500 text-sm mt-1">{errors.between300and500}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Above 501</label>
            <input
              type="number"
              name="above500"
              value={formData.above500}
              onChange={handleChange}
              placeholder="Enter fee for above 500"
              className={`w-full p-2 border rounded ${
                errors.above500 ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.above500 && (
              <p className="text-red-500 text-sm mt-1">{errors.above500}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition duration-300"
          >
            Update Subscription Fee
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default UpdateSubscriptionFee;
