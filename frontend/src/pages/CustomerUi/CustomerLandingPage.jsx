import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Truck, Bike, Bus, HelpCircle } from "lucide-react"

import {
    FaParking,
    FaCar,
    FaSearch,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaCreditCard,
    FaShieldAlt,
    FaMobileAlt,
    FaStar,
    FaBars,
    FaTimes,
    FaArrowRight,
    FaHistory,
    FaCheckCircle,
    FaClock as FaClockAlt,
    FaUser,
    FaSignOutAlt,
    FaPlus,
    FaList,
    FaBell,
    FaCog,
    FaHome,
    FaMapPin,
    FaTicketAlt,
    FaWallet,
    FaMotorcycle,
    FaBicycle,
    FaBus,
    FaTruck,
} from 'react-icons/fa';
import MapComponent from '../../utils/MapComponent';
import { toast, ToastContainer } from 'react-toastify';

const CustomerLandingPage = () => {
    const { authState, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchTime, setSearchTime] = useState('');
    const [position, setPosition] = useState(null);
    const [vehicleType, setVehicleType] = useState(["Car", "Truck", "Bike", "Bus", "Van"]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const [totalSpent, setTotalSpent] = useState(3500);

    console.log(position);

    // Mock data for customer dashboard
    const activeReservations = [
        {
            id: 1,
            location: 'Downtown Parking',
            date: '2024-01-15',
            time: '14:00',
            duration: '2 hours',
            status: 'Active',
            spotNumber: 'A-12'
        },
        {
            id: 2,
            location: 'Airport Parking',
            date: '2024-01-16',
            time: '09:00',
            duration: '4 hours',
            status: 'Active',
            spotNumber: 'B-05'
        }
    ];

    const upcomingReservations = [
        {
            id: 3,
            location: 'Shopping Mall Parking',
            date: '2024-01-18',
            time: '16:00',
            duration: '3 hours',
            status: 'Upcoming',
            spotNumber: 'C-08'
        }
    ];

    const recentHistory = [
        {
            id: 4,
            location: 'University Parking',
            date: '2024-01-10',
            time: '10:00',
            duration: '2 hours',
            status: 'Completed',
            amount: '$5.00'
        },
        {
            id: 5,
            location: 'Hospital Parking',
            date: '2024-01-08',
            time: '13:00',
            duration: '1 hour',
            status: 'Completed',
            amount: '$3.00'
        }
    ];

    const quickActions = [
        {
            icon: <FaPlus className="text-xl" />,
            title: 'Book Spot',
            description: 'Find & reserve parking',
            link: '/reservation/find-parking-spot',
            color: 'bg-gradient-to-r from-cyan-500 to-blue-500'
        },
        {
            icon: <FaList className="text-xl" />,
            title: 'History',
            description: 'Past reservations',
            link: '/reservation/history',
            color: 'bg-gradient-to-r from-blue-500 to-indigo-500'
        },
        {
            icon: <FaCheckCircle className="text-xl" />,
            title: 'Active',
            description: 'Current bookings',
            link: '/reservation/active',
            color: 'bg-gradient-to-r from-green-500 to-emerald-500'
        },
        {
            icon: <FaClockAlt className="text-xl" />,
            title: 'Upcoming',
            description: 'Future bookings',
            link: '/reservation/upcoming',
            color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        }
    ];

    const getVehicleType = (type) => {
        switch (type) {
            case 'car':
                return <Car className="w-8 h-8 md:w-10 md:h-10" />;
            case 'truck':
                return <Truck className="w-8 h-8 md:w-10 md:h-10" />;
            case 'bike':
                return <Bike className="w-8 h-8 md:w-10 md:h-10" />;
            case 'bus':
                return <Bus className="w-8 h-8 md:w-10 md:h-10" />;
            default:
                return <HelpCircle className="w-8 h-8 md:w-10 md:h-10" />;
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search:', { searchLocation, searchDate, searchTime });
    };

    const handleLogout = () => {
        logout(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Upcoming':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const selectedVehicleType = (type) => {
        setSelectedVehicle(type);
    }

    const BottomNavItem = ({ icon, label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-gray-500'
                }`}
        >
            <div className={`text-lg mb-1 ${isActive ? 'text-cyan-600' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span className="text-xs font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col mt-[-20px]">
            {/* Mobile Header */}
            {/* <header className="bg-white shadow-sm sticky top-0 z-50 md:hidden">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <FaParking className="h-6 w-6 text-cyan-600" />
                        <span className="text-lg font-bold text-gray-900">FindMySpot</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="p-2">
                            <FaBell className="h-5 w-5 text-gray-600" />
                        </button>
                        <button 
                            className="p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <FaTimes className="h-5 w-5 text-gray-600" />
                            ) : (
                                <FaBars className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

               
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                                    <FaUser className="text-cyan-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {authState.user?.firstName} {authState.user?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{authState.user?.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="py-2">
                            <Link to="/customer/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                                <FaUser className="mr-3 text-gray-400" />
                                Profile
                            </Link>
                            <Link to="/customer/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                                <FaCog className="mr-3 text-gray-400" />
                                Settings
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50"
                            >
                                <FaSignOutAlt className="mr-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header> */}

            {/* Desktop Header */}
            {/* <header className="hidden md:block bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FaParking className="h-8 w-8 text-cyan-600" />
                            <span className="text-xl font-bold text-gray-900">FindMySpot</span>
                        </div>
                        <nav className="flex items-center space-x-6">
                            <Link to="/customer" className="text-cyan-600 font-medium">Dashboard</Link>
                            <Link to="/customer/history" className="text-gray-600 hover:text-cyan-600">History</Link>
                            <Link to="/customer/profile" className="text-gray-600 hover:text-cyan-600">Profile</Link>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </header> */}

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0">
                {/* Welcome Section */}
                <section className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                        <div className="text-center">
                            <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
                                Welcome back, {authState.user?.firstName}!
                            </h1>
                            <p className="text-lg md:text-xl text-cyan-100 mb-6 md:mb-8">
                                Find Your Parking Spot Now!
                            </p>

                            {/* Vehicle Selection Card */}
                            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6">
                                <h2 className="text-xl md:text-2xl text-gray-800 font-bold text-center mb-4">
                                    INSTANT PARKING SPOT FINDER
                                </h2>

                                <div className="text-center mb-6">
                                    <label className="text-sm md:text-base font-bold text-gray-700 block mb-3">
                                        {!selectedVehicle ? "SELECT VEHICLE TYPE" : `SELECTED: ${selectedVehicle.toUpperCase()}`}
                                    </label>

                                    {!selectedVehicle ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            {vehicleType.map((type, index) => (
                                                <button
                                                    key={index}
                                                    className="flex flex-col items-center bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                                    onClick={() => selectedVehicleType(type)}
                                                >
                                                    {getVehicleType(type?.toLowerCase())}
                                                    <span className="text-xs font-bold mt-1">{type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex flex-col items-center bg-gradient-to-br from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
                                                {getVehicleType(selectedVehicle?.toLowerCase())}
                                                <span className="text-sm font-bold mt-2">{selectedVehicle}</span>
                                            </div>
                                            <button
                                                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                                                onClick={() => setSelectedVehicle(null)}
                                            >
                                                Change Vehicle
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {selectedVehicle && (
                                    <>
                                        <div className="mb-4 z-0 relative">
                                            <MapComponent
                                                ref={mapRef}
                                                position={position}
                                                setPosition={setPosition}
                                                zoom={15}
                                                height="200px"
                                                message="Pick your current location"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 block mb-1">LONGITUDE</label>
                                                    <input
                                                        type="text"
                                                        value={position?.lng || ""}
                                                        disabled
                                                        className="w-full p-2 text-sm text-gray-800 rounded-lg border-2 border-gray-200 text-center bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 block mb-1">LATITUDE</label>
                                                    <input
                                                        type="text"
                                                        value={position?.lat || ""}
                                                        disabled
                                                        className="w-full p-2 text-sm text-gray-800 rounded-lg border-2 border-gray-200 text-center bg-gray-50"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                                                onClick={() => mapRef.current.getLocation()}
                                            >
                                                Reset Location
                                            </button>

                                            <button
                                                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-200 font-bold text-sm transform hover:scale-105 active:scale-95"
                                                onClick={() => navigate("/reservation/find-parking-spot", {
                                                    state: {
                                                        vehicleType: selectedVehicle,
                                                        position: position,
                                                        startDateAndTime: new Date(),
                                                        endDateAndTime: new Date(new Date().setHours(new Date().getHours() + 1))
                                                    }
                                                })}
                                            >
                                                Find Parking Spot
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Section */}
                <section className="py-6 md:py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-6 md:mb-8">
                            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                                Quick Actions
                            </h2>
                            <p className="text-gray-600 text-sm md:text-base">
                                What would you like to do today?
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 ">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className={`${action.color} text-white rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95`}
                                >
                                    <div className="flex justify-center mb-3">
                                        {action.icon}
                                    </div>
                                    <h3 className="text-sm md:text-lg font-semibold mb-1">{action.title}</h3>
                                    <p className="text-xs md:text-sm opacity-90">{action.description}</p>
                                </Link>
                            ))}
                        </div>
                        {/* <div className="fixed bottom-0 left-0 w-full bg-white shadow-md z-50">
                            <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-6 p-4">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        to={action.link}
                                        className={`${action.color} text-white rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95`}
                                    >
                                        <div className="flex justify-center mb-3">
                                            {action.icon}
                                        </div>
                                        <h3 className="text-sm md:text-lg font-semibold mb-1">{action.title}</h3>
                                        <p className="text-xs md:text-sm opacity-90">{action.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </div> */}

                    </div>
                </section>

                {/* Reservations Section */}
                <section className="py-6 md:py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                                Active Reservations
                            </h2>
                            <Link
                                to="/reservation/active"
                                className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center text-sm"
                            >
                                View All <FaArrowRight className="ml-1" />
                            </Link>
                        </div>

                        <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
                            {activeReservations.map((reservation) => (
                                <div key={reservation.id} className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-2">
                                            <FaTicketAlt className="text-cyan-500" />
                                            <h3 className="font-semibold text-gray-900 text-sm md:text-base">{reservation.location}</h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                            {reservation.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-xs md:text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="mr-2 text-gray-400" />
                                            {reservation.date}
                                        </div>
                                        <div className="flex items-center">
                                            <FaClock className="mr-2 text-gray-400" />
                                            {reservation.time} ({reservation.duration})
                                        </div>
                                        <div className="flex items-center">
                                            <FaMapPin className="mr-2 text-gray-400" />
                                            Spot: {reservation.spotNumber}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-6 md:py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                            Your Parking Stats
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl p-4 text-center">
                                <div className="text-2xl md:text-3xl font-bold mb-1">{activeReservations.length}</div>
                                <div className="text-cyan-100 text-xs md:text-sm">Active</div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
                                <div className="text-2xl md:text-3xl font-bold mb-1">{upcomingReservations.length}</div>
                                <div className="text-blue-100 text-xs md:text-sm">Upcoming</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
                                <div className="text-2xl md:text-3xl font-bold mb-1">{recentHistory.length}</div>
                                <div className="text-green-100 text-xs md:text-sm">Completed</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
                                <div className="text-2xl md:text-3xl font-bold mb-1">Rs. {totalSpent}</div>
                                <div className="text-purple-100 text-xs md:text-sm">Total Spent</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex items-center justify-around">
                    <BottomNavItem
                        icon={<FaHome />}
                        label="Home"
                        isActive={activeTab === 'home'}
                        onClick={() => setActiveTab('home')}
                    />
                    <BottomNavItem
                        icon={<FaSearch />}
                        label="Find"
                        isActive={activeTab === 'find'}
                        onClick={() => setActiveTab('find')}
                    />
                    <BottomNavItem
                        icon={<FaTicketAlt />}
                        label="Bookings"
                        isActive={activeTab === 'bookings'}
                        onClick={() => setActiveTab('bookings')}
                    />
                    <BottomNavItem
                        icon={<FaUser />}
                        label="Profile"
                        isActive={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    />
                </div>
            </nav>

            <ToastContainer />
        </div>
    );
};

export default CustomerLandingPage;