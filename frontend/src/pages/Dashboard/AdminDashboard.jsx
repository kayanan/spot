import React, { useState, useEffect } from 'react';
import { 
    FaUsers, 
    FaParking, 
    FaMoneyBillWave, 
    FaChartLine, 
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaClock,
    FaStar,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaEdit,
    FaTrash,
    FaDownload,
    FaFilter
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

const AdminDashboard = () => {
    const [currentDate] = useState(new Date());
    const [selectedTimeRange, setSelectedTimeRange] = useState('week');

    // Mock data in Sri Lankan format
    const mockData = {
        // Revenue data (in LKR)
        revenueData: [
            { month: 'Jan', revenue: 125000, bookings: 45 },
            { month: 'Feb', revenue: 158000, bookings: 52 },
            { month: 'Mar', revenue: 142000, bookings: 48 },
            { month: 'Apr', revenue: 189000, bookings: 63 },
            { month: 'May', revenue: 201000, bookings: 67 },
            { month: 'Jun', revenue: 178000, bookings: 59 },
            { month: 'Jul', revenue: 165000, bookings: 55 },
            { month: 'Aug', revenue: 192000, bookings: 64 },
            { month: 'Sep', revenue: 210000, bookings: 70 },
            { month: 'Oct', revenue: 198000, bookings: 66 },
            { month: 'Nov', revenue: 225000, bookings: 75 },
            { month: 'Dec', revenue: 245000, bookings: 82 }
        ],

        // Parking spot distribution by city
        cityData: [
            { name: 'Colombo', spots: 45, value: 45, fill: '#0891b2' },
            { name: 'Kandy', spots: 28, value: 28, fill: '#0ea5e9' },
            { name: 'Galle', spots: 22, value: 22, fill: '#06b6d4' },
            { name: 'Jaffna', spots: 18, value: 18, fill: '#3b82f6' },
            { name: 'Anuradhapura', spots: 15, value: 15, fill: '#6366f1' },
            { name: 'Others', spots: 32, value: 32, fill: '#8b5cf6' }
        ],

        // Recent bookings
        recentBookings: [
            {
                id: 'BK001',
                customer: 'Kamal Perera',
                location: 'Colombo Fort',
                vehicle: 'Toyota Aqua',
                amount: 2500,
                status: 'Active',
                date: '2024-01-15',
                time: '14:30'
            },
            {
                id: 'BK002',
                customer: 'Nimal Silva',
                location: 'Kandy City Center',
                vehicle: 'Honda Vezel',
                amount: 1800,
                status: 'Completed',
                date: '2024-01-15',
                time: '12:15'
            },
            {
                id: 'BK003',
                customer: 'Sunil Fernando',
                location: 'Galle Fort',
                vehicle: 'Suzuki Swift',
                amount: 2200,
                status: 'Active',
                date: '2024-01-15',
                time: '16:45'
            },
            {
                id: 'BK004',
                customer: 'Priya Rajapaksa',
                location: 'Jaffna Town',
                vehicle: 'Nissan Leaf',
                amount: 1600,
                status: 'Pending',
                date: '2024-01-15',
                time: '09:20'
            },
            {
                id: 'BK005',
                customer: 'Dinesh Weerasinghe',
                location: 'Anuradhapura Sacred City',
                vehicle: 'Toyota Prius',
                amount: 1900,
                status: 'Active',
                date: '2024-01-15',
                time: '11:30'
            }
        ],

        // System alerts
        alerts: [
            {
                id: 1,
                type: 'warning',
                message: 'High traffic detected in Colombo Fort area',
                time: '2 minutes ago'
            },
            {
                id: 2,
                type: 'success',
                message: 'Payment gateway integration completed successfully',
                time: '15 minutes ago'
            },
            {
                id: 3,
                type: 'error',
                message: 'Server maintenance scheduled for tonight 2:00 AM',
                time: '1 hour ago'
            }
        ],

        // Key metrics
        metrics: {
            totalUsers: 2847,
            activeSpots: 160,
            totalRevenue: 245000,
            avgRating: 4.6,
            totalBookings: 1250,
            pendingPayments: 8900
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Completed':
                return 'bg-blue-100 text-blue-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-500" />;
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaExclamationTriangle className="text-gray-500" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('si-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">
                    Welcome back! Here's what's happening with FindMySpot today.
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

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col items-center justify-between">
                    <div className="p-3 bg-cyan-100 rounded-lg">
                            <FaUsers className="text-cyan-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{mockData.metrics.totalUsers.toLocaleString()}</p>
                        </div>
                        
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col items-center justify-between">
                    <div className="p-3 bg-blue-100 rounded-lg">
                            <FaParking className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Spots</p>
                            <p className="text-2xl font-bold text-gray-900">{mockData.metrics.activeSpots}</p>
                        </div>
                        
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col items-center justify-between">
                    <div className="p-3 bg-green-100 rounded-lg">
                            <FaMoneyBillWave className="text-green-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.metrics.totalRevenue)}</p>
                        </div>
                        
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col items-center justify-between">
                    <div className="p-3 bg-purple-100 rounded-lg">
                            <FaChartLine className="text-purple-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{mockData.metrics.totalBookings.toLocaleString()}</p>
                        </div>
                        
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col items-center justify-between">
                    <div className="p-3 bg-orange-100 rounded-lg">
                            <FaClock className="text-orange-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.metrics.pendingPayments)}</p>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
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
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={mockData.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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

                {/* City Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Parking Spots by City</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={mockData.cityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {mockData.cityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value, name) => [value, name]}
                                labelStyle={{ color: '#374151' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {mockData.cityData.map((city, index) => (
                            <div key={index} className="flex items-center text-sm">
                                <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: city.fill }}
                                ></div>
                                <span className="text-gray-600">{city.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Bookings and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                            <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                                View All
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockData.recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.customer}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="text-cyan-500 mr-1" />
                                                {booking.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(booking.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button className="text-cyan-600 hover:text-cyan-900">
                                                    <FaEye />
                                                </button>
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <FaEdit />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {mockData.alerts.map((alert) => (
                            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 mt-1">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{alert.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex items-center justify-center p-4 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors">
                        <FaDownload className="mr-2" />
                        Export Report
                    </button>
                    <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <FaFilter className="mr-2" />
                        Filter Data
                    </button>
                    <button className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                        <FaUsers className="mr-2" />
                        Manage Users
                    </button>
                    <button className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <FaParking className="mr-2" />
                        Add Spot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;