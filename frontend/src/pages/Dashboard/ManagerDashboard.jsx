import React, { useState } from 'react';
import { 
    FaParking, 
    FaCar, 
    FaMoneyBillWave, 
    FaUsers, 
    FaChartLine,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaClock,
    FaStar,
    FaEdit,
    FaTrash,
    FaPlus,
    FaEye,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaDownload,
    FaFilter,
    FaPhone,
    FaEnvelope,
    FaLocationArrow,
    FaCreditCard,
    FaHistory
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

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [currentDate] = useState(new Date());
    const [selectedTimeRange, setSelectedTimeRange] = useState('week');

    // Mock data in Sri Lankan format matching database collections
    const mockData = {
        // Manager profile data (from User collection)
        managerProfile: {
            firstName: 'Sunil',
            lastName: 'Fernando',
            email: 'sunil.fernando@findmyspot.com',
            phoneNumber: '+94 77 345 6789',
            nic: '1980123456789V',
            address: {
                line1: 'No. 45, Lake Road',
                line2: 'Kandy',
                city: 'Kandy',
                district: 'Kandy',
                province: 'Central Province'
            },
            profileImage: '/api/assets/manager-profile.jpg',
            isActive: true,
            approvalStatus: true
        },

        // Parking Area data (from ParkingArea collection)
        parkingArea: {
            id: 'PA001',
            name: 'Kandy City Center Parking',
            location: {
                type: 'Point',
                coordinates: [80.6333, 7.2955] // Kandy coordinates
            },
            addressLine1: 'No. 123, Peradeniya Road',
            addressLine2: 'Kandy City Center',
            city: 'Kandy',
            district: 'Kandy',
            province: 'Central Province',
            postalCode: '20000',
            contactNumber: '+94 81 234 5678',
            email: 'kandy.parking@findmyspot.com',
            description: 'Modern parking facility in the heart of Kandy city with 24/7 security',
            isActive: true,
            averageRating: 4.7,
            totalRatings: 156
        },

        // Parking Slots data (from ParkingSlot collection)
        parkingSlots: [
            {
                id: 'PS001',
                slotNumber: 1,
                vehicleType: 'Car',
                slotDescription: 'Covered parking near entrance',
                slotSize: 4.5,
                slotPrice: 800,
                isReserved: false,
                isBooked: false,
                isActive: true
            },
            {
                id: 'PS002',
                slotNumber: 2,
                vehicleType: 'Car',
                slotDescription: 'Covered parking with CCTV',
                slotSize: 4.5,
                slotPrice: 800,
                isReserved: true,
                isBooked: false,
                isActive: true
            },
            {
                id: 'PS003',
                slotNumber: 3,
                vehicleType: 'Van',
                slotDescription: 'Large vehicle parking',
                slotSize: 6.0,
                slotPrice: 1200,
                isReserved: false,
                isBooked: true,
                isActive: true
            },
            {
                id: 'PS004',
                slotNumber: 4,
                vehicleType: 'Motorcycle',
                slotDescription: 'Motorcycle parking area',
                slotSize: 2.0,
                slotPrice: 300,
                isReserved: false,
                isBooked: false,
                isActive: true
            },
            {
                id: 'PS005',
                slotNumber: 5,
                vehicleType: 'Car',
                slotDescription: 'Premium parking with shade',
                slotSize: 4.5,
                slotPrice: 1000,
                isReserved: false,
                isBooked: false,
                isActive: true
            },
            {
                id: 'PS006',
                slotNumber: 6,
                vehicleType: 'Car',
                slotDescription: 'Standard parking',
                slotSize: 4.5,
                slotPrice: 800,
                isReserved: false,
                isBooked: false,
                isActive: false
            }
        ],

        // Recent reservations (from Reservation collection)
        recentReservations: [
            {
                id: 'RES001',
                parkingSlot: 'PS003',
                user: {
                    firstName: 'Kamal',
                    lastName: 'Perera',
                    phoneNumber: '+94 71 234 5678'
                },
                vehicleNumber: 'ABC-1234',
                customerMobile: '+94 71 234 5678',
                startDateAndTime: '2024-01-15T14:30:00',
                endDateAndTime: '2024-01-15T18:30:00',
                perHourRate: 1200,
                totalAmount: 4800,
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentType: 'card',
                vehicleType: 'Van'
            },
            {
                id: 'RES002',
                parkingSlot: 'PS002',
                user: {
                    firstName: 'Nimal',
                    lastName: 'Silva',
                    phoneNumber: '+94 72 345 6789'
                },
                vehicleNumber: 'XYZ-5678',
                customerMobile: '+94 72 345 6789',
                startDateAndTime: '2024-01-15T16:00:00',
                endDateAndTime: '2024-01-15T19:00:00',
                perHourRate: 800,
                totalAmount: 2400,
                status: 'pending',
                paymentStatus: 'pending',
                paymentType: 'cash',
                vehicleType: 'Car'
            },
            {
                id: 'RES003',
                parkingSlot: 'PS001',
                user: {
                    firstName: 'Priya',
                    lastName: 'Rajapaksa',
                    phoneNumber: '+94 73 456 7890'
                },
                vehicleNumber: 'DEF-9012',
                customerMobile: '+94 73 456 7890',
                startDateAndTime: '2024-01-15T10:00:00',
                endDateAndTime: '2024-01-15T12:00:00',
                perHourRate: 800,
                totalAmount: 1600,
                status: 'completed',
                paymentStatus: 'paid',
                paymentType: 'bank_transfer',
                vehicleType: 'Car'
            }
        ],

        // Payment data (from ReservationPayment collection)
        recentPayments: [
            {
                id: 'PAY001',
                reservationId: 'RES001',
                paymentAmount: 4800,
                paymentDate: '2024-01-15T14:25:00',
                paymentMethod: 'card',
                referenceNumber: 'TXN123456789',
                bankName: 'Commercial Bank',
                branch: 'Kandy City',
                cardNumber: '**** **** **** 1234',
                paymentStatus: 'paid',
                customerName: 'Kamal Perera'
            },
            {
                id: 'PAY002',
                reservationId: 'RES003',
                paymentAmount: 1600,
                paymentDate: '2024-01-15T09:45:00',
                paymentMethod: 'bank_transfer',
                referenceNumber: 'BT789456123',
                bankName: 'Bank of Ceylon',
                branch: 'Kandy',
                paymentStatus: 'paid',
                customerName: 'Priya Rajapaksa'
            }
        ],

        // Key metrics
        metrics: {
            totalSlots: 6,
            availableSlots: 3,
            occupiedSlots: 2,
            reservedSlots: 1,
            totalRevenue: 125000,
            monthlyRevenue: 45000,
            totalBookings: 89,
            averageRating: 4.7,
            pendingPayments: 2400
        },

        // Revenue data
        revenueData: [
            { month: 'Jan', revenue: 42000, bookings: 28 },
            { month: 'Feb', revenue: 38000, bookings: 25 },
            { month: 'Mar', revenue: 45000, bookings: 30 },
            { month: 'Apr', revenue: 52000, bookings: 35 },
            { month: 'May', revenue: 48000, bookings: 32 },
            { month: 'Jun', revenue: 55000, bookings: 37 },
            { month: 'Jul', revenue: 51000, bookings: 34 },
            { month: 'Aug', revenue: 58000, bookings: 39 },
            { month: 'Sep', revenue: 54000, bookings: 36 },
            { month: 'Oct', revenue: 62000, bookings: 42 },
            { month: 'Nov', revenue: 59000, bookings: 40 },
            { month: 'Dec', revenue: 68000, bookings: 46 }
        ],

        // Vehicle type distribution
        vehicleTypeData: [
            { name: 'Car', value: 65, fill: '#0891b2' },
            { name: 'Van', value: 20, fill: '#0ea5e9' },
            { name: 'Motorcycle', value: 15, fill: '#06b6d4' }
        ],

        // Slot status distribution
        slotStatusData: [
            { name: 'Available', value: 3, fill: '#10b981' },
            { name: 'Occupied', value: 2, fill: '#f59e0b' },
            { name: 'Reserved', value: 1, fill: '#3b82f6' },
            { name: 'Maintenance', value: 0, fill: '#ef4444' }
        ],

        // Recent ratings (from ParkingArea.ratings)
        recentRatings: [
            {
                id: 1,
                rating: 5,
                comment: 'Excellent parking facility with good security. Very clean and well-maintained.',
                userName: 'Kamal Perera',
                date: '2024-01-14'
            },
            {
                id: 2,
                rating: 4,
                comment: 'Good location and reasonable prices. Staff is helpful.',
                userName: 'Nimal Silva',
                date: '2024-01-13'
            },
            {
                id: 3,
                rating: 5,
                comment: 'Best parking in Kandy city center. Highly recommended!',
                userName: 'Priya Rajapaksa',
                date: '2024-01-12'
            }
        ],

        // System alerts
        alerts: [
            {
                id: 1,
                type: 'warning',
                message: 'Slot PS006 requires maintenance - reported issue with lighting',
                time: '2 hours ago'
            },
            {
                id: 2,
                type: 'success',
                message: 'Payment received for reservation RES001 - LKR 4,800',
                time: '3 hours ago'
            },
            {
                id: 3,
                type: 'info',
                message: 'New customer registration: Priya Rajapaksa',
                time: '1 day ago'
            }
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

    const getSlotStatusColor = (isBooked, isReserved, isActive) => {
        if (!isActive) return 'bg-red-100 text-red-800';
        if (isBooked) return 'bg-yellow-100 text-yellow-800';
        if (isReserved) return 'bg-blue-100 text-blue-800';
        return 'bg-green-100 text-green-800';
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
        { id: 'overview', label: 'Overview', icon: FaParking },
        { id: 'slots', label: 'Parking Slots', icon: FaCar },
        { id: 'reservations', label: 'Reservations', icon: FaHistory },
        { id: 'payments', label: 'Payments', icon: FaMoneyBillWave },
        { id: 'ratings', label: 'Reviews', icon: FaStar }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {mockData.managerProfile.firstName}!
                </h1>
                <p className="text-gray-600">
                    Manage your parking facility at {mockData.parkingArea.name}
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
                            <p className="text-sm font-medium text-gray-600">Total Slots</p>
                            <p className="text-xl font-bold text-gray-900">{mockData.metrics.totalSlots}</p>
                        </div>
                        <div className="p-3 bg-cyan-100 rounded-lg">
                            <FaParking className="text-cyan-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Available</p>
                            <p className="text-xl font-bold text-gray-900">{mockData.metrics.availableSlots}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaCheckCircle className="text-green-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(mockData.metrics.monthlyRevenue)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaMoneyBillWave className="text-blue-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                            <p className="text-xl font-bold text-gray-900">{mockData.metrics.averageRating}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FaStar className="text-yellow-600 text-lg" />
                        </div>
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
                                        <AreaChart data={mockData.revenueData}>
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

                                {/* Slot Status Distribution */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Slot Status</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={mockData.slotStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {mockData.slotStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        {mockData.slotStatusData.map((item, index) => (
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

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Reservations */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h3>
                                    <div className="space-y-3">
                                        {mockData.recentReservations.slice(0, 3).map((reservation) => (
                                            <div key={reservation.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <FaCar className="text-cyan-600" />
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {reservation.user.firstName} {reservation.user.lastName}
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    Slot {reservation.parkingSlot} • {reservation.vehicleNumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">{formatCurrency(reservation.totalAmount)}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                                                                {reservation.status}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                                                                {reservation.paymentStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                                    <div className="flex items-center space-x-4">
                                                        <span className="flex items-center">
                                                            <FaClock className="mr-1" />
                                                            {formatDate(reservation.startDateAndTime)}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <FaMapMarkerAlt className="mr-1" />
                                                            {reservation.perHourRate}/hr
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

                                {/* System Alerts */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
                                    <div className="space-y-3">
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
                        </div>
                    )}

                    {activeTab === 'slots' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Parking Slots Management</h3>
                                <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2">
                                    <FaPlus />
                                    <span>Add Slot</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockData.parkingSlots.map((slot) => (
                                    <div key={slot.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <FaCar className="text-cyan-600 text-xl" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Slot {slot.slotNumber}</h4>
                                                    <p className="text-sm text-gray-600">{slot.vehicleType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSlotStatusColor(slot.isBooked, slot.isReserved, slot.isActive)}`}>
                                                    {!slot.isActive ? 'Maintenance' : slot.isBooked ? 'Occupied' : slot.isReserved ? 'Reserved' : 'Available'}
                                                </span>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <FaEdit />
                                                </button>
                                                <button className="text-red-400 hover:text-red-600">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <p>{slot.slotDescription}</p>
                                            <p>Size: {slot.slotSize}m × 2.5m</p>
                                            <p className="font-medium text-gray-900">{formatCurrency(slot.slotPrice)}/hour</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reservations' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">All Reservations</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservation ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {mockData.recentReservations.map((reservation) => (
                                            <tr key={reservation.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{reservation.id}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    <div>
                                                        <p className="font-medium">{reservation.user.firstName} {reservation.user.lastName}</p>
                                                        <p className="text-gray-500">{reservation.user.phoneNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{reservation.parkingSlot}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{reservation.vehicleNumber}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(reservation.totalAmount)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                                                        {reservation.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                                                        {reservation.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-cyan-600 hover:text-cyan-900">
                                                            <FaEye />
                                                        </button>
                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            <FaEdit />
                                                        </button>
                                                    </div>
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
                            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {mockData.recentPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{payment.id}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900">{payment.customerName}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(payment.paymentAmount)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600 capitalize">{payment.paymentMethod}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.paymentStatus)}`}>
                                                        {payment.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{payment.referenceNumber}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ratings' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold text-gray-900">{mockData.metrics.averageRating}</span>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar 
                                                key={i} 
                                                className={`w-5 h-5 ${i < Math.floor(mockData.metrics.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">({mockData.parkingArea.totalRatings} reviews)</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {mockData.recentRatings.map((rating) => (
                                    <div key={rating.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                                        />
                                                    ))}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{rating.userName}</h4>
                                                    <p className="text-sm text-gray-500">{rating.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{rating.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;