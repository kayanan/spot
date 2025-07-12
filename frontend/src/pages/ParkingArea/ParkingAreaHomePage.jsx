import { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaMapMarkerAlt, FaCar, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { EyeIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/outline';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../../utils/ConfirmationPopup';

import ParkingAreaList from "../User/ParkingOwner/ParkingArea/ParkingAreaList";

const ParkingAreaHomePage = () => {
    const [parkingAreas, setParkingAreas] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('parking-areas');
    const [selectedParkingArea, setSelectedParkingArea] = useState(null);
    const [roles, setRoles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [parkingOwner, setParkingOwner] = useState(null);
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showselectPrkingAreaModal, setShowselectPrkingAreaModal] = useState(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [showMessage, setShowMessage] = useState(true);
    const [error, setError] = useState({});
    const { authState } = useAuth();
    const navigate = useNavigate();
    // Form states


    const [staffForm, setStaffForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'PARKING_MANAGER',
        parkingAreaId: "",
        nic: ""
    });

    useEffect(() => {
        fetchParkingOwner();
        fetchParkingAreas();
        fetchStaffMembers();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/role`);
            setRoles(response.data.roles || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    }


    const fetchParkingAreas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area/owner/${authState.user.userId}`);
            setParkingAreas(response.data.data || []);
        } catch (error) {
            console.error('Error fetching parking areas:', error);
            toast.error('Failed to fetch parking areas');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffMembers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user?role=PARKING_MANAGER`);
            setStaffMembers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching staff members:', error);
            toast.error('Failed to fetch staff members');
        }
    };

    const fetchParkingOwner = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${authState.user.userId}`);
            setParkingOwner(response.data.user || []);
        } catch (error) {
            console.error('Error fetching parking owner:', error);
        }
    }


    const checkEmailExists = async (email) => {
        setSubmitting(true);
        try {

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/email/${email}`);
            console.log(response.data._id, "response.data");
            if (response.data) {
                setStaffForm({ id: response.data._id, addRole: [roles.find(role => role.type === 'PARKING_MANAGER')?._id] });
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            console.error('Error checking email:', error);
        } finally {
            setSubmitting(false);
        }
    }

    const addStaff = async (e) => {
        e.preventDefault();
        if (await checkEmailExists(email)) {
            setShowselectPrkingAreaModal(true);
            setShowEmailModal(false);

            return;
        }
        else {
            setShowEmailModal(false);
            setShowAddStaffModal(true);

            return;
        }

    }




    const handleAddStaff = async (e) => {
        e.preventDefault();

        try {


            const staffData = {
                firstName: staffForm.firstName,
                lastName: staffForm.lastName,
                email: email,
                phoneNumber: staffForm.phoneNumber,
                role: [roles.find(role => role.type === staffForm.role)?._id],
                isActive: true,
                nic: staffForm.nic,
                parkingAreaId: staffForm?.parkingAreaId
            };

            const duplicateResponse = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/check-duplicate-entry`, staffData);

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/signup`, staffData);
            if (response.data.status) {
                toast.success('Staff member added successfully');
                setShowAddStaffModal(false);
                setShowselectPrkingAreaModal(false);
                setShowEmailModal(false);
                setEmail('');
                setStaffForm({ firstName: '', lastName: '', phoneNumber: '', nic: '', role: ['PARKING_MANAGER'], parkingAreaId: '' });
                fetchStaffMembers();
            }
        } catch (error) {
            if (error.response.data.errorResponse) {
                console.log(error.response.data.errorResponse);
                setError({ ...error.response.data.errorResponse });
            }
            else {
                toast.error(error.response.data.message);
            }
        }
    };

    const updateStaff = async (e) => {
        setEmail("");
        e.preventDefault();
        updateUser(staffForm);

    }
    const updateUser = async (staffForm) => {
        const id = staffForm.id;
        delete staffForm.id;
        try {
            console.log(id, "id");
            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/update/${id}`, staffForm);
            if (response.data.status) {
                toast.success('Staff member updated successfully');
                fetchStaffMembers();
                setShowselectPrkingAreaModal(false);
                setShowAddStaffModal(false);
                setShowEmailModal(false);
                setEmail('');
                setStaffForm({ firstName: '', lastName: '', phoneNumber: '', nic: '', role: ['PARKING_MANAGER'], parkingAreaId: '' });
                fetchStaffMembers();
            }
        } catch (error) {
            console.error('Error updating staff member:', error);
            toast.error('Failed to update staff member');
        }
    }


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Parking Area Management</h1>
                <p className="text-gray-600">Manage parking areas and staff members</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('parking-areas')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'parking-areas'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FaMapMarkerAlt className="inline mr-2" />
                            Parking Areas
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'staff'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FaUsers className="inline mr-2" />
                            Staff Members
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'parking-areas' && parkingOwner && (
                        <div className="mt-8">
                            <div className="flex gap-4 items-center mb-6">
                                <h2 className="text-2xl font-bold">Parking Areas</h2>
                                <button type="button" className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md" onClick={() => navigate(`/parking-owner/spot-details`, { state: { ownerId: parkingOwner._id, userType: authState.privilege } })}>
                                    <FaPlus className="mr-2" />
                                    Add Parking Area
                                </button>
                            </div>
                            <ParkingAreaList parkingOwner={parkingOwner} userType={authState.privilege} />
                        </div>


                    )}

                    {activeTab === 'staff' && (
                        <div>
                            {/* Header with Add Button */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Staff Members</h2>
                                    {selectedParkingArea && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Staff for: <span className="font-medium">{selectedParkingArea.name}</span>
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                                >
                                    <FaPlus />
                                    Add Staff Member
                                </button>
                            </div>

                            {/* Staff Members Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Staff Member
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Assigned Area
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {staffMembers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                        No staff members found
                                                    </td>
                                                </tr>
                                            ) : (
                                                staffMembers.map((staff) => (
                                                    <tr key={staff._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {staff.firstName} {staff.lastName}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{staff.email}</div>
                                                            <div className="text-sm text-gray-500">{staff.phoneNumber}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {parkingAreas.find(area => area._id === staff.parkingAreaId)?.name?.toUpperCase() || 'Not assigned'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex justify-center gap-2 space-x-2">
                                                                {/* <button 
                                                                    className="bg-teal-400 hover:bg-teal-600 text-white px-3 py-2 rounded-full"
                                                                    title="View Staff Details"
                                                                >
                                                                    <EyeIcon className="h-5 w-5" />
                                                                </button> */}
                                                                <button
                                                                    onClick={() => { setShowMessage(true); setSelectedStaffId(staff._id); setShowselectPrkingAreaModal(true); setStaffForm({ id: staff._id }); setShowMessage(false) }}
                                                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-full"
                                                                    title="Edit Staff"
                                                                >
                                                                    <PencilAltIcon className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => { setShowConfirmationPopup(true); setSelectedStaffId(staff._id) }}
                                                                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-full"
                                                                    title="Delete Staff"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Staff Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add Staff Member</h2>
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setEmail('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={addStaff}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setEmail('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Adding...' : 'Add Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddStaffModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add Staff Member</h2>
                            <button
                                onClick={() => setShowAddStaffModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddStaff}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={staffForm.firstName}
                                            onChange={(e) => {
                                                setStaffForm({ ...staffForm, firstName: e.target.value })
                                                setError({ ...error, firstName: '' })
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Enter first name"
                                        />
                                        {error.firstName && <p className="text-red-500 text-sm">{error.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={staffForm.lastName}
                                            onChange={(e) => {
                                                setStaffForm({ ...staffForm, lastName: e.target.value })
                                                setError({ ...error, lastName: '' })
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Enter last name"
                                        />
                                        {error.lastName && <p className="text-red-500 text-sm">{error.lastName}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={staffForm.phoneNumber}
                                        onChange={(e) => {
                                            setStaffForm({ ...staffForm, phoneNumber: e.target.value })
                                            setError({ ...error, phoneNumber: '' })
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Enter mobile number"
                                    />
                                    {error.phoneNumber && <p className="text-red-500 text-sm">{error.phoneNumber}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        NIC Number
                                    </label>
                                    <input
                                        type="string"
                                        required
                                        value={staffForm.nic}
                                        onChange={(e) => {
                                            setStaffForm({ ...staffForm, nic: e.target.value })
                                            setError({ ...error, nic: '' })
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Enter NIC number"
                                    />
                                    {error.nic && <p className="text-red-500 text-sm">{error.nic}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Parking Area
                                    </label>
                                    <select
                                        value={staffForm.parkingAreaId}
                                        onChange={(e) => {
                                            setStaffForm({ ...staffForm, parkingAreaId: e.target.value })
                                            setError({ ...error, parkingAreaId: '' })
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        required
                                    >
                                        <option value="">Select parking area</option>
                                        {parkingAreas.map(area => (
                                            <option key={area._id} value={area._id} onClick={() => setError({ ...error, parkingAreaId: '' })}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                    {error.parkingAreaId && <p className="text-red-500 text-sm">{error.parkingAreaId}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddStaffModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}

                                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Adding...' : 'Add Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showselectPrkingAreaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Assign Staff Member</h2>
                            <button
                                onClick={() => setShowselectPrkingAreaModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Message Section */}
                        {showMessage && (<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                                Staff member with email <strong>{email}</strong> already exists. Please select a parking area to assign them to.
                            </p>
                        </div>)}

                        <form onSubmit={updateStaff}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Parking Area
                                    </label>
                                    <select
                                        value={staffForm.parkingAreaId}
                                        onChange={(e) => setStaffForm(prev => ({ ...prev, parkingAreaId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        required
                                    >
                                        <option value="">Select parking area</option>
                                        {parkingAreas.map(area => (
                                            <option key={area._id} value={area._id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowselectPrkingAreaModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Assigning...' : 'Assign Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmationPopup
                isOpen={showConfirmationPopup}
                onClose={() => setShowConfirmationPopup(false)}
                onConfirm={() => {
                    updateUser({ id: selectedStaffId, removeRole: roles.find(role => role.type === 'PARKING_MANAGER')?._id, parkingAreaId: null })
                    setShowConfirmationPopup(false);
                }}
                title="Confirmation"
                message="Are you sure you want to remove this staff member?"
            />


            <ToastContainer />
        </div>
    );
};

export default ParkingAreaHomePage;