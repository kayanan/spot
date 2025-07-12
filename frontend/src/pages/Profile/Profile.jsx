import { useState, useEffect } from 'react';
import {
  FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaEdit, FaCar, FaCreditCard, FaUniversity, FaKey, FaCheckCircle, FaSave, FaTimes, FaPlus, FaTrash, FaArrowLeft
} from 'react-icons/fa';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import myImage from '../../assets/user.png';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser, updateProfile, changePassword } from '../../services/user.service';

// Sri Lankan provinces, districts, and cities data
const sriLankanData = {
  provinces: [
    'Western Province',
    'Central Province',
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ],
  districts: {
    'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
    'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
    'Southern Province': ['Galle', 'Matara', 'Hambantota'],
    'Northern Province': ['Jaffna', 'Kilinochchi', 'Mullaitivu', 'Vavuniya'],
    'Eastern Province': ['Batticaloa', 'Ampara', 'Trincomalee'],
    'North Western Province': ['Kurunegala', 'Puttalam'],
    'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
    'Uva Province': ['Badulla', 'Monaragala'],
    'Sabaragamuwa Province': ['Ratnapura', 'Kegalle']
  },
  cities: {
    'Colombo': ['Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Colombo 06', 'Colombo 07', 'Colombo 08', 'Colombo 09', 'Colombo 10', 'Colombo 11', 'Colombo 12', 'Colombo 13', 'Colombo 14', 'Colombo 15'],
    'Gampaha': ['Gampaha', 'Negombo', 'Kelaniya', 'Wattala', 'Ja-Ela', 'Divulapitiya', 'Mirigama', 'Minuwangoda', 'Attanagalla', 'Dompe', 'Mahara', 'Biyagama'],
    'Kalutara': ['Kalutara', 'Panadura', 'Bandaragama', 'Horana', 'Bulathsinhala', 'Mathugama', 'Beruwala', 'Aluthgama', 'Millaniya', 'Madurawela', 'Walallawita', 'Palindanuwara', 'Agalawatta'],
    'Kandy': ['Kandy', 'Peradeniya', 'Gampola', 'Katugastota', 'Kundasale', 'Harispattuwa', 'Patha Dumbara', 'Uda Dumbara', 'Teldeniya', 'Udunuwara', 'Yatinuwara', 'Thumpane', 'Panvila', 'Minipe', 'Hatharaliyadda', 'Galagedara', 'Akurana', 'Delthota', 'Medadumbara', 'Poojapitiya', 'Thalathuoya', 'Hewaheta', 'Udapalatha', 'Gangawata Korale', 'Kotmale', 'Nawalapitiya'],
    'Matale': ['Matale', 'Dambulla', 'Galewela', 'Rattota', 'Naula', 'Palapathwela', 'Yatawatta', 'Laggala-Pallegama', 'Wilgamuwa', 'Ukuwela', 'Pallepola', 'Ambanganga Korale', 'Rambukkana', 'Kegalle', 'Warakapola', 'Galigamuwa', 'Yatiyantota', 'Ruwanwella', 'Deraniyagala', 'Mawanella', 'Aranayaka', 'Bulathkohupitiya', 'Dehiowita', 'Karawanella'],
    'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Lindula', 'Kotagala', 'Maskeliya', 'Norwood', 'Ambagamuwa', 'Walapane', 'Hanguranketha', 'Kothmale', 'Ragala', 'Welimada', 'Udupussellawa', 'Madulla', 'Bogawantalawa', 'Dayagama Bazaar', 'Watawala', 'Rozella', 'Ginigathhena', 'Nawalapitiya', 'Kotmale', 'Walapane', 'Hanguranketha', 'Kothmale', 'Ragala', 'Welimada', 'Udupussellawa', 'Madulla', 'Bogawantalawa', 'Dayagama Bazaar', 'Watawala', 'Rozella', 'Ginigathhena']
  }
};

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const navigate = useNavigate();
  const { authState } = useAuth();

  // Fallback image for when profile image is not available
  const fallbackImage = 'https://via.placeholder.com/112x112/06b6d4/ffffff?text=User';

  const { register, handleSubmit, control, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      nic: '',
      line1: '',
      line2: '',
      city: '',
      district: '',
      province: '',
      zipCode: '',
      vehicles: [],
      cards: [],
      accountDetails: []
    }
  });

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: 'vehicles',
  });
  const { fields: cardFields, append: appendCard, remove: removeCard } = useFieldArray({
    control,
    name: 'cards',
  });
  const { fields: accountFields, append: appendAccount, remove: removeAccount } = useFieldArray({
    control,
    name: 'accountDetails',
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      
      console.log('Raw user data from API:', userData); // Debug log
      
      // Transform the data to match our form structure
      const transformedUser = {
        firstName: userData.user?.firstName || '',
        lastName: userData.user?.lastName || '',
        email: userData.user?.email || '',
        phoneNumber: userData.user?.phoneNumber || '',
        nic: userData.user?.nic || '',
        line1: userData.user?.line1 || '',
        line2: userData.user?.line2 || '',
        city: userData.user?.city || '',
        district: userData.user?.district || '',
        province: userData.user?.province || '',
        zipCode: userData.user?.zipCode || '',
        vehicles: userData.user?.vehicle || [],
        cards: userData.user?.cards || [],
        accountDetails: userData.user?.accountDetails || []
      };

      console.log('Transformed user data:', transformedUser); // Debug log

      setUser(transformedUser);
      setSelectedProvince(transformedUser.province);
      setSelectedDistrict(transformedUser.district);
      reset(transformedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    reset(user);
  };

  const handleCancel = () => {
    setEditMode(false);
    reset(user);
    setPreviewImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('profileImage', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict('');
    setValue('province', province);
    setValue('district', '');
    setValue('city', '');
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setValue('district', district);
    setValue('city', '');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      e.target.reset();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password. Please check your current password.';
      toast.error(errorMessage);
      console.log('Password change error:', error.response?.data || error);
    }
  };

  const handleAddVehicle = () => {
    appendVehicle({ vehicleNumber: '', isDefault: false });
  };

  const handleAddCard = () => {
    appendCard({
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      isDefault: false
    });
  };

  const handleAddBank = () => {
    appendAccount({
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      isDefault: false
    });
  };

  const onSubmit = async (data) => {
    try {
      // Transform data to match backend structure
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        nic: data.nic,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        district: data.district,
        province: data.province,
        zipCode: data.zipCode,
        vehicle: data.vehicles, // Backend expects 'vehicle' (singular)
        cards: data.cards,
        accountDetails: data.accountDetails
      };

      console.log('Sending profile data to backend:', profileData); // Debug log

      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
      setUser({ ...user, ...data, profileImage: previewImage || myImage });
      setEditMode(false);
      setPreviewImage(null);
      
      // Reload user data to get updated information
      await loadUserData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      toast.error(errorMessage);
      console.error('Profile update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Failed to load profile</h2>
          <button 
            onClick={loadUserData}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {authState.privilege === "CUSTOMER" && (
        <button 
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center ml-40 mt-4 w-60 h-12" 
          onClick={() => navigate('/dashboard')}
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      )}

      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mt-8 mb-8 transition-all duration-300">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
          <div className="relative">
            <img
              src={previewImage || myImage || fallbackImage}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-cyan-300 object-cover shadow-md"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-700 shadow-lg">
                <input type="file" className="hidden" onChange={handleImageUpload} />
                <FaEdit />
              </label>
            )}
          </div>
          <div className="flex-1">
            {!editMode ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  {user.firstName} {user.lastName}
                  {user.isActive && (
                    <FaCheckCircle className="ml-2 text-green-500" title="Active" />
                  )}
                </h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <FaEnvelope className="mr-2" /> {user.email}
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <FaPhone className="mr-2" /> {user.phoneNumber}
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      {...register('firstName', { required: true })}
                      placeholder="Enter first name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      {...register('lastName', { required: true })}
                      placeholder="Enter last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      {...register('email', { required: true })}
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      {...register('phoneNumber', { required: true })}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC</label>
                  <input
                    type="text"
                    {...register('nic', { required: true })}
                    placeholder="Enter NIC number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                  />
                </div>

                {/* Address Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaMapMarkerAlt className="text-cyan-600 mr-2" /> Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                      <input
                        type="text"
                        {...register('line1', { required: true })}
                        placeholder="Enter address line 1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                      <input
                        type="text"
                        {...register('line2')}
                        placeholder="Enter address line 2 (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                      <select
                        {...register('province', { required: true })}
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                      >
                        <option value="">Select Province</option>
                        {sriLankanData.provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                      <select
                        {...register('district', { required: true })}
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        disabled={!selectedProvince}
                      >
                        <option value="">Select District</option>
                        {selectedProvince && sriLankanData.districts[selectedProvince]?.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        {...register('city', { required: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        disabled={!selectedDistrict}
                      >
                        <option value="">Select City</option>
                        {selectedDistrict && sriLankanData.cities[selectedDistrict]?.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vehicles Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCar className="text-cyan-600 mr-2" /> Vehicles
                  </h3>
                  {vehicleFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                        <input
                          type="text"
                          {...register(`vehicles.${index}.vehicleNumber`, { required: true })}
                          placeholder="Enter vehicle number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(`vehicles.${index}.isDefault`)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Default</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVehicle(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddVehicle}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition duration-150"
                    >
                      <FaPlus className="mr-2" /> Add Vehicle
                    </button>
                  )}
                </div>

                {/* Cards Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCreditCard className="text-cyan-600 mr-2" /> Cards
                  </h3>
                  {cardFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder Name</label>
                        <input
                          type="text"
                          {...register(`cards.${index}.cardHolderName`, { required: true })}
                          placeholder="Enter card holder name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          {...register(`cards.${index}.cardNumber`, { required: true })}
                          placeholder="Enter card number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Month</label>
                        <input
                          type="text"
                          {...register(`cards.${index}.expiryMonth`, { required: true })}
                          placeholder="MM"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Year</label>
                        <input
                          type="text"
                          {...register(`cards.${index}.expiryYear`, { required: true })}
                          placeholder="YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(`cards.${index}.isDefault`)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Default</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddCard}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition duration-150"
                    >
                      <FaPlus className="mr-2" /> Add Card
                    </button>
                  )}
                </div>

                {/* Bank Accounts Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUniversity className="text-cyan-600 mr-2" /> Bank Accounts
                  </h3>
                  {accountFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.accountHolderName`, { required: true })}
                          placeholder="Enter account holder name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.accountNumber`, { required: true })}
                          placeholder="Enter account number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.bankName`, { required: true })}
                          placeholder="Enter bank name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                        <input
                          type="text"
                          {...register(`accountDetails.${index}.branchName`, { required: true })}
                          placeholder="Enter branch name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(`accountDetails.${index}.isDefault`)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Default</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAccount(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddBank}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-600 transition duration-150"
                    >
                      <FaPlus className="mr-2" /> Add Bank Account
                    </button>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-cyan-700 transition duration-150 disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg flex items-center hover:bg-gray-400 transition duration-150"
                  >
                    <FaTimes className="mr-2" />Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          {!editMode && (
            <button className="ml-auto bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center" onClick={handleEdit}>
              <FaEdit className="mr-2" /> Edit Profile
            </button>
          )}
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 shadow-sm border border-cyan-100">
            <div className="flex items-center mb-2">
              <FaIdCard className="text-cyan-600 mr-2" />
              <span className="font-medium text-gray-700">NIC</span>
            </div>
            <div className="text-gray-900">{user.nic}</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 shadow-sm border border-cyan-100">
            <div className="flex items-center mb-2">
              <FaMapMarkerAlt className="text-cyan-600 mr-2" />
              <span className="font-medium text-gray-700">Address</span>
            </div>
            <div className="text-gray-900">
              {user.line1}, {user.line2 && `${user.line2},`}<br />
              {user.city}, {user.district}, {user.province}
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCar className="text-cyan-600 mr-2" /> Vehicles
            </h3>
            {user.vehicles && user.vehicles.length > 0 ? (
              user.vehicles.map((v, idx) => (
                <div key={idx} className={`px-4 py-2 rounded-lg border ${v.isDefault ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-medium">{v.vehicleNumber}</span>
                  {v.isDefault && <span className="ml-2 text-xs text-green-600">(Default)</span>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No vehicles added yet.</p>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCreditCard className="text-cyan-600 mr-2" /> Card Details
            </h3>
            {user.cards && user.cards.length > 0 ? (
              user.cards.map((c, idx) => (
                <div key={idx} className={`px-4 py-2 rounded-lg border ${c.isDefault ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-medium">**** **** **** {c.cardNumber.slice(-4)}</span> - {c.cardHolderName} (Exp: {c.expiryMonth}/{c.expiryYear})
                  {c.isDefault && <span className="ml-2 text-xs text-blue-600">(Default)</span>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No cards added yet.</p>
            )}
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUniversity className="text-cyan-600 mr-2" /> Bank Accounts
            </h3>
            {user.accountDetails && user.accountDetails.length > 0 ? (
              user.accountDetails.map((a, idx) => (
                <div key={idx} className={`px-4 py-2 rounded-lg border ${a.isDefault ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-medium">{a.accountNumber}</span> - {a.bankName} ({a.branchName})
                  {a.isDefault && <span className="ml-2 text-xs text-purple-600">(Default)</span>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No bank accounts added yet.</p>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="mb-8">
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-yellow-600"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <FaKey className="mr-2" /> Change Password
          </button>
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition duration-150">
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Profile;