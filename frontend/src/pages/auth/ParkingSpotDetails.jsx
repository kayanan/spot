import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaCar, FaParking } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapComponent from "../../utils/MapComponent";
import { useAuth } from "../../context/AuthContext";
const ParkingSpotDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [userData, setUserData] = useState(location.state?.userData || {});
  const [ownerId, setOwnerId] = useState(location.state?.ownerId || "");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setErrors] = useState(false);
  const { authState } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    setError,
    watch
  } = useForm(
    {
      defaultValues: {
        contactNumber: location.state?.userData?.phoneNumber || "",
        ownerId: location.state?.ownerId || ""
      }
    }
  );
  const province = watch("province", "");
  const district = watch("district", "");

  useEffect(() => {
    if (!location.state?.userData && !location.state?.ownerId) {
      toast.error("No user data found. Please complete the registration first.");
      navigate("/register");
      return;
    }
    setUserData(location.state.userData || {});
    setOwnerId(location.state.ownerId || "");
  }, [location, navigate]);

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/province/`);
        setProvinces(response.data.provinces);
      } catch (error) {
        toast.error("Failed to load provinces");
      }
    };
    const fetchVehicleTypes = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-subscription-fee/vehicle-types`);
      if (response.data.success) {
        setVehicleTypes(response.data.vehicleTypes || []);
      } else {
        toast.error(response.data.message);
      }
    };
    fetchProvinces();
    fetchVehicleTypes();
  }, []);
  useEffect(() => {
    setValue("latitude", position?.lat);
    setValue("longitude", position?.lng);
  }, [position]);

  // Fetch districts when province is selected
  useEffect(() => {
    if (province) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_APP_URL}/v1/district?provinceId=${province}`
          );
          setDistricts(response.data.districts);
          setValue("district", "");
          setValue("city", "");
        } catch (error) {
          toast.error("Failed to load districts");
        }
      };
      fetchDistricts();
    }
  }, [province, setValue]);

  // Fetch cities when district is selected
  useEffect(() => {
    if (district) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_APP_URL}/v1/city?districtId=${district}`
          );
          setCities(response.data.cities);
          setValue("city", "");
        } catch (error) {
          toast.error("Failed to load cities");
        }
      };
      fetchCities();
    }
  }, [district, setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviewUrls = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviewUrls);
  };
  const checkDuplicateEntry =async(data)=>{
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area/check-duplicate-entry`,
        data,
        { withCredentials: true }
      );
      if(!response.data.status){
        for(const key in response.data.errorMessage){
          setError(key, { message: response.data.errorMessage[key] });
        }
        return true;
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage;
      for (const key in errorMessage) {
        setError(key, { message: errorMessage[key] });
      }
      return true;
    }
  }

  const onSubmit = async (data) => {
    const isDuplicateEntry = await checkDuplicateEntry(data);
    if(isDuplicateEntry){
      return;
    }
    setLoading(true);
    data.slot = data.slot.filter((item) => Number(item.count) > 0);
    if (data.slot.length === 0) {
      setErrors({
        slot: "Please add at least one vehicle type"
      });
      setLoading(false);
      return;
    }
    else {
      setErrors({
        slot: null
      });
    }
   

    try {
      if (!data.ownerId) {
        // First, create the user account
        const userResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/signup`,
          userData,
          { withCredentials: true }
        );
        console.log(userResponse.data, "userResponse.data.user._id");
        data.ownerId = userResponse.data.id;
        setValue("ownerId", userResponse.data.id);
      }


      // Then, create the parking spot
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'images' && key !== 'slot') {
          if (data[key]) {
            formDataToSend.append(key, data[key]);
          }
        }
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      data.slot.forEach(slot => {
        formDataToSend.append('slot', JSON.stringify(slot));
      });

      //Add the user ID to the parking spot data
      Array.from(formDataToSend.entries()).forEach(([key, value]) => {
        console.log(key, value);
      });


      await axios.post(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      toast.success("Registration completed successfully", {
        onClose: () => {
          if (ownerId) {
            navigate(authState.privilege === "ADMIN" ? `/owner/view/${ownerId}` : `/parking-area-home`);
          }
          else {
            navigate("/");
          }
        },
        autoClose: 1000,
      } );

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600">
      <div className="m-auto w-full max-w-2xl p-4 sm:p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-center mb-2 space-x-4">
              <FaParking className="h-10 w-10 text-cyan-600" />
              <FaCar className="h-8 w-8 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-cyan-700">
              Find My Spot
            </h2>
            <h2 className="text-2xl font-bold text-center text-cyan-700 mb-2">
              Parking Spot Details
            </h2>
            <p className="text-center text-gray-500">
              Complete your parking spot information
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Parking Spot Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spot Name</label>
              <input
                type="text"
                {...register("name", { required: "Parking spot name is required" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter parking spot name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>


            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                {...register("addressLine1", { required: "Address line 1 is required" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter address line 1"
              />
              {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                {...register("addressLine2")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter address line 2"
              />
            </div>

            {/* Location Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  {...register("province", { required: "Province is required" })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province._id} value={province._id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                  {...register("district", { required: "District is required" })}
                  disabled={!province}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  {...register("city", { required: "City is required" })}
                  disabled={!district}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code (Optional)</label>
              <input
                type="text"
                {...register("zipCode")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter zip code"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number For The Parking Spot</label>
              <input
                type="tel"
                {...register("contactNumber", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^0[0-8][0-9]{8}$/,
                    message: "Please enter a valid 10-digit mobile number"
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Eg: 0712345678"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
            </div>

            {/* Coordinates */}
            <MapComponent setPosition={setPosition} position={position} zoom={15} width="100%" height="300px" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  {...register("latitude", {
                    required: "Latitude is required",
                    valueAsNumber: true
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter latitude"
                  value={Number(position?.lat) || 0}
                  disabled={true}
                />
                {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  {...register("longitude", {
                    required: "Longitude is required",
                    valueAsNumber: true
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter longitude"
                  value={Number(position?.lng) || 0}
                  disabled={true}
                />
                {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>}
              </div>
            </div>

            {/* Vehicle Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Types</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {vehicleTypes.map((type, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{type.vehicleType.toUpperCase()}</label>
                    <input
                      type="number"
                      {...register(`slot.${index}.count`)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter Count"
                      defaultValue={0}
                      onChange={(e) => {
                        if (!getValues(`slot.${index}.type`)) {
                          setValue(`slot.${index}.type`, type._id);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
              {error.slot && <p className="text-red-500 text-sm mt-1">{error.slot}</p>}
            </div>



            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking Spot Images (Max 5)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all duration-200"
            >
              {loading || isSubmitting ? "Completing Registration..." : "Complete Registration"}
            </button>
            <div className="flex justify-between">
              {/* Back Button */}
              { !ownerId && <button
                type="button"
                onClick={() => navigate("/customer/register", { state: { userData: userData, signupAs: "PARKING_OWNER" } })}
                className="w-full p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all duration-200 mx-2"
              >
                Back
              </button>}
              {/* Add Another Parking Spot Button */}
              
              {ownerId && <button
                type="button"
                onClick={() => navigate(authState.privilege === "ADMIN" ? `/owner/view/${ownerId}` : `/parking-area-home`)}
                className="w-full p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all duration-200 mx-2"
              >
                Cancel
              </button>}

            </div>

          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ParkingSpotDetails; 