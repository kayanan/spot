import { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaUniversity, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const ListParkingPayments = () => {
    const { authState } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [parkingAreas, setParkingAreas] = useState([]);
    const [filters, setFilters] = useState({
        startDate: authState.privilege === "PARKING_MANAGER" ? new Date().toISOString().split('T')[0] : '',
        endDate: authState.privilege === "PARKING_MANAGER" ? new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] : '',
        parkingArea: authState.privilege === "PARKING_MANAGER" ? authState.user.parkingAreaId : '',
        paymentStatus: '',
        paymentType: '',
        page: 1,
        limit: 9999,
        parkingOwner: authState.privilege === "PARKING_OWNER" ? authState.user.userId: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        totalAmount: 0
    });

    // Payment type options
    const paymentTypes = [
        { id: 'cash', name: 'Cash Payment', icon: FaMoneyBillWave, color: 'text-green-600' },
        { id: 'card', name: 'Card Payment', icon: FaCreditCard, color: 'text-blue-600' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: FaUniversity, color: 'text-purple-600' }
    ];

    // Payment status options
    const paymentStatuses = [
        { id: 'paid', name: 'Completed', icon: FaCheckCircle, color: 'text-green-600' },
        { id: 'failed', name: 'Failed', icon: FaTimesCircle, color: 'text-red-600' },
        { id: 'pending', name: 'Pending', icon: FaClock, color: 'text-yellow-600' }
    ];

    useEffect(() => {
        fetchParkingAreas();
        fetchPayments();
    }, []);

    const fetchParkingAreas = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area`,{
                params: {
                    parkingOwner: authState.privilege === "PARKING_OWNER" ? authState.user.userId: ''
                }
            });
            setParkingAreas(response.data.data || []);
        } catch (error) {
            console.error('Error fetching parking areas:', error);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation-payment`, {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    parkingArea: filters.parkingArea,
                    paymentStatus: filters.paymentStatus,
                    paymentType: filters.paymentType,
                    parkingOwner: filters.parkingOwner
                }
            });
            const paymentData = response.data.data || [];
            setPayments(paymentData);
            calculateStats(paymentData);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to fetch payment data');
            setPayments([]);
            calculateStats([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const stats = {
            total: data.length,
            completed: data.filter(p => p.paymentStatus === 'paid').length,
            failed: data.filter(p => p.paymentStatus === 'failed').length,
            pending: data.filter(p => p.paymentStatus === 'pending').length,
            totalAmount: data.reduce((sum, p) => sum + (p.paymentAmount || 0), 0)
        };
        setStats(stats);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        fetchPayments();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            startDate: authState.privilege === "PARKING_MANAGER" ? new Date().toISOString().split('T')[0] : '',
            endDate: authState.privilege === "PARKING_MANAGER" ? new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] : '',
            parkingArea: authState.privilege === "PARKING_MANAGER" ? authState.user.parkingAreaId : '',
            paymentStatus: '',
            paymentType: '',
            page: 1,
            limit: 9999,
            parkingOwner: authState.privilege === "PARKING_OWNER" ? authState.user.userId: ''
        });
        fetchPayments();
    };

    const exportReport = () => {
        // Implementation for exporting report
        toast.info('Export feature coming soon');
    };

    const getPaymentTypeIcon = (paymentType) => {
        const type = paymentTypes.find(t => t.id === paymentType);
        if (type) {
            const IconComponent = type.icon;
            return <IconComponent className={`h-4 w-4 ${type.color}`} />;
        }
        return null;
    };

    const getPaymentStatusIcon = (status) => {
        const statusObj = paymentStatuses.find(s => s.id === status);
        if (statusObj) {
            const IconComponent = statusObj.icon;
            return <IconComponent className={`h-4 w-4 ${statusObj.color}`} />;
        }
        return null;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Parking Payments Report</h1>
                <p className="text-gray-600">View and analyze parking payment transactions</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <FaCreditCard className="h-6 w-6 text-cyan-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FaCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Failed</p>
                            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <FaTimesCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <FaClock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-cyan-600">LKR {stats.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <FaMoneyBillWave className="h-6 w-6 text-cyan-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            {authState.privilege === "PARKING_MANAGER" ? null : (<div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                            >
                                <FaFilter />
                                Filters
                            </button>
                            <button
                                onClick={exportReport}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <FaDownload />
                                Export
                            </button>
                        </div>
                        <div className="text-sm text-gray-500">
                            {payments.length} payments found
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            {/* Parking Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parking Area
                                </label>
                                <select
                                    value={filters.parkingArea}
                                    onChange={(e) => handleFilterChange('parkingArea', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">All Areas</option>
                                    {parkingAreas.map(area => (
                                        <option key={area._id} value={area._id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Status
                                </label>
                                <select
                                    value={filters.paymentStatus}
                                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">All Statuses</option>
                                    {paymentStatuses.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Type
                                </label>
                                <select
                                    value={filters.paymentType}
                                    onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">All Types</option>
                                    {paymentTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}
            </div>)}

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Parking Area
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{payment._id.slice(-8)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.reservation?.vehicleNumber?.toUpperCase()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {payment.customer?.firstName} {payment.customer?.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {payment.customer?.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {payment.parkingArea?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Slot {payment.parkingSlot?.slotNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                LKR {payment.paymentAmount?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getPaymentTypeIcon(payment.paymentMethod)}
                                                <span className="text-sm text-gray-900">
                                                    {paymentTypes.find(t => t.id === payment.paymentMethod)?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getPaymentStatusIcon(payment.paymentStatus)}
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(payment.paymentStatus)}`}>
                                                    {payment.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-cyan-600 hover:text-cyan-900">
                                                <FaEye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ListParkingPayments;