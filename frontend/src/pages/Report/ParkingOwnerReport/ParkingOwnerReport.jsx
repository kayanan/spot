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

    // Set default date range to current month
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

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

    // Mock data in Sri Lankan format matching database collections
    const mockData = {
        // Parking Owner Profile (from User collection)
        parkingOwner: {
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
            profileImage: '/api/assets/owner-profile.jpg',
            isActive: true,
            approvalStatus: true
        },

        // Reservation Payment Summary (from ReservationPayment collection)
        reservationPayments: [
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
                customerName: 'Kamal Perera',
                parkingArea: 'Kandy City Center Parking',
                parkingSlot: 'PS003'
            },
            {
                id: 'PAY002',
                reservationId: 'RES002',
                paymentAmount: 2400,
                paymentDate: '2024-01-15T16:00:00',
                paymentMethod: 'cash',
                referenceNumber: 'CASH001',
                paymentStatus: 'pending',
                customerName: 'Nimal Silva',
                parkingArea: 'Kandy City Center Parking',
                parkingSlot: 'PS002'
            },
            {
                id: 'PAY003',
                reservationId: 'RES003',
                paymentAmount: 1600,
                paymentDate: '2024-01-15T09:45:00',
                paymentMethod: 'bank_transfer',
                referenceNumber: 'BT789456123',
                bankName: 'Bank of Ceylon',
                branch: 'Kandy',
                paymentStatus: 'paid',
                customerName: 'Priya Rajapaksa',
                parkingArea: 'Kandy City Center Parking',
                parkingSlot: 'PS001'
            },
            {
                id: 'PAY004',
                reservationId: 'RES004',
                paymentAmount: 3600,
                paymentDate: '2024-01-14T12:30:00',
                paymentMethod: 'card',
                referenceNumber: 'TXN987654321',
                bankName: 'Sampath Bank',
                branch: 'Kandy',
                cardNumber: '**** **** **** 5678',
                paymentStatus: 'paid',
                customerName: 'Anil Jayasuriya',
                parkingArea: 'Kandy City Center Parking',
                parkingSlot: 'PS005'
            },
            {
                id: 'PAY005',
                reservationId: 'RES005',
                paymentAmount: 1200,
                paymentDate: '2024-01-14T10:15:00',
                paymentMethod: 'cash',
                referenceNumber: 'CASH002',
                paymentStatus: 'failed',
                customerName: 'Samantha Perera',
                parkingArea: 'Kandy City Center Parking',
                parkingSlot: 'PS004'
            },
            {
                id: 'PAY006',
                reservationId: 'RES006',
                paymentAmount: 5200,
                paymentDate: '2024-01-20T11:30:00',
                paymentMethod: 'card',
                referenceNumber: 'TXN654321987',
                bankName: 'Commercial Bank',
                branch: 'Colombo Fort',
                cardNumber: '**** **** **** 9012',
                paymentStatus: 'paid',
                customerName: 'Rajith Fernando',
                parkingArea: 'Colombo Fort Parking',
                parkingSlot: 'PS001'
            },
            {
                id: 'PAY007',
                reservationId: 'RES007',
                paymentAmount: 3800,
                paymentDate: '2024-01-22T15:45:00',
                paymentMethod: 'bank_transfer',
                referenceNumber: 'BT321654987',
                bankName: 'Bank of Ceylon',
                branch: 'Colombo Fort',
                paymentStatus: 'paid',
                customerName: 'Lakshmi Perera',
                parkingArea: 'Colombo Fort Parking',
                parkingSlot: 'PS003'
            },
            {
                id: 'PAY008',
                reservationId: 'RES008',
                paymentAmount: 2800,
                paymentDate: '2024-01-25T09:20:00',
                paymentMethod: 'card',
                referenceNumber: 'TXN147258369',
                bankName: 'Sampath Bank',
                branch: 'Galle Face',
                cardNumber: '**** **** **** 3456',
                paymentStatus: 'paid',
                customerName: 'Dinesh Bandara',
                parkingArea: 'Galle Face Parking',
                parkingSlot: 'PS002'
            },
            {
                id: 'PAY009',
                reservationId: 'RES009',
                paymentAmount: 4200,
                paymentDate: '2024-01-28T14:10:00',
                paymentMethod: 'cash',
                referenceNumber: 'CASH003',
                paymentStatus: 'pending',
                customerName: 'Anjali Weerasinghe',
                parkingArea: 'Negombo Beach Parking',
                parkingSlot: 'PS001'
            },
            {
                id: 'PAY010',
                reservationId: 'RES010',
                paymentAmount: 3400,
                paymentDate: '2024-01-30T16:30:00',
                paymentMethod: 'card',
                referenceNumber: 'TXN963852741',
                bankName: 'Commercial Bank',
                branch: 'Kurunegala',
                cardNumber: '**** **** **** 7890',
                paymentStatus: 'paid',
                customerName: 'Saman Kumara',
                parkingArea: 'Kurunegala Town Parking',
                parkingSlot: 'PS004'
            }
        ],

        // Subscription Payment Report (from SubscriptionPayment collection)
        subscriptionPayments: [
            {
                id: 'SUB001',
                parkingOwnerId: 'OWNER001',
                parkingAreaId: 'PA001',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-01-01T10:00:00',
                paymentMethod: 'BANK_TRANSFER',
                paymentReference: 'SUB2024001',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-01T00:00:00',
                subscriptionEndDate: '2024-12-31T23:59:59',
                paymentDetails: {
                    bankName: 'Commercial Bank',
                    branch: 'Kandy City',
                    referenceNumber: 'BT2024001'
                },
                parkingAreaName: 'Kandy City Center Parking'
            },
            {
                id: 'SUB002',
                parkingOwnerId: 'OWNER002',
                parkingAreaId: 'PA002',
                amount: 25000,
                paymentStatus: 'PENDING',
                paymentDate: '2024-01-05T14:30:00',
                paymentMethod: 'CARD',
                paymentReference: 'SUB2024002',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-05T00:00:00',
                subscriptionEndDate: '2025-01-04T23:59:59',
                paymentDetails: {
                    cardNumber: '**** **** **** 1234',
                    cardHolderName: 'Nimal Silva'
                },
                parkingAreaName: 'Colombo Fort Parking'
            },
            {
                id: 'SUB003',
                parkingOwnerId: 'OWNER003',
                parkingAreaId: 'PA003',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-01-10T09:15:00',
                paymentMethod: 'MOBILE_PAYMENT',
                paymentReference: 'SUB2024003',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-10T00:00:00',
                subscriptionEndDate: '2025-01-09T23:59:59',
                paymentDetails: {
                    mobileNumber: '+94 77 123 4567'
                },
                parkingAreaName: 'Galle Face Parking'
            },
            {
                id: 'SUB004',
                parkingOwnerId: 'OWNER004',
                parkingAreaId: 'PA004',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-01-15T11:20:00',
                paymentMethod: 'CARD',
                paymentReference: 'SUB2024004',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-15T00:00:00',
                subscriptionEndDate: '2025-01-14T23:59:59',
                paymentDetails: {
                    cardNumber: '**** **** **** 5678',
                    cardHolderName: 'Kumar Sivapalan'
                },
                parkingAreaName: 'Jaffna City Parking'
            },
            {
                id: 'SUB005',
                parkingOwnerId: 'OWNER005',
                parkingAreaId: 'PA005',
                amount: 25000,
                paymentStatus: 'FAILED',
                paymentDate: '2024-01-20T16:45:00',
                paymentMethod: 'CARD',
                paymentReference: 'SUB2024005',
                paymentGateway: 'PAYHERE',
                paymentDetails: {
                    cardNumber: '**** **** **** 9012',
                    cardHolderName: 'Anjali Weerasinghe'
                },
                parkingAreaName: 'Negombo Beach Parking'
            },
            {
                id: 'SUB006',
                parkingOwnerId: 'OWNER006',
                parkingAreaId: 'PA006',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-01-25T13:30:00',
                paymentMethod: 'BANK_TRANSFER',
                paymentReference: 'SUB2024006',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-25T00:00:00',
                subscriptionEndDate: '2025-01-24T23:59:59',
                paymentDetails: {
                    bankName: 'Bank of Ceylon',
                    branch: 'Kurunegala',
                    referenceNumber: 'BT2024006'
                },
                parkingAreaName: 'Kurunegala Town Parking'
            }
        ],

       

        // Most Booked Parking Areas
        mostBookedAreas: [
            {
                areaId: 'PA001',
                areaName: 'Kandy City Center Parking',
                totalBookings: 189,
                totalRevenue: 125000,
                averageRating: 4.7,
                location: 'Kandy, Central Province',
                ownerName: 'Sunil Fernando'
            },
            {
                areaId: 'PA002',
                areaName: 'Colombo Fort Parking',
                totalBookings: 245,
                totalRevenue: 180000,
                averageRating: 4.5,
                location: 'Colombo, Western Province',
                ownerName: 'Nimal Silva'
            },
            {
                areaId: 'PA003',
                areaName: 'Galle Face Parking',
                totalBookings: 167,
                totalRevenue: 95000,
                averageRating: 4.8,
                location: 'Colombo, Western Province',
                ownerName: 'Priya Rajapaksa'
            },
            {
                areaId: 'PA004',
                areaName: 'Jaffna City Parking',
                totalBookings: 89,
                totalRevenue: 65000,
                averageRating: 4.3,
                location: 'Jaffna, Northern Province',
                ownerName: 'Kumar Sivapalan'
            },
            {
                areaId: 'PA005',
                areaName: 'Negombo Beach Parking',
                totalBookings: 156,
                totalRevenue: 112000,
                averageRating: 4.6,
                location: 'Negombo, Western Province',
                ownerName: 'Anjali Weerasinghe'
            },
            {
                areaId: 'PA006',
                areaName: 'Kurunegala Town Parking',
                totalBookings: 134,
                totalRevenue: 89000,
                averageRating: 4.4,
                location: 'Kurunegala, North Western Province',
                ownerName: 'Dinesh Bandara'
            }
        ],

        // Highest Revenue Generating Parking Areas
        highestRevenueAreas: [
            {
                areaId: 'PA002',
                areaName: 'Colombo Fort Parking',
                totalRevenue: 180000,
                monthlyRevenue: 45000,
                totalBookings: 245,
                averageRating: 4.5,
                location: 'Colombo, Western Province',
                ownerName: 'Nimal Silva',
                growth: 15.2
            },
            {
                areaId: 'PA001',
                areaName: 'Kandy City Center Parking',
                totalRevenue: 125000,
                monthlyRevenue: 32000,
                totalBookings: 189,
                averageRating: 4.7,
                location: 'Kandy, Central Province',
                ownerName: 'Sunil Fernando',
                growth: 12.8
            },
            {
                areaId: 'PA005',
                areaName: 'Negombo Beach Parking',
                totalRevenue: 112000,
                monthlyRevenue: 28000,
                totalBookings: 156,
                averageRating: 4.6,
                location: 'Negombo, Western Province',
                ownerName: 'Anjali Weerasinghe',
                growth: 18.5
            },
            {
                areaId: 'PA003',
                areaName: 'Galle Face Parking',
                totalRevenue: 95000,
                monthlyRevenue: 24000,
                totalBookings: 167,
                averageRating: 4.8,
                location: 'Colombo, Western Province',
                ownerName: 'Priya Rajapaksa',
                growth: 11.3
            },
            {
                areaId: 'PA006',
                areaName: 'Kurunegala Town Parking',
                totalRevenue: 89000,
                monthlyRevenue: 22000,
                totalBookings: 134,
                averageRating: 4.4,
                location: 'Kurunegala, North Western Province',
                ownerName: 'Dinesh Bandara',
                growth: 9.7
            },
            {
                areaId: 'PA004',
                areaName: 'Jaffna City Parking',
                totalRevenue: 65000,
                monthlyRevenue: 16000,
                totalBookings: 89,
                averageRating: 4.3,
                location: 'Jaffna, Northern Province',
                ownerName: 'Kumar Sivapalan',
                growth: 7.2
            }
        ],

        // Parking Area Wise Ratings
        parkingAreaRatings: [
            {
                areaId: 'PA003',
                areaName: 'Galle Face Parking',
                averageRating: 4.8,
                totalReviews: 167,
                fiveStar: 120,
                fourStar: 35,
                threeStar: 10,
                twoStar: 2,
                oneStar: 0,
                location: 'Colombo, Western Province',
                ownerName: 'Priya Rajapaksa'
            },
            {
                areaId: 'PA001',
                areaName: 'Kandy City Center Parking',
                averageRating: 4.7,
                totalReviews: 189,
                fiveStar: 130,
                fourStar: 45,
                threeStar: 12,
                twoStar: 2,
                oneStar: 0,
                location: 'Kandy, Central Province',
                ownerName: 'Sunil Fernando'
            },
            {
                areaId: 'PA005',
                areaName: 'Negombo Beach Parking',
                averageRating: 4.6,
                totalReviews: 156,
                fiveStar: 100,
                fourStar: 40,
                threeStar: 12,
                twoStar: 3,
                oneStar: 1,
                location: 'Negombo, Western Province',
                ownerName: 'Anjali Weerasinghe'
            },
            {
                areaId: 'PA002',
                areaName: 'Colombo Fort Parking',
                averageRating: 4.5,
                totalReviews: 245,
                fiveStar: 150,
                fourStar: 70,
                threeStar: 20,
                twoStar: 4,
                oneStar: 1,
                location: 'Colombo, Western Province',
                ownerName: 'Nimal Silva'
            },
            {
                areaId: 'PA006',
                areaName: 'Kurunegala Town Parking',
                averageRating: 4.4,
                totalReviews: 134,
                fiveStar: 80,
                fourStar: 35,
                threeStar: 15,
                twoStar: 3,
                oneStar: 1,
                location: 'Kurunegala, North Western Province',
                ownerName: 'Dinesh Bandara'
            },
            {
                areaId: 'PA004',
                areaName: 'Jaffna City Parking',
                averageRating: 4.3,
                totalReviews: 89,
                fiveStar: 50,
                fourStar: 25,
                threeStar: 10,
                twoStar: 3,
                oneStar: 1,
                location: 'Jaffna, Northern Province',
                ownerName: 'Kumar Sivapalan'
            }
        ],

        // Key metrics
        metrics: {
            totalRevenue: 465000,
            monthlyRevenue: 125000,
            totalPayments: 1240,
            successfulPayments: 1180,
            failedPayments: 45,
            pendingPayments: 15,
            activeSubscriptions: 3,
            totalParkingAreas: 4,
            totalSlots: 24,
            averageRating: 4.6
        },

        // Revenue data for charts
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

        // Payment status distribution
        paymentStatusData: [
            { name: 'Successful', value: 1180, fill: '#10b981' },
            { name: 'Failed', value: 45, fill: '#ef4444' },
            { name: 'Pending', value: 15, fill: '#f59e0b' }
        ],

        // Payment method distribution
        paymentMethodData: [
            { name: 'Card', value: 650, fill: '#0891b2' },
            { name: 'Bank Transfer', value: 420, fill: '#0ea5e9' },
            { name: 'Cash', value: 120, fill: '#06b6d4' },
            { name: 'Mobile Payment', value: 50, fill: '#0891b2' }
        ],

        // Subscription status data
        subscriptionStatusData: [
            { name: 'Active', value: 3, fill: '#10b981' },
            { name: 'Expired', value: 1, fill: '#ef4444' },
            { name: 'Pending', value: 1, fill: '#f59e0b' }
        ]
    };

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
                            {mockData.mostBookedAreas.map((area) => (
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

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(mockData.metrics.totalRevenue)}</p>
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
                            <p className="text-xl font-bold text-gray-900">{mockData.metrics.successfulPayments}</p>
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
                            <p className="text-xl font-bold text-gray-900">{mockData.metrics.activeSubscriptions}</p>
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
                            <p className="text-xl font-bold text-gray-900">{mockData.metrics.averageRating}</p>
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

                                {/* Payment Status Distribution */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={mockData.paymentStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {mockData.paymentStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        {mockData.paymentStatusData.map((item, index) => (
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
                                    {mockData.mostBookedAreas.map((area) => (
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
                                        {filterDataByDateRangeAndArea(mockData.reservationPayments).map((payment) => (
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
                                        {filterDataByDateRangeAndArea(mockData.subscriptionPayments, 'paymentDate').map((subscription) => (
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
                                        {mockData.highestRevenueAreas.map((area) => (
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
                                        {mockData.parkingAreaRatings.map((area) => (
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