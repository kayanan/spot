import React, { useState } from 'react';
import { 
    FaUser, 
    FaCar, 
    FaParking, 
    FaCreditCard, 
    FaHistory,
    FaMapMarkerAlt,
    FaClock,
    FaStar,
    FaEdit,
    FaTrash,
    FaPlus,
    FaCalendarAlt,
    FaPhone,
    FaEnvelope,
    FaLocationArrow,
    FaMoneyBillWave
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
    Cell
} from 'recharts';

const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [currentDate] = useState(new Date());

    // Mock data in Sri Lankan format matching database collections
    const mockData = {
        // User profile data (from User collection)
        userProfile: {
            firstName: 'Kamal',
            lastName: 'Perera',
            email: 'kamal.perera@gmail.com',
            phoneNumber: '+94 71 234 5678',
            nic: '1985123456789V',
            address: {
                line1: 'No. 123, Temple Road',
                line2: 'Battaramulla',
                city: 'Colombo',
                district: 'Colombo',
                province: 'Western Province'
            },
            profileImage: '/api/assets/profile.jpg',
            isActive: true,
            approvalStatus: true
        },

        // Vehicle data (from User.vehicle array)
        vehicles: [
            {
                vehicleNumber: 'ABC-1234',
                isDefault: true,
                vehicleType: 'Car',
                brand: 'Toyota',
                model: 'Aqua'
            },
            {
                vehicleNumber: 'XYZ-5678',
                isDefault: false,
                vehicleType: 'Car',
                brand: 'Honda',
                model: 'Vezel'
            }
        ],

        // Card details (from User.cardDetails array)
        cardDetails: [
            {
                nameOnCard: 'KAMAL PERERA',
                cardNumber: '**** **** **** 1234',
                expiryDate: '12/25',
                cvv: '***',
                isDefault: true
            },
            {
                nameOnCard: 'KAMAL PERERA',
                cardNumber: '**** **** **** 5678',
                expiryDate: '06/26',
                cvv: '***',
                isDefault: false
            }
        ],

        // Account details (from User.accountDetails array)
        accountDetails: [
            {
                accountHolderName: 'Kamal Perera',
                accountNumber: '1234567890',
                bankName: 'Bank of Ceylon',
                branchName: 'Battaramulla Branch',
                isDefault: true
            }
        ],

        // Recent reservations (from Reservation collection)
        recentReservations: [
            {
                id: 'RES001',
                parkingArea: 'Colombo Fort Parking',
                parkingSlot: 'A-12',
                vehicleNumber: 'ABC-1234',
                startDateAndTime: '2024-01-15T14:30:00',
                endDateAndTime: '2024-01-15T18:30:00',
                totalAmount: 2500,
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentType: 'card',
                perHourRate: 625
            },
            {
                id: 'RES002',
                parkingArea: 'Kandy City Center',
                parkingSlot: 'B-08',
                vehicleNumber: 'XYZ-5678',
                startDateAndTime: '2024-01-14T10:00:00',
                endDateAndTime: '2024-01-14T12:00:00',
                totalAmount: 1800,
                status: 'completed',
                paymentStatus: 'paid',
                paymentType: 'cash',
                perHourRate: 900
            },
            {
                id: 'RES003',
                parkingArea: 'Galle Fort Parking',
                parkingSlot: 'C-15',
                vehicleNumber: 'ABC-1234',
                startDateAndTime: '2024-01-13T16:00:00',
                endDateAndTime: '2024-01-13T19:00:00',
                totalAmount: 2200,
                status: 'completed',
                paymentStatus: 'paid',
                paymentType: 'bank_transfer',
                perHourRate: 733
            }
        ],

        // Booking statistics
        bookingStats: {
            totalBookings: 47,
            totalSpent: 125000,
            averageRating: 4.6,
            favoriteAreas: [
                { name: 'Colombo Fort', bookings: 15 },
                { name: 'Kandy City Center', bookings: 12 },
                { name: 'Galle Fort', bookings: 8 },
                { name: 'Jaffna Town', bookings: 6 },
                { name: 'Anuradhapura Sacred City', bookings: 6 }
            ]
        },

        // Monthly spending data
        monthlySpending: [
            { month: 'Jan', amount: 8500 },
            { month: 'Feb', amount: 12000 },
            { month: 'Mar', amount: 9800 },
            { month: 'Apr', amount: 15000 },
            { month: 'May', amount: 13500 },
            { month: 'Jun', amount: 11000 },
            { month: 'Jul', amount: 12500 },
            { month: 'Aug', amount: 14000 },
            { month: 'Sep', amount: 16000 },
            { month: 'Oct', amount: 14500 },
            { month: 'Nov', amount: 18000 },
            { month: 'Dec', amount: 22000 }
        ],

        // Vehicle type distribution
        vehicleTypeData: [
            { name: 'Car', value: 85, fill: '#0891b2' },
            { name: 'Van', value: 10, fill: '#0ea5e9' },
            { name: 'Motorcycle', value: 5, fill: '#06b6d4' }
        ]
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
        { id: 'overview', label: 'Overview', icon: FaUser },
        { id: 'vehicles', label: 'My Vehicles', icon: FaCar },
        { id: 'bookings', label: 'Bookings', icon: FaHistory },
        { id: 'payments', label: 'Payments', icon: FaCreditCard }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {mockData.userProfile.firstName}!
                </h1>
                <p className="text-gray-600">
                    Manage your parking bookings and account settings
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

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-xl font-bold text-gray-900">{mockData.bookingStats.totalBookings}</p>
                        </div>
                        <div className="p-3 bg-cyan-100 rounded-lg">
                            <FaHistory className="text-cyan-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Spent</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(mockData.bookingStats.totalSpent)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaMoneyBillWave className="text-green-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                            <p className="text-xl font-bold text-gray-900">{mockData.bookingStats.averageRating}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FaStar className="text-yellow-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                            <p className="text-xl font-bold text-gray-900">{mockData.vehicles.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaCar className="text-blue-600 text-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
                                {/* Monthly Spending Chart */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={mockData.monthlySpending}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip 
                                                formatter={(value) => [formatCurrency(value), 'Amount']}
                                                labelStyle={{ color: '#374151' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="amount" 
                                                stroke="#0891b2" 
                                                strokeWidth={3}
                                                dot={{ fill: '#0891b2', strokeWidth: 2, r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Vehicle Type Distribution */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Type Usage</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={mockData.vehicleTypeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {mockData.vehicleTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        {mockData.vehicleTypeData.map((item, index) => (
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

                            {/* Recent Bookings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                                <div className="space-y-3">
                                    {mockData.recentReservations.slice(0, 3).map((booking) => (
                                        <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <FaParking className="text-cyan-600" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{booking.parkingArea}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                Slot {booking.parkingSlot} • {booking.vehicleNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                            {booking.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center space-x-4">
                                                    <span className="flex items-center">
                                                        <FaClock className="mr-1" />
                                                        {formatDate(booking.startDateAndTime)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <FaMapMarkerAlt className="mr-1" />
                                                        {booking.perHourRate}/hr
                                                    </span>
                                                </div>
                                                <button className="text-cyan-600 hover:text-cyan-700 font-medium">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vehicles' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
                                <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2">
                                    <FaPlus />
                                    <span>Add Vehicle</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mockData.vehicles.map((vehicle, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <FaCar className="text-cyan-600 text-xl" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                                                    <p className="text-sm text-gray-600">{vehicle.vehicleNumber}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {vehicle.isDefault && (
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <FaEdit />
                                                </button>
                                                <button className="text-red-400 hover:text-red-600">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p>Type: {vehicle.vehicleType}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {mockData.recentReservations.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <FaMapMarkerAlt className="text-cyan-500 mr-2" />
                                                        {booking.parkingArea}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{booking.vehicleNumber}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Credit Cards */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Credit/Debit Cards</h4>
                                    <div className="space-y-3">
                                        {mockData.cardDetails.map((card, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <FaCreditCard className="text-cyan-600 mr-3" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{card.nameOnCard}</p>
                                                            <p className="text-sm text-gray-600">{card.cardNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {card.isDefault && (
                                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <FaEdit />
                                                        </button>
                                                        <button className="text-red-400 hover:text-red-600">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bank Accounts */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Bank Accounts</h4>
                                    <div className="space-y-3">
                                        {mockData.accountDetails.map((account, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <FaMoneyBillWave className="text-cyan-600 mr-3" />
        <div>
                                                            <p className="font-medium text-gray-900">{account.accountHolderName}</p>
                                                            <p className="text-sm text-gray-600">{account.bankName} - {account.branchName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {account.isDefault && (
                                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <FaEdit />
                                                        </button>
                                                        <button className="text-red-400 hover:text-red-600">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;