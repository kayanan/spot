import React, { useState, useEffect } from 'react';
import { 
    FaMoneyBillWave, 
    FaCreditCard, 
    FaUsers, 
    FaParking,
    FaCar,
    FaChartLine,
    FaCalendarAlt,
    
    FaFilter,
    FaEye,
    FaPrint,
    FaFileExport,
    FaGlobe,
    FaBuilding,
    FaMapMarkerAlt,
    FaClock,
    FaStar,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaHistory,
    FaPhone,
    FaEnvelope,
    FaLocationArrow,
    
    FaQrcode,
    FaMobile
} from 'react-icons/fa';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { generateParkingOwnerDetailedReport, exportParkingOwnerDetailedReportCSV } from '../../../services/report.service';
import axios from 'axios';

const ParkingOwnerReport = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [currentDate] = useState(new Date());
    const [selectedTimeRange, setSelectedTimeRange] = useState('month');
    const [selectedOwner, setSelectedOwner] = useState('all');
    
    // New filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedArea, setSelectedArea] = useState('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
    const [parkingOwners, setParkingOwners] = useState([]);
    const [loadingOwners, setLoadingOwners] = useState(false);

    // API data states
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOwnerId, setSelectedOwnerId] = useState(''); // For API calls

    // Set default date range to current month
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

    // Fetch report data
    const fetchReportData = async () => {
        if (!selectedOwnerId || !startDate || !endDate) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Convert date strings to ISO datetime format
            const startDateTime = new Date(startDate + 'T00:00:00.000Z').toISOString();
            const endDateTime = new Date(endDate + 'T23:59:59.999Z').toISOString();
            
            const response = await generateParkingOwnerDetailedReport(startDateTime, endDateTime, selectedOwnerId);
            setReportData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch parking owners on component mount
    useEffect(() => {
        const fetchParkingOwners = async () => {
            setLoadingOwners(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/list`,
                    {
                        withCredentials: true,
                        params: {
                            role: 'PARKING_OWNER',
                            approvalStatus: 'true',
                            isActive: 'true'
                        }
                    }
                );
                setParkingOwners(response.data.users || []);
            } catch (err) {
                console.error('Error fetching parking owners:', err);
            } finally {
                setLoadingOwners(false);
            }
        };

        fetchParkingOwners();
    }, []);

    // Fetch data when owner or date range changes
    useEffect(() => {
        if (selectedOwnerId && startDate && endDate) {
            fetchReportData();
        }
    }, [selectedOwnerId, startDate, endDate]);

    // Handle CSV export
    const handleExportCSV = async () => {
        if (!selectedOwnerId || !startDate || !endDate) {
            alert('Please select an owner and date range');
            return;
        }
        
        try {
            // Convert date strings to ISO datetime format
            const startDateTime = new Date(startDate + 'T00:00:00.000Z').toISOString();
            const endDateTime = new Date(endDate + 'T23:59:59.999Z').toISOString();
            
            await exportParkingOwnerDetailedReportCSV(startDateTime, endDateTime, selectedOwnerId);
        } catch (err) {
            alert('Failed to export CSV');
        }
    };

    // Filter data based on date range and area
    const filterDataByDateRangeAndArea = (data, dateField = 'paymentDate') => {
        let filteredData = data;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item[dateField]);
                return itemDate >= start && itemDate <= end;
            });
        }
        
        if (selectedArea !== 'all') {
            filteredData = filteredData.filter(item => 
                item.parkingArea === selectedArea || item.parkingAreaName === selectedArea
            );
        }
        
        if (selectedPaymentStatus !== 'all') {
            filteredData = filteredData.filter(item => 
                item.paymentStatus === selectedPaymentStatus
            );
        }
        
        return filteredData;
    };

    // Use real data from API only
    const data = reportData || null;

    // Show loading state when no data is available
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                        <span className="text-gray-600 text-lg">Loading report data...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={() => fetchReportData()}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty state when no data is available
    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Parking Owner Reports
                    </h1>
                    <p className="text-gray-600">
                        Comprehensive analytics and financial reports for parking owners
                    </p>
                </div>

                {/* Owner Selection and Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Parking Owner
                                </label>
                                <select
                                    value={selectedOwnerId}
                                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    disabled={loadingOwners}
                                >
                                    <option value="">Select an owner...</option>
                                    {loadingOwners ? (
                                        <option value="" disabled>Loading owners...</option>
                                    ) : (
                                        parkingOwners.map((owner) => (
                                            <option key={owner._id} value={owner._id}>
                                                {owner.firstName} {owner.lastName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Range
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                    <span className="flex items-center text-gray-500">to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <FaChartLine className="text-gray-400 text-4xl mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                        <p className="text-gray-600 mb-4">
                            Please select a parking owner and date range to view the report.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'SUCCESS':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'card':
            case 'CARD':
                return <FaCreditCard className="text-blue-500" />;
            case 'bank_transfer':
            case 'BANK_TRANSFER':
                return < FaCreditCard className="text-green-500" />;
            case 'cash':
                return <FaMoneyBillWave className="text-yellow-500" />;
            case 'MOBILE_PAYMENT':
                return <FaMobile className="text-purple-500" />;
            case 'QR_CODE':
                return <FaQrcode className="text-orange-500" />;
            default:
                return <FaCreditCard className="text-gray-500" />;
        }
    };

    const getSlotStatusColor = (isBooked, isReserved, isActive) => {
        if (!isActive) return 'bg-red-100 text-red-800';
        if (isBooked) return 'bg-yellow-100 text-yellow-800';
        if (isReserved) return 'bg-blue-100 text-blue-800';
        return 'bg-green-100 text-green-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('si-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('si-LK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FaChartLine },
        { id: 'reservations', label: 'Reservation Payments', icon: FaMoneyBillWave },
        { id: 'subscriptions', label: 'Subscription Payments', icon: FaCreditCard },
        { id: 'revenue', label: 'Highest Revenue Areas', icon: FaMoneyBillWave },
        { id: 'ratings', label: 'Area Ratings', icon: FaStar }
    ];

    // Filter component
    const FilterSection = ({ title, showAreaFilter = true, showStatusFilter = true }) => (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>
                
                {/* Quick Date Buttons */}
                <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 mb-1">Quick Select</label>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => {
                                const now = new Date();
                                const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                setStartDate(start.toISOString().split('T')[0]);
                                setEndDate(now.toISOString().split('T')[0]);
                            }}
                            className="px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200"
                        >
                            Week
                        </button>
                        <button
                            onClick={() => {
                                const now = new Date();
                                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                setStartDate(start.toISOString().split('T')[0]);
                                setEndDate(end.toISOString().split('T')[0]);
                            }}
                            className="px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200"
                        >
                            Month
                        </button>
                        <button
                            onClick={() => {
                                const now = new Date();
                                const start = new Date(now.getFullYear(), 0, 1);
                                const end = new Date(now.getFullYear(), 11, 31);
                                setStartDate(start.toISOString().split('T')[0]);
                                setEndDate(end.toISOString().split('T')[0]);
                            }}
                            className="px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200"
                        >
                            Year
                        </button>
                    </div>
                </div>

                {/* Area Filter */}
                {showAreaFilter && (
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-600 mb-1">Parking Area</label>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            <option value="all">All Areas</option>
                            {(data?.mostBookedAreas || []).map((area) => (
                                <option key={area.areaId} value={area.areaName}>
                                    {area.areaName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Status Filter */}
                {showStatusFilter && (
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                        <select
                            value={selectedPaymentStatus}
                            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                )}
            </div>
            
            {/* Clear Filters */}
            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                        Showing data from <span className="font-medium">{startDate ? new Date(startDate).toLocaleDateString() : 'All'}</span> 
                        {endDate && startDate && ` to ${new Date(endDate).toLocaleDateString()}`}
                    </span>
                </div>
                <button
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setSelectedArea('all');
                        setSelectedPaymentStatus('all');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Parking Owner Reports
                </h1>
                <p className="text-gray-600">
                    Comprehensive analytics and financial reports for parking owners
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                    <FaCalendarAlt className="mr-2" />
                    {currentDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>

            {/* Owner Selection and Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Parking Owner
                            </label>
                            <select
                                value={selectedOwnerId}
                                onChange={(e) => setSelectedOwnerId(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                disabled={loadingOwners}
                            >
                                <option value="">Select an owner...</option>
                                {loadingOwners ? (
                                    <option value="" disabled>Loading owners...</option>
                                ) : (
                                    parkingOwners.map((owner) => (
                                        <option key={owner._id} value={owner._id}>
                                            {owner.firstName} {owner.lastName}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                                <span className="flex items-center text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        <button
                            onClick={handleExportCSV}
                            disabled={!selectedOwnerId || loading}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <FaFileExport />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Loading and Error States */}
                {loading && (
                    <div className="mt-4 flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
                            <span className="text-gray-600">Loading report data...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <FaExclamationTriangle className="text-red-500" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(data?.metrics?.totalRevenue || 0)}</p>
                        </div>
                        <div className="p-3 bg-cyan-100 rounded-lg">
                            <FaMoneyBillWave className="text-cyan-600 text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                        <FaMoneyBillWave className="text-green-500 mr-1" />
                        <span className="text-green-600">+12.5% from last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Successful Payments</p>
                            <p className="text-xl font-bold text-gray-900">{data?.metrics?.successfulPayments || 0}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaCheckCircle className="text-green-600 text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                        <FaMoneyBillWave className="text-green-500 mr-1" />
                        <span className="text-green-600">+8.2% from last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                            <p className="text-xl font-bold text-gray-900">{data?.metrics?.activeSubscriptions || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaCreditCard className="text-blue-600 text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                        <FaMoneyBillWave className="text-green-500 mr-1" />
                        <span className="text-green-600">+2 new subscriptions</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                            <p className="text-xl font-bold text-gray-900">{data?.metrics?.averageRating || 0}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FaStar className="text-yellow-600 text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                        <FaMoneyBillWave className="text-green-500 mr-1" />
                        <span className="text-green-600">+0.3 from last month</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-cyan-500 text-cyan-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="text-lg" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Chart */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                                        <div className="flex space-x-2">
                                            <button 
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedTimeRange === 'week' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}
                                                onClick={() => setSelectedTimeRange('week')}
                                            >
                                                Week
                                            </button>
                                            <button 
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedTimeRange === 'month' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}
                                                onClick={() => setSelectedTimeRange('month')}
                                            >
                                                Month
                                            </button>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={data?.revenueData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip 
                                                formatter={(value) => [formatCurrency(value), 'Revenue']}
                                                labelStyle={{ color: '#374151' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="revenue" 
                                                stroke="#0891b2" 
                                                fill="#0891b2" 
                                                fillOpacity={0.3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Payment Status Distribution */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={data?.paymentStatusData || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {(data?.paymentStatusData || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        {(data?.paymentStatusData || []).map((item, index) => (
                                            <div key={index} className="flex items-center text-sm">
                                                <div 
                                                    className="w-3 h-3 rounded-full mr-2" 
                                                    style={{ backgroundColor: item.fill }}
                                                ></div>
                                                <span className="text-gray-600">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Most Booked Areas */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Booked Parking Areas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(data?.mostBookedAreas || []).map((area) => (
                                        <div key={area.areaId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <FaParking className="text-cyan-600 text-xl" />
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < Math.floor(area.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <h4 className="font-medium text-gray-900 mb-2">{area.areaName}</h4>
                                            <p className="text-sm text-gray-600 mb-3">{area.location}</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bookings:</span>
                                                    <span className="font-medium">{area.totalBookings}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Revenue:</span>
                                                    <span className="font-medium">{formatCurrency(area.totalRevenue)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Owner:</span>
                                                    <span className="font-medium">{area.ownerName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reservations' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Reservation Payment Summary</h3>
                                <div className="flex space-x-2">
                                    <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2">
                                        <FaPrint />
                                        <span>Export</span>
                                    </button>
                                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                                        <FaPrint />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>

                            <FilterSection title="Filter Reservation Payments" />
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parking Area</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filterDataByDateRangeAndArea(data?.reservationPayments || []).map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{payment.id}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">{payment.customerName}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{payment.parkingArea}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(payment.paymentAmount)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        {getPaymentMethodIcon(payment.paymentMethod)}
                                                        <span className="capitalize">{payment.paymentMethod}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                                                        {payment.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{payment.referenceNumber}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscriptions' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Subscription Payment Report</h3>
                                <div className="flex space-x-2">
                                    <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2">
                                        <FaPrint />
                                        <span>Export</span>
                                    </button>
                                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                                        <FaPrint />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>

                            <FilterSection title="Filter Subscription Payments" />
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parking Area</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gateway</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filterDataByDateRangeAndArea(data?.subscriptionPayments || [], 'paymentDate').map((subscription) => (
                                            <tr key={subscription.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{subscription.id}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">{subscription.parkingAreaName}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(subscription.amount)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        {getPaymentMethodIcon(subscription.paymentMethod)}
                                                        <span className="capitalize">{subscription.paymentMethod.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.paymentStatus)}`}>
                                                        {subscription.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{formatDate(subscription.subscriptionStartDate)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{formatDate(subscription.subscriptionEndDate)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{subscription.paymentGateway}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeTab === 'revenue' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Highest Revenue Generating Parking Areas</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Revenue</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {(data?.highestRevenueAreas || []).map((area) => (
                                            <tr key={area.areaId} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.areaName}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(area.totalRevenue)}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(area.monthlyRevenue)}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.totalBookings}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.growth}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ratings' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Parking Area Ratings</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Rating</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Reviews</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">5 Stars</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">4 Stars</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">3 Stars</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">2 Stars</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">1 Star</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {(data?.parkingAreaRatings || []).map((area) => (
                                            <tr key={area.areaId} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.areaName}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.averageRating}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.totalReviews}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.fiveStar}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.fourStar}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.threeStar}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.twoStar}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{area.oneStar}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParkingOwnerReport;