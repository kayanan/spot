import React, { useState } from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaEdit, FaCar, FaCreditCard, FaUniversity, FaKey, FaCheckCircle, FaSave, FaTimes, FaPlus, FaTrash, FaArrowLeft
} from 'react-icons/fa';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import myImage from '../../assets/user.png';  // adjust the path as needed
import { useAuth } from '../../context/AuthContext';


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

const mockUser = {
  firstName: 'Kayanan',
  lastName: 'Srikumaran',
  email: 'kayanann@gmail.com',
  phoneNumber: '+94 71 234 5678',
  nic: '1962501761V',
  profileImage: myImage,
  isActive: true,
  approvalStatus: true,
  address: {
    line1: 'No. 12, Potpathy road',
    line2: '',
    city: 'Jaffna',
    district: 'Jaffna',
    province: 'Northern Province'
  },
  vehicles: [
    { vehicleNumber: 'CAG-1234', isDefault: true },
    { vehicleNumber: 'WP-4567', isDefault: false }
  ],
  cardDetails: [
    {
      nameOnCard: 'Kayanan Srikumaran',
      cardNumber: '**** **** **** 1234',
      expiryDate: '08/27',
      isDefault: true
    }
  ],
  accountDetails: [
    {
      accountHolderName: 'Kayanan Srikumaran',
      accountNumber: '1234567890',
      bankName: 'Commercial Bank',
      branchName: 'Colombo 07',
      isDefault: true
    }
  ]
};

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [profileImage, setProfileImage] = useState(mockUser.profileImage);
  const [previewImage, setPreviewImage] = useState(null);
  const [user, setUser] = useState(mockUser);
  const [selectedProvince, setSelectedProvince] = useState(user.address.province);
  const [selectedDistrict, setSelectedDistrict] = useState(user.address.district);
  const navigate = useNavigate();
  const { authState } = useAuth();

  // Fallback image for when profile image is not available
  const fallbackImage = 'https://via.placeholder.com/112x112/06b6d4/ffffff?text=User';

  const { register, handleSubmit, control, reset, setValue, getValues, formState: { errors, isSubmitting } } = useForm({
    defaultValues: user
  });

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: 'vehicles',
  });
  const { fields: cardFields, append: appendCard, remove: removeCard } = useFieldArray({
    control,
    name: 'cardDetails',
  });
  const { fields: accountFields, append: appendAccount, remove: removeAccount } = useFieldArray({
    control,
    name: 'accountDetails',
  });

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
    setValue('address.province', province);
    setValue('address.district', '');
    setValue('address.city', '');
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setValue('address.district', district);
    setValue('address.city', '');
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
      await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/change-password`, {
        currentPassword,
        newPassword
      }, { withCredentials: true });
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      e.target.reset();
    } catch (error) {
      // Extract the actual error message from the backend response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password. Please check your current password.';
      toast.error(errorMessage);
      console.log('Password change error:', error.response?.data || error);
    }
  };

  const handleAddVehicle = () => {
    appendVehicle({ vehicleNumber: '', isDefault: false });
    setShowVehicleForm(true);
  };

  const handleAddCard = () => {
    appendCard({
      nameOnCard: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      isDefault: false
    });
    setShowCardForm(true);
  };

  const handleAddBank = () => {
    appendAccount({
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      isDefault: false
    });
    setShowBankForm(true);
  };


  const onSubmit = async (data) => {
    try {
      // Prepare form data for file upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'profileImage' && value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      // Replace with your actual API endpoint
      await axios.patch('/api/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      toast.success('Profile updated successfully!');
      setUser({ ...user, ...data, profileImage: previewImage || profileImage });
      setEditMode(false);
      setPreviewImage(null);
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div>
      {authState.privilege === "CUSTOMER" && (<button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center ml-40 mt-4 w-60 h-12" onClick={() => {
        navigate('/dashboard');
      }}>
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </button>)}

      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mt-8 mb-8 transition-all duration-300">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
          <div className="relative">
            <img
              src={previewImage || profileImage || fallbackImage}
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
                        {...register('address.line1', { required: true })}
                        placeholder="Enter address line 1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                      <input
                        type="text"
                        {...register('address.line2')}
                        placeholder="Enter address line 2 (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                      <select
                        {...register('address.province', { required: true })}
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
                        {...register('address.district', { required: true })}
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
                        {...register('address.city', { required: true })}
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

                <div className="flex gap-3 mt-4">
                  <button type="submit" className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-cyan-700 transition duration-150">
                    <FaSave className="mr-2" />Save Changes
                  </button>
                  <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg flex items-center hover:bg-gray-400 transition duration-150">
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
              {user.address.line1}, {user.address.line2},<br />
              {user.address.city}, {user.address.district}, {user.address.province}
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCar className="text-cyan-600 mr-2" /> Vehicles
            </h3>
            <button
              onClick={handleAddVehicle}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition duration-150"
            >
              <FaPlus className="mr-2" /> Add Vehicle
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.vehicles.map((v, idx) => (
              <div key={idx} className={`px-4 py-2 rounded-lg border ${v.isDefault ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <span className="font-medium">{v.vehicleNumber}</span>
                {v.isDefault && <span className="ml-2 text-xs text-green-600">(Default)</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Card Details */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCreditCard className="text-cyan-600 mr-2" /> Card Details
            </h3>
            <button
              onClick={handleAddCard}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition duration-150"
            >
              <FaPlus className="mr-2" /> Add Card
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.cardDetails.map((c, idx) => (
              <div key={idx} className={`px-4 py-2 rounded-lg border ${c.isDefault ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                <span className="font-medium">{c.cardNumber}</span> - {c.nameOnCard} (Exp: {c.expiryDate})
                {c.isDefault && <span className="ml-2 text-xs text-blue-600">(Default)</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUniversity className="text-cyan-600 mr-2" /> Bank Accounts
            </h3>
            <button
              onClick={handleAddBank}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-600 transition duration-150"
            >
              <FaPlus className="mr-2" /> Add Bank Account
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.accountDetails.map((a, idx) => (
              <div key={idx} className={`px-4 py-2 rounded-lg border ${a.isDefault ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                <span className="font-medium">{a.accountNumber}</span> - {a.bankName} ({a.branchName})
                {a.isDefault && <span className="ml-2 text-xs text-purple-600">(Default)</span>}
              </div>
            ))}
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
    </div>);
};

export default Profile;