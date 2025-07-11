import { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaMapMarkerAlt, FaCar, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import ParkingAreaList from "../User/ParkingOwner/ParkingArea/ParkingAreaList";

const ParkingAreaHomePage = () => {
    const [parkingAreas, setParkingAreas] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('parking-areas');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [selectedParkingArea, setSelectedParkingArea] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [roles, setRoles] = useState([]);
    const [submittingParkingArea, setSubmittingParkingArea] = useState(false);
    const [submittingStaff, setSubmittingStaff] = useState(false);
    const [parkingOwner, setParkingOwner] = useState(null);
    const { authState } = useAuth();
    const navigate = useNavigate();
    // Form states


    const [staffForm, setStaffForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'USER',
        parkingAreaId: ''
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
    };

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
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user?role=USER`);
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




    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            // Find the role ID for the selected role type
            const selectedRole = roles.find(role => role.type === staffForm.role);
            if (!selectedRole) {
                toast.error('Selected role not found');
                return;
            }

            const staffData = {
                firstName: staffForm.firstName,
                lastName: staffForm.lastName,
                email: staffForm.email,
                phoneNumber: staffForm.phone,
                password: staffForm.password,
                role: [selectedRole._id], // Use the role ID
                isActive: true,
                parkingAreaId: staffForm.parkingAreaId || undefined
            };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/signup`, staffData);
            if (response.data.status) {
                toast.success('Staff member added successfully');
                setShowStaffModal(false);
                setStaffForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'USER', parkingAreaId: '' });
                fetchStaffMembers();
            }
        } catch (error) {
            console.error('Error adding staff member:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add staff member';
            toast.error(errorMessage);
        }
    };


    const handleDeleteStaff = async (staffId) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                const response = await axios.delete(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/${staffId}`);
                if (response.data.success) {
                    toast.success('Staff member deleted successfully');
                    fetchStaffMembers();
                }
            } catch (error) {
                console.error('Error deleting staff member:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete staff member';
                toast.error(errorMessage);
            }
        }
    };

    const handleStaffButton = (parkingArea) => {
        setSelectedParkingArea(parkingArea);
        setActiveTab('staff');
    };



    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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
                        // <div>
                        //     {/* Header with Add Button */}
                        //     <div className="flex justify-between items-center mb-6">
                        //         <div className="flex items-center space-x-4">
                        //             <div className="relative">
                        //                 <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        //                 <input
                        //                     type="text"
                        //                     placeholder="Search parking areas..."
                        //                     value={searchTerm}
                        //                     onChange={(e) => setSearchTerm(e.target.value)}
                        //                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        //                 />
                        //             </div>
                        //             <select
                        //                 value={filterStatus}
                        //                 onChange={(e) => setFilterStatus(e.target.value)}
                        //                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        //             >
                        //                 <option value="all">All Status</option>
                        //                 <option value="active">Active</option>
                        //                 <option value="inactive">Inactive</option>
                        //                 <option value="maintenance">Maintenance</option>
                        //             </select>
                        //         </div>
                        //         <button
                        //             onClick={() => setShowAddModal(true)}
                        //             className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                        //         >
                        //             <FaPlus />
                        //             Add Parking Area
                        //         </button>
                        //     </div>

                        //     {/* Parking Areas Grid */}
                        //     {loading ? (
                        //         <div className="text-center py-8">
                        //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                        //             <p className="mt-4 text-gray-600">Loading parking areas...</p>
                        //         </div>
                        //     ) : filteredParkingAreas.length === 0 ? (
                        //         <div className="text-center py-8">
                        //             <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400" />
                        //             <h3 className="mt-2 text-sm font-medium text-gray-900">No parking areas found</h3>
                        //             <p className="mt-1 text-sm text-gray-500">Get started by creating a new parking area.</p>
                        //         </div>
                        //     ) : (
                        //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        //             {filteredParkingAreas.map((area) => (
                        //                 <div key={area._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        //                     <div className="p-6">
                        //                         <div className="flex items-center justify-between mb-4">
                        //                             <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                        //                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(area.status)}`}>
                        //                                 {area.status}
                        //                             </span>
                        //                         </div>
                        //                         <p className="text-gray-600 mb-4">{area.address}</p>
                        //                         <div className="grid grid-cols-2 gap-4 mb-4">
                        //                             <div>
                        //                                 <p className="text-sm text-gray-500">Total Slots</p>
                        //                                 <p className="font-semibold text-gray-900">{area.totalSlots || 'N/A'}</p>
                        //                             </div>
                        //                             <div>
                        //                                 <p className="text-sm text-gray-500">Hourly Rate</p>
                        //                                 <p className="font-semibold text-gray-900">LKR {area.hourlyRate || 'N/A'}</p>
                        //                             </div>
                        //                         </div>
                        //                         <div className="flex space-x-2">
                        //                             <button
                        //                                 onClick={() => handleStaffButton(area)}
                        //                                 className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm"
                        //                             >
                        //                                 <FaUsers />
                        //                                 Staff
                        //                             </button>
                        //                             <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                        //                                 <FaEdit />
                        //                             </button>
                        //                             <button 
                        //                                 onClick={() => handleDeleteParkingArea(area._id)}
                        //                                 className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        //                             >
                        //                                 <FaTrash />
                        //                             </button>
                        //                         </div>
                        //                     </div>
                        //                 </div>
                        //             ))}
                        //         </div>
                        //     )}
                        // </div>
                        // <div>
                        //   <ParkingAreaList parkingOwner={parkingOwner} userType="owner" />
                        // </div>
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
                                    onClick={() => setShowStaffModal(true)}
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
                                                    Role
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
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {staff.role?.[0]?.type || 'No Role'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {staff.parkingArea?.name || 'Not assigned'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button className="text-cyan-600 hover:text-cyan-900">
                                                                    <FaEye />
                                                                </button>
                                                                <button className="text-blue-600 hover:text-blue-900">
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteStaff(staff._id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <FaTrash />
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
            {showStaffModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add Staff Member</h2>
                            <button
                                onClick={() => setShowStaffModal(false)}
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
                                            onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={staffForm.lastName}
                                            onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={staffForm.email}
                                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={staffForm.phone}
                                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={staffForm.password}
                                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={staffForm.role}
                                        onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Select role</option>
                                        {roles.map(role => (
                                            <option key={role._id} value={role.type}>
                                                {role.type.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign to Parking Area
                                    </label>
                                    <select
                                        value={staffForm.parkingAreaId}
                                        onChange={(e) => setStaffForm({ ...staffForm, parkingAreaId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                                    onClick={() => setShowStaffModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingStaff}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingStaff ? 'Adding...' : 'Add Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default ParkingAreaHomePage;