import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { statusOptions } from "../../utils/DropdownOptions";

const AddSubscriptionFee = () => {
  const location = useLocation();
  const { status } = location.state || {};
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    vehicleType: "",
    startDate: "",
    below100: "",
    between100and300: "",
    between300and500: "",
    above500: "",
    isActive: statusOptions[0]["value"],
  });

  const [errors, setErrors] = useState({});
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [newVehicleType, setNewVehicleType] = useState("");
  const [isAddingVehicleType, setIsAddingVehicleType] = useState(false);
  useEffect(() => {
    fetchVehicleTypes();
    setIsAddingVehicleType(false);
  }, [isAddingVehicleType]);

  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/vehicle/types`,
        { withCredentials: true }
      );
      setVehicleTypes(response.data.vehicleTypes || []);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
    }
  };

  const handleAddVehicleType = async () => {
    if (!newVehicleType.trim()) {
      toast.error("Please enter a vehicle type");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/vehicle`,
        { vehicleType: newVehicleType ,createdBy:"67e181934a9cbf098c16da67"},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Vehicle type added successfully!");
      setNewVehicleType("");
      setIsAddingVehicleType(true);
      fetchVehicleTypes(); // Refresh the list
    } catch (error) {
      toast.error(error.response.data.message || "Error adding vehicle type. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicleType) newErrors.vehicleType = "Required!";
    if (!formData.startDate) newErrors.startDate = "Required!";
    if (!formData.endDate) newErrors.endDate = "Required!";
    if (!formData.below100) newErrors.below100 = "Required!";
    if (!formData.between100and300) newErrors.between100and300 = "Required!";
    if (!formData.between300and500) newErrors.between300and500 = "Required!";
    if (!formData.above500) newErrors.above500 = "Required!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
        formData.createdBy = "67e181934a9cbf098c16da67";
        
      await axios.post(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/parking-subscription-fee`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success("Parking Subscription Fee added successfully!");
      setTimeout(() => navigate("/parking-subscription-fee"), 300);
    } catch (error) {
      toast.error(error.response.data.message || "Error adding Parking Subscription Fee. Please try again.");
    }
  };

  return (
    <div className="p-6 my-2 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-500 mb-6 text-center">
        Add New Parking Subscription Fee
      </h1>
      <Link
        to="/parking-subscription-fee"
        state={{ status }}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" /> Back to Parking Subscription Fee List
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Type Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Vehicle Type</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={newVehicleType}
              onChange={(e) => setNewVehicleType(e.target.value.toLowerCase())}
              placeholder="Enter new vehicle type"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleAddVehicleType}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                 e.preventDefault();
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Vehicle Type
            </button>
          </div>
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
            <p className="text-red-500 text-sm">{errors.vehicleType}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Start Date</label>
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
              <p className="text-red-500 text-sm">{errors.startDate}</p>
            )}
          </div>
          {/* <div>
            <label className="block text-gray-700">End Date</label>
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
              <p className="text-red-500 text-sm">{errors.endDate}</p>
            )}
          </div> */}
        </div>

        {/* Fee Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700">Below 100</label>
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
              <p className="text-red-500 text-sm">{errors.below100}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Between 101-300</label>
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
              <p className="text-red-500 text-sm">{errors.between100and300}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Between 301-500</label>
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
              <p className="text-red-500 text-sm">{errors.between300and500}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Above 501</label>
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
              <p className="text-red-500 text-sm">{errors.above500}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition duration-300"
          >
            ADD PARKING SUBSCRIPTION FEE
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddSubscriptionFee;
