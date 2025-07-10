import React, { useState, useEffect } from 'react';
import { 
    FaChartBar, 
    FaUsers, 
    FaMoneyBillWave, 
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaDownload,
    FaFilter,
    FaEye,
    FaPrint,
    FaFileExport,
    FaGlobe,
    FaBuilding,
    FaUserTie,
    FaUser,
    FaCar,
    FaParking,
    FaCreditCard,
    FaStar,
    FaPhone,
    FaEnvelope
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
    Area,
    ComposedChart
} from 'recharts';
import { 
    fetchRevenueByRegion, 
    fetchReservationsRevenueByCity, 
    fetchRevenueByParkingOwners, 
    fetchSubscriptionPayments,
    exportRevenueByRegionCSV,
    exportReservationsRevenueByCityCSV,
    exportRevenueByParkingOwnersCSV,
    exportSubscriptionPaymentsCSV
} from '../../../services/report.service';

const AdminReport = () => {
    const [selectedTimeRange, setSelectedTimeRange] = useState('month');
    const [selectedReport, setSelectedReport] = useState('revenue');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [revenueByRegion, setRevenueByRegion] = useState([]);
    const [revenueSummary, setRevenueSummary] = useState(null);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [revenueError, setRevenueError] = useState(null);
    
    // Reservations revenue by city state
    const [reservationsByCity, setReservationsByCity] = useState([]);
    const [reservationsSummary, setReservationsSummary] = useState(null);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [reservationsError, setReservationsError] = useState(null);
    
    // Revenue by parking owners state
    const [parkingOwnersRevenue, setParkingOwnersRevenue] = useState([]);
    const [parkingOwnersSummary, setParkingOwnersSummary] = useState(null);
    const [loadingParkingOwners, setLoadingParkingOwners] = useState(false);
    const [parkingOwnersError, setParkingOwnersError] = useState(null);
    
    // Subscription payments state
    const [subscriptionPayments, setSubscriptionPayments] = useState([]);
    const [subscriptionPaymentsSummary, setSubscriptionPaymentsSummary] = useState(null);
    const [loadingSubscriptionPayments, setLoadingSubscriptionPayments] = useState(false);
    const [subscriptionPaymentsError, setSubscriptionPaymentsError] = useState(null);

    // Set default date range to current month
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

    // Fetch revenue by region when date changes or on mount
    useEffect(() => {
        if (!startDate || !endDate) return;
        setLoadingRevenue(true);
        setRevenueError(null);
        fetchRevenueByRegion(
            new Date(startDate).toISOString(),
            new Date(endDate).toISOString()
        )
            .then((data) => {
                setRevenueByRegion(
                    (data.data || []).map(region => ({
                        region: region.provinceName,
                        revenue: region.totalRevenue,
                        bookings: region.totalBookings,
                        parkingAreas: region.totalParkingAreas,
                        growth: region.growthPercentage
                    }))
                );
                setRevenueSummary(data.summary || null);
            })
            .catch((err) => {
                setRevenueError(err?.response?.data?.message || 'Failed to fetch revenue data');
            })
            .finally(() => setLoadingRevenue(false));
    }, [startDate, endDate]);

    // Fetch reservations revenue by city when date changes or on mount
    useEffect(() => {
        if (!startDate || !endDate) return;
        setLoadingReservations(true);
        setReservationsError(null);
        fetchReservationsRevenueByCity(
            new Date(startDate).toISOString(),
            new Date(endDate).toISOString()
        )
            .then((data) => {
                setReservationsByCity(
                    (data.data || []).map(city => ({
                        city: city.cityName,
                        district: city.districtName,
                        province: city.provinceName,
                        reservations: city.totalReservations,
                        revenue: city.totalRevenue,
                        averageRevenue: city.averageRevenuePerReservation
                    }))
                );
                setReservationsSummary(data.summary || null);
            })
            .catch((err) => {
                setReservationsError(err?.response?.data?.message || 'Failed to fetch reservations data');
            })
            .finally(() => setLoadingReservations(false));
    }, [startDate, endDate]);

    // Fetch revenue by parking owners when date changes or on mount
    useEffect(() => {
        if (!startDate || !endDate) return;
        setLoadingParkingOwners(true);
        setParkingOwnersError(null);
        fetchRevenueByParkingOwners(
            new Date(startDate).toISOString(),
            new Date(endDate).toISOString()
        )
            .then((data) => {
                setParkingOwnersRevenue(
                    (data.data || []).map(owner => ({
                        ownerId: owner.ownerId,
                        ownerName: owner.ownerName,
                        ownerEmail: owner.ownerEmail,
                        ownerContact: owner.ownerContact,
                        parkingAreas: owner.parkingAreas,
                        totalRevenue: owner.totalRevenue,
                        totalBookings: owner.totalBookings,
                        totalParkingAreas: owner.totalParkingAreas,
                        averageRevenuePerParkingArea: owner.averageRevenuePerParkingArea
                    }))
                );
                setParkingOwnersSummary(data.summary || null);
            })
            .catch((err) => {
                setParkingOwnersError(err?.response?.data?.message || 'Failed to fetch parking owners data');
            })
            .finally(() => setLoadingParkingOwners(false));
    }, [startDate, endDate]);

    // Fetch subscription payments when date changes or on mount
    useEffect(() => {
        if (!startDate || !endDate) return;
        setLoadingSubscriptionPayments(true);
        setSubscriptionPaymentsError(null);
        fetchSubscriptionPayments(
            new Date(startDate).toISOString(),
            new Date(endDate).toISOString()
        )
            .then((data) => {
                setSubscriptionPayments(
                    (data.data || []).map(payment => ({
                        paymentId: payment.paymentId,
                        ownerId: payment.ownerId,
                        ownerName: payment.ownerName,
                        ownerEmail: payment.ownerEmail,
                        ownerContact: payment.ownerContact,
                        parkingAreaId: payment.parkingAreaId,
                        parkingAreaName: payment.parkingAreaName,
                        amount: payment.amount,
                        status: payment.status,
                        paymentMethod: payment.paymentMethod,
                        paymentDate: new Date(payment.paymentDate),
                        subscriptionStartDate: new Date(payment.subscriptionStartDate),
                        subscriptionEndDate: new Date(payment.subscriptionEndDate),
                        subscriptionPeriod: payment.subscriptionPeriod,
                        paymentReference: payment.paymentReference,
                        paymentGateway: payment.paymentGateway
                    }))
                );
                setSubscriptionPaymentsSummary(data.summary || null);
            })
            .catch((err) => {
                setSubscriptionPaymentsError(err?.response?.data?.message || 'Failed to fetch subscription payments data');
            })
            .finally(() => setLoadingSubscriptionPayments(false));
    }, [startDate, endDate]);

    // Filter data based on date range
    const filterDataByDateRange = (data) => {
        if (!startDate || !endDate) return data;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // For mock data, we'll simulate filtering by returning the data
        // In a real application, you would filter based on actual date fields
        return data;
    };

    // Sri Lankan formatted mock data
    const mockData = {
        // Revenue by Region data
        revenueByRegion: [
            { region: 'Western Province', revenue: 1250000, bookings: 1250, parkingAreas: 45, growth: 12.5 },
            { region: 'Central Province', revenue: 890000, bookings: 890, parkingAreas: 32, growth: 8.3 },
            { region: 'Southern Province', revenue: 720000, bookings: 720, parkingAreas: 28, growth: 15.2 },
            { region: 'Northern Province', revenue: 450000, bookings: 450, parkingAreas: 18, growth: 6.8 },
            { region: 'Eastern Province', revenue: 380000, bookings: 380, parkingAreas: 15, growth: 9.1 },
            { region: 'North Western Province', revenue: 520000, bookings: 520, parkingAreas: 22, growth: 11.4 },
            { region: 'North Central Province', revenue: 310000, bookings: 310, parkingAreas: 12, growth: 7.6 },
            { region: 'Uva Province', revenue: 280000, bookings: 280, parkingAreas: 10, growth: 5.9 },
            { region: 'Sabaragamuwa Province', revenue: 420000, bookings: 420, parkingAreas: 16, growth: 13.2 }
        ],

        // Reservations by City data
        reservationsByCity: [
            { city: 'Colombo', district: 'Colombo', province: 'Western', reservations: 850, revenue: 680000 },
            { city: 'Kandy', district: 'Kandy', province: 'Central', reservations: 420, revenue: 336000 },
            { city: 'Galle', district: 'Galle', province: 'Southern', reservations: 380, revenue: 304000 },
            { city: 'Jaffna', district: 'Jaffna', province: 'Northern', reservations: 280, revenue: 224000 },
            { city: 'Batticaloa', district: 'Batticaloa', province: 'Eastern', reservations: 220, revenue: 176000 },
            { city: 'Kurunegala', district: 'Kurunegala', province: 'North Western', reservations: 320, revenue: 256000 },
            { city: 'Anuradhapura', district: 'Anuradhapura', province: 'North Central', reservations: 180, revenue: 144000 },
            { city: 'Badulla', district: 'Badulla', province: 'Uva', reservations: 150, revenue: 120000 },
            { city: 'Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa', reservations: 240, revenue: 192000 },
            { city: 'Negombo', district: 'Gampaha', province: 'Western', reservations: 290, revenue: 232000 },
            { city: 'Matara', district: 'Matara', province: 'Southern', reservations: 200, revenue: 160000 },
            { city: 'Trincomalee', district: 'Trincomalee', province: 'Eastern', reservations: 160, revenue: 128000 }
        ],

        // User registrations over time
        userRegistrations: [
            { month: 'Jan', customers: 125, owners: 8, managers: 12, total: 145 },
            { month: 'Feb', customers: 142, owners: 6, managers: 10, total: 158 },
            { month: 'Mar', customers: 168, owners: 12, managers: 15, total: 195 },
            { month: 'Apr', customers: 189, owners: 9, managers: 8, total: 206 },
            { month: 'May', customers: 203, owners: 15, managers: 18, total: 236 },
            { month: 'Jun', customers: 234, owners: 11, managers: 14, total: 259 },
            { month: 'Jul', customers: 256, owners: 13, managers: 16, total: 285 },
            { month: 'Aug', customers: 278, owners: 18, managers: 20, total: 316 },
            { month: 'Sep', customers: 301, owners: 14, managers: 12, total: 327 },
            { month: 'Oct', customers: 324, owners: 16, managers: 19, total: 359 },
            { month: 'Nov', customers: 347, owners: 20, managers: 22, total: 389 },
            { month: 'Dec', customers: 389, owners: 25, managers: 28, total: 442 }
        ],

        // Revenue by Parking Owners
        revenueByOwners: [
            {
                ownerId: 'OWN001',
                ownerName: 'Sunil Fernando',
                parkingArea: 'Kandy City Center Parking',
                city: 'Kandy',
                province: 'Central Province',
                totalRevenue: 125000,
                totalBookings: 156,
                averageRating: 4.7,
                contactNumber: '+94 77 345 6789',
                email: 'sunil.fernando@findmyspot.com'
            },
            {
                ownerId: 'OWN002',
                ownerName: 'Priya Rajapaksa',
                parkingArea: 'Colombo Fort Parking Complex',
                city: 'Colombo',
                province: 'Western Province',
                totalRevenue: 189000,
                totalBookings: 234,
                averageRating: 4.5,
                contactNumber: '+94 71 234 5678',
                email: 'priya.rajapaksa@findmyspot.com'
            },
            {
                ownerId: 'OWN003',
                ownerName: 'Kamal Perera',
                parkingArea: 'Galle Fort Parking',
                city: 'Galle',
                province: 'Southern Province',
                totalRevenue: 98000,
                totalBookings: 123,
                averageRating: 4.8,
                contactNumber: '+94 72 345 6789',
                email: 'kamal.perera@findmyspot.com'
            },
            {
                ownerId: 'OWN004',
                ownerName: 'Nimal Silva',
                parkingArea: 'Jaffna Central Parking',
                city: 'Jaffna',
                province: 'Northern Province',
                totalRevenue: 67000,
                totalBookings: 89,
                averageRating: 4.3,
                contactNumber: '+94 73 456 7890',
                email: 'nimal.silva@findmyspot.com'
            },
            {
                ownerId: 'OWN005',
                ownerName: 'Anjali Weerasinghe',
                parkingArea: 'Negombo Beach Parking',
                city: 'Negombo',
                province: 'Western Province',
                totalRevenue: 112000,
                totalBookings: 145,
                averageRating: 4.6,
                contactNumber: '+94 74 567 8901',
                email: 'anjali.weerasinghe@findmyspot.com'
            },
            {
                ownerId: 'OWN006',
                ownerName: 'Dinesh Bandara',
                parkingArea: 'Kurunegala Town Parking',
                city: 'Kurunegala',
                province: 'North Western Province',
                totalRevenue: 89000,
                totalBookings: 112,
                averageRating: 4.4,
                contactNumber: '+94 75 678 9012',
                email: 'dinesh.bandara@findmyspot.com'
            }
        ],

        // User statistics by role
        userStats: {
            totalUsers: 2847,
            customers: 2456,
            owners: 187,
            managers: 204,
            activeUsers: 2156,
            inactiveUsers: 691
        },

        // Top performing cities
        topCities: [
            { city: 'Colombo', revenue: 680000, bookings: 850, growth: 15.2 },
            { city: 'Kandy', revenue: 336000, bookings: 420, growth: 12.8 },
            { city: 'Galle', revenue: 304000, bookings: 380, growth: 18.5 },
            { city: 'Negombo', revenue: 232000, bookings: 290, growth: 11.3 },
            { city: 'Jaffna', revenue: 224000, bookings: 280, growth: 9.7 }
        ],

        // Subscription Payment Data
        subscriptionPayments: [
            {
                paymentId: 'SUB001',
                parkingOwnerId: 'OWN001',
                parkingOwnerName: 'Sunil Fernando',
                parkingAreaId: 'PA001',
                parkingAreaName: 'Kandy City Center Parking',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-01-15',
                paymentMethod: 'CARD',
                paymentReference: 'PAY-2024-001',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-15',
                subscriptionEndDate: '2025-01-15',
                paymentDetails: {
                    cardNumber: '**** **** **** 1234',
                    cardHolderName: 'Sunil Fernando',
                    cardExpiryMonth: '12',
                    cardExpiryYear: '2025'
                }
            },
            {
                paymentId: 'SUB002',
                parkingOwnerId: 'OWN002',
                parkingOwnerName: 'Priya Rajapaksa',
                parkingAreaId: 'PA002',
                parkingAreaName: 'Colombo Fort Parking Complex',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-01-20',
                paymentMethod: 'BANK_TRANSFER',
                paymentReference: 'PAY-2024-002',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-20',
                subscriptionEndDate: '2025-01-20',
                paymentDetails: {
                    bankName: 'Commercial Bank',
                    branch: 'Colombo Fort',
                    referenceNumber: 'REF-2024-002'
                }
            },
            {
                paymentId: 'SUB003',
                parkingOwnerId: 'OWN003',
                parkingOwnerName: 'Kamal Perera',
                parkingAreaId: 'PA003',
                parkingAreaName: 'Galle Fort Parking',
                amount: 25000,
                paymentStatus: 'PENDING',
                paymentDate: '2024-01-25',
                paymentMethod: 'BANK_TRANSFER',
                paymentReference: 'PAY-2024-003',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-01-25',
                subscriptionEndDate: '2025-01-25',
                paymentDetails: {
                    bankName: 'Bank of Ceylon',
                    branch: 'Galle',
                    referenceNumber: 'REF-2024-003'
                }
            },
            {
                paymentId: 'SUB004',
                parkingOwnerId: 'OWN004',
                parkingOwnerName: 'Nimal Silva',
                parkingAreaId: 'PA004',
                parkingAreaName: 'Jaffna Central Parking',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-02-01',
                paymentMethod: 'CARD',
                paymentReference: 'PAY-2024-004',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-02-01',
                subscriptionEndDate: '2025-02-01',
                paymentDetails: {
                    cardNumber: '**** **** **** 5678',
                    cardHolderName: 'Nimal Silva',
                    cardExpiryMonth: '08',
                    cardExpiryYear: '2026'
                }
            },
            {
                paymentId: 'SUB005',
                parkingOwnerId: 'OWN005',
                parkingOwnerName: 'Anjali Weerasinghe',
                parkingAreaId: 'PA005',
                parkingAreaName: 'Negombo Beach Parking',
                amount: 25000,
                paymentStatus: 'FAILED',
                paymentDate: '2024-02-05',
                paymentMethod: 'CARD',
                paymentReference: 'PAY-2024-005',
                paymentGateway: 'PAYHERE',
                paymentDetails: {
                    cardNumber: '**** **** **** 9012',
                    cardHolderName: 'Anjali Weerasinghe',
                    cardExpiryMonth: '03',
                    cardExpiryYear: '2024'
                }
            },
            {
                paymentId: 'SUB006',
                parkingOwnerId: 'OWN006',
                parkingOwnerName: 'Dinesh Bandara',
                parkingAreaId: 'PA006',
                parkingAreaName: 'Kurunegala Town Parking',
                amount: 25000,
                paymentStatus: 'SUCCESS',
                paymentDate: '2024-02-10',
                paymentMethod: 'MOBILE_PAYMENT',
                paymentReference: 'PAY-2024-006',
                paymentGateway: 'PAYHERE',
                subscriptionStartDate: '2024-02-10',
                subscriptionEndDate: '2025-02-10',
                paymentDetails: {
                    mobileNumber: '+94 75 678 9012',
                    provider: 'Dialog'
                }
            }
        ],

        // Subscription payment statistics
        subscriptionStats: {
            totalPayments: 156,
            successfulPayments: 142,
            pendingPayments: 8,
            failedPayments: 6,
            totalRevenue: 3900000,
            averageAmount: 25000,
            successRate: 91.0
        },

        // Subscription payments by month
        subscriptionPaymentsByMonth: [
            { month: 'Jan', payments: 12, revenue: 300000, success: 11, pending: 1, failed: 0 },
            { month: 'Feb', payments: 15, revenue: 375000, success: 14, pending: 1, failed: 0 },
            { month: 'Mar', payments: 18, revenue: 450000, success: 16, pending: 1, failed: 1 },
            { month: 'Apr', payments: 14, revenue: 350000, success: 13, pending: 0, failed: 1 },
            { month: 'May', payments: 16, revenue: 400000, success: 15, pending: 1, failed: 0 },
            { month: 'Jun', payments: 19, revenue: 475000, success: 17, pending: 1, failed: 1 },
            { month: 'Jul', payments: 13, revenue: 325000, success: 12, pending: 1, failed: 0 },
            { month: 'Aug', payments: 17, revenue: 425000, success: 16, pending: 1, failed: 0 },
            { month: 'Sep', payments: 14, revenue: 350000, success: 13, pending: 1, failed: 0 },
            { month: 'Oct', payments: 16, revenue: 400000, success: 15, pending: 1, failed: 0 },
            { month: 'Nov', payments: 18, revenue: 450000, success: 16, pending: 1, failed: 1 },
            { month: 'Dec', payments: 20, revenue: 500000, success: 18, pending: 1, failed: 1 }
        ],

        // Payment method distribution
        paymentMethodDistribution: [
            { method: 'CARD', count: 78, percentage: 50.0, color: '#0891b2' },
            { method: 'BANK_TRANSFER', count: 45, percentage: 28.8, color: '#10b981' },
            { method: 'MOBILE_PAYMENT', count: 25, percentage: 16.0, color: '#8b5cf6' },
            { method: 'QR_CODE', count: 8, percentage: 5.2, color: '#f59e0b' }
        ],

        // Payment status distribution
        paymentStatusDistribution: [
            { status: 'SUCCESS', count: 142, percentage: 91.0, color: '#10b981' },
            { status: 'PENDING', count: 8, percentage: 5.1, color: '#f59e0b' },
            { status: 'FAILED', count: 6, percentage: 3.9, color: '#ef4444' }
        ]
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('si-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('si-LK').format(number);
    };

    const getGrowthColor = (growth) => {
        return growth >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getGrowthIcon = (growth) => {
        return growth >= 0 ? <FaDownload className="text-green-500" /> : <FaDownload className="text-red-500" />;
    };

    // CSV Export functionality
    const handleExportReport = async () => {
        if (!startDate || !endDate) {
            alert('Please select a date range before exporting');
            return;
        }

        try {
            let csvData;
            let fileName;

            switch (selectedReport) {
                case 'revenue':
                    csvData = await exportRevenueByRegionCSV(
                        new Date(startDate).toISOString(),
                        new Date(endDate).toISOString()
                    );
                    fileName = `revenue_by_region_${startDate}_${endDate}.csv`;
                    break;
                case 'reservations':
                    csvData = await exportReservationsRevenueByCityCSV(
                        new Date(startDate).toISOString(),
                        new Date(endDate).toISOString()
                    );
                    fileName = `reservations_revenue_by_city_${startDate}_${endDate}.csv`;
                    break;
                case 'owners':
                    csvData = await exportRevenueByParkingOwnersCSV(
                        new Date(startDate).toISOString(),
                        new Date(endDate).toISOString()
                    );
                    fileName = `revenue_by_parking_owners_${startDate}_${endDate}.csv`;
                    break;
                case 'subscriptions':
                    csvData = await exportSubscriptionPaymentsCSV(
                        new Date(startDate).toISOString(),
                        new Date(endDate).toISOString()
                    );
                    fileName = `subscription_payments_${startDate}_${endDate}.csv`;
                    break;
                default:
                    alert('Please select a report type to export');
                    return;
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([csvData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    const reports = [
        { id: 'revenue', label: 'Revenue by Region', icon: FaMoneyBillWave },
        { id: 'reservations', label: 'Reservations by Location', icon: FaMapMarkerAlt },
        { id: 'users', label: 'User Registrations', icon: FaUsers },
        { id: 'owners', label: 'Revenue by Owners', icon: FaBuilding },
        { id: 'subscriptions', label: 'Subscription Payments', icon: FaCreditCard }
    ];

    const timeRanges = [
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
        { id: 'quarter', label: 'This Quarter' },
        { id: 'year', label: 'This Year' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Admin Reports & Analytics
                        </h1>
                        <p className="text-gray-600">
                            Comprehensive insights into system performance and user activity
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={handleExportReport}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2 transition-colors"
                        >
                            <FaDownload />
                            <span>Export Report</span>
                        </button>
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                            <FaPrint />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {reports.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => setSelectedReport(report.id)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    selectedReport === report.id
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <report.icon className="text-xl" />
                                    <span className="font-medium">{report.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Range Filter */}
                <div className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <h3 className="text-md font-medium text-gray-900">Time Range</h3>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            {/* Date Range Inputs */}
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
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
                            </div>
                            
                            {/* Quick Date Buttons */}
                            <div className="flex space-x-2">
                                {timeRanges.map((range) => (
                                    <button
                                        key={range.id}
                                        onClick={() => {
                                            setSelectedTimeRange(range.id);
                                            // Set date range based on selection
                                            const now = new Date();
                                            let start, end;
                                            
                                            switch(range.id) {
                                                case 'week':
                                                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                                    end = now;
                                                    break;
                                                case 'month':
                                                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                                                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                                    break;
                                                case 'quarter':
                                                    const quarter = Math.floor(now.getMonth() / 3);
                                                    start = new Date(now.getFullYear(), quarter * 3, 1);
                                                    end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                                                    break;
                                                case 'year':
                                                    start = new Date(now.getFullYear(), 0, 1);
                                                    end = new Date(now.getFullYear(), 11, 31);
                                                    break;
                                                default:
                                                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                                                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                            }
                                            
                                            setStartDate(start.toISOString().split('T')[0]);
                                            setEndDate(end.toISOString().split('T')[0]);
                                        }}
                                        className={`px-3 py-1 text-sm rounded-lg ${
                                            selectedTimeRange === range.id
                                                ? 'bg-cyan-100 text-cyan-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Date Range Display */}
                    {startDate && endDate && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Showing data from <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span> to <span className="font-medium">{new Date(endDate).toLocaleDateString()}</span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setSelectedTimeRange('month');
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
                {selectedReport === 'revenue' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(3210000)}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaMoneyBillWave className="text-green-600 text-lg" />
                                    </div>
                                </div>
                                <div className="flex items-center mt-2 text-sm">
                                    <FaDownload className="text-green-500 mr-1" />
                                    <span className="text-green-600">+7.4% from last month</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(3890)}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaCar className="text-blue-600 text-lg" />
                                    </div>
                                </div>
                                <div className="flex items-center mt-2 text-sm">
                                    <FaDownload className="text-green-500 mr-1" />
                                    <span className="text-green-600">+12.8% from last month</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Regions</p>
                                        <p className="text-xl font-bold text-gray-900">9</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaGlobe className="text-purple-600 text-lg" />
                                    </div>
                                </div>
                                <div className="flex items-center mt-2 text-sm">
                                    <FaDownload className="text-green-500 mr-1" />
                                    <span className="text-green-600">+2 new regions</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Revenue/Booking</p>
                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(825)}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <FaChartBar className="text-yellow-600 text-lg" />
                                    </div>
                                </div>
                                <div className="flex items-center mt-2 text-sm">
                                    <FaDownload className="text-green-500 mr-1" />
                                    <span className="text-green-600">+5.2% from last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Revenue by Province Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Revenue by Province</h3>
                            </div>
                            {loadingRevenue ? (
                                <div className="text-center py-10">Loading...</div>
                            ) : revenueError ? (
                                <div className="text-center text-red-500 py-10">{revenueError}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={revenueByRegion}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="region" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip 
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                            labelStyle={{ color: '#374151' }}
                                        />
                                        <Bar dataKey="revenue" fill="#0891b2" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Revenue Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Revenue Breakdown</h3>
                            <div className="overflow-x-auto">
                                {loadingRevenue ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : revenueError ? (
                                    <div className="text-center text-red-500 py-10">{revenueError}</div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parking Areas</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {revenueByRegion.map((region, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{region.region}</td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(region.revenue)}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{formatNumber(region.bookings)}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{region.parkingAreas}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            {getGrowthIcon(region.growth)}
                                                            <span className={`text-sm font-medium ${getGrowthColor(region.growth)}`}>
                                                                {region.growth}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium">
                                                        <button className="text-cyan-600 hover:text-cyan-900">
                                                            <FaEye />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            {/* Optionally show summary */}
                            {revenueSummary && (
                                <div className="mt-4 text-sm text-gray-700">
                                    <strong>Total Revenue:</strong> {formatCurrency(revenueSummary.totalRevenue)} | <strong>Total Bookings:</strong> {formatNumber(revenueSummary.totalBookings)} | <strong>Total Parking Areas:</strong> {formatNumber(revenueSummary.totalParkingAreas)} | <strong>Avg. Growth:</strong> {revenueSummary.averageGrowthPercentage}%
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedReport === 'reservations' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingReservations ? '...' : formatNumber(reservationsSummary?.totalReservations || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaCar className="text-blue-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingReservations ? '...' : formatCurrency(reservationsSummary?.totalRevenue || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaMoneyBillWave className="text-green-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Revenue/Reservation</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingReservations ? '...' : formatCurrency(reservationsSummary?.averageRevenuePerReservation || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <FaChartBar className="text-yellow-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Cities</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingReservations ? '...' : reservationsByCity.length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaMapMarkerAlt className="text-purple-600 text-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reservations Revenue by City Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Reservations Revenue by City</h3>
                            </div>
                            {loadingReservations ? (
                                <div className="text-center py-10">Loading...</div>
                            ) : reservationsError ? (
                                <div className="text-center text-red-500 py-10">{reservationsError}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={reservationsByCity}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="city" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip 
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                            labelStyle={{ color: '#374151' }}
                                        />
                                        <Bar dataKey="revenue" fill="#0891b2" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Reservations by City Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Reservations Breakdown</h3>
                            <div className="overflow-x-auto">
                                {loadingReservations ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : reservationsError ? (
                                    <div className="text-center text-red-500 py-10">{reservationsError}</div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservations</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Revenue</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {reservationsByCity.map((city, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{city.city}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{city.district}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{city.province}</td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatNumber(city.reservations)}</td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(city.revenue)}</td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(city.averageRevenue)}</td>
                                                    <td className="px-4 py-4 text-sm font-medium">
                                                        <button className="text-cyan-600 hover:text-cyan-900">
                                                            <FaEye />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            {/* Optionally show summary */}
                            {reservationsSummary && (
                                <div className="mt-4 text-sm text-gray-700">
                                    <strong>Total Reservations:</strong> {formatNumber(reservationsSummary.totalReservations)} | <strong>Total Revenue:</strong> {formatCurrency(reservationsSummary.totalRevenue)} | <strong>Avg. Revenue per Reservation:</strong> {formatCurrency(reservationsSummary.averageRevenuePerReservation)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedReport === 'users' && (
                    <div className="space-y-6">
                        {/* User Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(mockData.userStats.totalUsers)}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaUsers className="text-blue-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Customers</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(mockData.userStats.customers)}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaUser className="text-green-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Parking Owners</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(mockData.userStats.owners)}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaBuilding className="text-purple-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Managers</p>
                                        <p className="text-xl font-bold text-gray-900">{formatNumber(mockData.userStats.managers)}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <FaUserTie className="text-yellow-600 text-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Registration Trend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registration Trend</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={mockData.userRegistrations}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip 
                                        formatter={(value, name) => [formatNumber(value), name]}
                                        labelStyle={{ color: '#374151' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="customers" 
                                        stackId="1"
                                        stroke="#10b981" 
                                        fill="#10b981" 
                                        fillOpacity={0.6}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="owners" 
                                        stackId="1"
                                        stroke="#8b5cf6" 
                                        fill="#8b5cf6" 
                                        fillOpacity={0.6}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="managers" 
                                        stackId="1"
                                        stroke="#f59e0b" 
                                        fill="#f59e0b" 
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* User Role Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Customers', value: mockData.userStats.customers, fill: '#10b981' },
                                                { name: 'Owners', value: mockData.userStats.owners, fill: '#8b5cf6' },
                                                { name: 'Managers', value: mockData.userStats.managers, fill: '#f59e0b' }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        />
                                        <Tooltip formatter={(value) => [formatNumber(value), 'Users']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Status</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-gray-900">Active Users</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{formatNumber(mockData.userStats.activeUsers)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="font-medium text-gray-900">Inactive Users</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{formatNumber(mockData.userStats.inactiveUsers)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'owners' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingParkingOwners ? '...' : formatCurrency(parkingOwnersSummary?.totalRevenue || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaMoneyBillWave className="text-green-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Owners</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingParkingOwners ? '...' : parkingOwnersSummary?.totalOwners || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaBuilding className="text-blue-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingParkingOwners ? '...' : formatNumber(parkingOwnersSummary?.totalBookings || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaCar className="text-purple-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Revenue/Owner</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingParkingOwners ? '...' : formatCurrency(parkingOwnersSummary?.averageRevenuePerOwner || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <FaChartBar className="text-yellow-600 text-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue by Owners Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Revenue by Parking Owners</h3>
                            </div>
                            {loadingParkingOwners ? (
                                <div className="text-center py-10">Loading...</div>
                            ) : parkingOwnersError ? (
                                <div className="text-center text-red-500 py-10">{parkingOwnersError}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={parkingOwnersRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="ownerName" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip 
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                            labelStyle={{ color: '#374151' }}
                                        />
                                        <Bar dataKey="totalRevenue" fill="#0891b2" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Revenue by Owners Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Owner Breakdown</h3>
                            <div className="overflow-x-auto">
                                {loadingParkingOwners ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : parkingOwnersError ? (
                                    <div className="text-center text-red-500 py-10">{parkingOwnersError}</div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parking Areas</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Revenue/Area</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {parkingOwnersRevenue.map((owner, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{owner.ownerName}</p>
                                                            <p className="text-xs text-gray-500">{owner.ownerId}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center space-x-1">
                                                                <FaPhone className="text-gray-400 w-3 h-3" />
                                                                <span className="text-xs">{owner.ownerContact}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <FaEnvelope className="text-gray-400 w-3 h-3" />
                                                                <span className="text-xs">{owner.ownerEmail}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(owner.totalRevenue)}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{formatNumber(owner.totalBookings)}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{owner.totalParkingAreas}</td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(owner.averageRevenuePerParkingArea)}</td>
                                                    <td className="px-4 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button className="text-cyan-600 hover:text-cyan-900">
                                                                <FaEye />
                                                            </button>
                                                            <button className="text-blue-600 hover:text-blue-900">
                                                                <FaPhone />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            {/* Optionally show summary */}
                            {parkingOwnersSummary && (
                                <div className="mt-4 text-sm text-gray-700">
                                    <strong>Total Owners:</strong> {formatNumber(parkingOwnersSummary.totalOwners)} | <strong>Total Revenue:</strong> {formatCurrency(parkingOwnersSummary.totalRevenue)} | <strong>Total Bookings:</strong> {formatNumber(parkingOwnersSummary.totalBookings)} | <strong>Total Parking Areas:</strong> {formatNumber(parkingOwnersSummary.totalParkingAreas)} | <strong>Avg. Revenue per Owner:</strong> {formatCurrency(parkingOwnersSummary.averageRevenuePerOwner)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedReport === 'subscriptions' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingSubscriptionPayments ? '...' : formatCurrency(subscriptionPaymentsSummary?.totalAmount || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaMoneyBillWave className="text-green-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingSubscriptionPayments ? '...' : formatNumber(subscriptionPaymentsSummary?.totalPayments || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaCreditCard className="text-blue-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingSubscriptionPayments ? '...' : subscriptionPaymentsSummary ? 
                                                Math.round((subscriptionPaymentsSummary.successfulPayments / subscriptionPaymentsSummary.totalPayments) * 100) : 0}%
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaChartBar className="text-purple-600 text-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Amount</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {loadingSubscriptionPayments ? '...' : formatCurrency(subscriptionPaymentsSummary?.averageAmount || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <FaMoneyBillWave className="text-yellow-600 text-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
                                {loadingSubscriptionPayments ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : subscriptionPaymentsError ? (
                                    <div className="text-center text-red-500 py-10">{subscriptionPaymentsError}</div>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={(() => {
                                                        const statusCounts = {};
                                                        subscriptionPayments.forEach(payment => {
                                                            statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;
                                                        });
                                                        const total = subscriptionPayments.length;
                                                        const colors = { 'SUCCESS': '#10b981', 'PENDING': '#f59e0b', 'FAILED': '#ef4444' };
                                                        return Object.entries(statusCounts).map(([status, count]) => ({
                                                            status,
                                                            count,
                                                            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
                                                            color: colors[status] || '#6b7280'
                                                        }));
                                                    })()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                >
                                                    {(() => {
                                                        const statusCounts = {};
                                                        subscriptionPayments.forEach(payment => {
                                                            statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;
                                                        });
                                                        const total = subscriptionPayments.length;
                                                        const colors = { 'SUCCESS': '#10b981', 'PENDING': '#f59e0b', 'FAILED': '#ef4444' };
                                                        return Object.entries(statusCounts).map(([status, count], index) => (
                                                            <Cell key={`cell-${index}`} fill={colors[status] || '#6b7280'} />
                                                        ));
                                                    })()}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [formatNumber(value), 'Payments']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="mt-4 space-y-2">
                                            {(() => {
                                                const statusCounts = {};
                                                subscriptionPayments.forEach(payment => {
                                                    statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;
                                                });
                                                const total = subscriptionPayments.length;
                                                const colors = { 'SUCCESS': '#10b981', 'PENDING': '#f59e0b', 'FAILED': '#ef4444' };
                                                return Object.entries(statusCounts).map(([status, count], index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[status] || '#6b7280' }}></div>
                                                            <span className="text-sm text-gray-600">{status}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Distribution</h3>
                                {loadingSubscriptionPayments ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : subscriptionPaymentsError ? (
                                    <div className="text-center text-red-500 py-10">{subscriptionPaymentsError}</div>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={(() => {
                                                        const methodCounts = {};
                                                        subscriptionPayments.forEach(payment => {
                                                            methodCounts[payment.paymentMethod] = (methodCounts[payment.paymentMethod] || 0) + 1;
                                                        });
                                                        const total = subscriptionPayments.length;
                                                        const colors = { 'CARD': '#3b82f6', 'BANK_TRANSFER': '#10b981', 'MOBILE_PAYMENT': '#8b5cf6' };
                                                        return Object.entries(methodCounts).map(([method, count]) => ({
                                                            method,
                                                            count,
                                                            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
                                                            color: colors[method] || '#6b7280'
                                                        }));
                                                    })()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                >
                                                    {(() => {
                                                        const methodCounts = {};
                                                        subscriptionPayments.forEach(payment => {
                                                            methodCounts[payment.paymentMethod] = (methodCounts[payment.paymentMethod] || 0) + 1;
                                                        });
                                                        const colors = { 'CARD': '#3b82f6', 'BANK_TRANSFER': '#10b981', 'MOBILE_PAYMENT': '#8b5cf6' };
                                                        return Object.entries(methodCounts).map(([method, count], index) => (
                                                            <Cell key={`cell-${index}`} fill={colors[method] || '#6b7280'} />
                                                        ));
                                                    })()}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [formatNumber(value), 'Payments']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="mt-4 space-y-2">
                                            {(() => {
                                                const methodCounts = {};
                                                subscriptionPayments.forEach(payment => {
                                                    methodCounts[payment.paymentMethod] = (methodCounts[payment.paymentMethod] || 0) + 1;
                                                });
                                                const total = subscriptionPayments.length;
                                                const colors = { 'CARD': '#3b82f6', 'BANK_TRANSFER': '#10b981', 'MOBILE_PAYMENT': '#8b5cf6' };
                                                return Object.entries(methodCounts).map(([method, count], index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[method] || '#6b7280' }}></div>
                                                            <span className="text-sm text-gray-600">{method.replace('_', ' ')}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Subscription Payments Trend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Payments Trend</h3>
                            {loadingSubscriptionPayments ? (
                                <div className="text-center py-10">Loading...</div>
                            ) : subscriptionPaymentsError ? (
                                <div className="text-center text-red-500 py-10">{subscriptionPaymentsError}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={400}>
                                    <ComposedChart data={(() => {
                                        // Group payments by month
                                        const monthlyData = {};
                                        subscriptionPayments.forEach(payment => {
                                            const month = payment.paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                            if (!monthlyData[month]) {
                                                monthlyData[month] = { month, payments: 0, revenue: 0 };
                                            }
                                            monthlyData[month].payments += 1;
                                            monthlyData[month].revenue += payment.amount;
                                        });
                                        
                                        // Convert to array and sort by date
                                        return Object.values(monthlyData).sort((a, b) => {
                                            const dateA = new Date(a.month);
                                            const dateB = new Date(b.month);
                                            return dateA - dateB;
                                        });
                                    })()}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis yAxisId="left" stroke="#6b7280" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                                        <Tooltip 
                                            formatter={(value, name) => [
                                                name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                                                name === 'revenue' ? 'Revenue' : 'Payments'
                                            ]}
                                            labelStyle={{ color: '#374151' }}
                                        />
                                        <Bar yAxisId="left" dataKey="payments" fill="#0891b2" radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Subscription Payments Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Payment Details</h3>
                            <div className="overflow-x-auto">
                                {loadingSubscriptionPayments ? (
                                    <div className="text-center py-10">Loading...</div>
                                ) : subscriptionPaymentsError ? (
                                    <div className="text-center text-red-500 py-10">{subscriptionPaymentsError}</div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parking Area</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription Period</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {subscriptionPayments.map((payment, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{payment.paymentId}</p>
                                                            <p className="text-xs text-gray-500">{payment.paymentReference}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{payment.ownerName}</p>
                                                            <p className="text-xs text-gray-500">{payment.ownerId}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">{payment.parkingAreaName}</td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                            payment.status === 'SUCCESS' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : payment.status === 'PENDING'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        <div className="flex items-center space-x-1">
                                                            {payment.paymentMethod === 'CARD' && <FaCreditCard className="text-blue-500" />}
                                                            {payment.paymentMethod === 'BANK_TRANSFER' && <FaBuilding className="text-green-500" />}
                                                            {payment.paymentMethod === 'MOBILE_PAYMENT' && <FaPhone className="text-purple-500" />}
                                                            <span className="text-xs">{payment.paymentMethod.replace('_', ' ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {payment.paymentDate.toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        <div>
                                                            <p className="text-xs">From: {payment.subscriptionStartDate.toLocaleDateString()}</p>
                                                            <p className="text-xs">To: {payment.subscriptionEndDate.toLocaleDateString()}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button className="text-cyan-600 hover:text-cyan-900">
                                                                <FaEye />
                                                            </button>
                                                            <button className="text-blue-600 hover:text-blue-900">
                                                                <FaDownload />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            {/* Optionally show summary */}
                            {subscriptionPaymentsSummary && (
                                <div className="mt-4 text-sm text-gray-700">
                                    <strong>Total Payments:</strong> {formatNumber(subscriptionPaymentsSummary.totalPayments)} | <strong>Total Amount:</strong> {formatCurrency(subscriptionPaymentsSummary.totalAmount)} | <strong>Successful:</strong> {formatNumber(subscriptionPaymentsSummary.successfulPayments)} | <strong>Failed:</strong> {formatNumber(subscriptionPaymentsSummary.failedPayments)} | <strong>Pending:</strong> {formatNumber(subscriptionPaymentsSummary.pendingPayments)} | <strong>Avg. Amount:</strong> {formatCurrency(subscriptionPaymentsSummary.averageAmount)}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReport;