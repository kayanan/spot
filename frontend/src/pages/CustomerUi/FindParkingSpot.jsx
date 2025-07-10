import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapComponent from '../../utils/MapComponent';
import { FaMapMarkerAlt, FaCar, FaMotorcycle, FaBus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import CustomPointsMapContainer from '../../utils/CustomPointsMapContainer';
import SpotDetailsPopup from '../../utils/SpotDetailsPopup';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import handlePayment from '../../utils/payherePaymentOption';
import axios from 'axios';
import dayjs from 'dayjs'


const vehicleTypes = [
    { label: 'Car', value: 'car', icon: <FaCar /> },
    { label: 'Motorcycle', value: 'motorcycle', icon: <FaMotorcycle /> },
    { label: 'Bus', value: 'bus', icon: <FaBus /> },
    { label: 'Van', value: 'van', icon: <FaCar /> },
];

const FindParkingSpot = () => {
    const { authState } = useAuth();
    const mapRef = useRef(null);
    const navigate = useNavigate();
    const { vehicleType, position: positionFromState, startDateAndTime, endDateAndTime } = useLocation().state || {};
    const [selectedArea, setSelectedArea] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedSpotData, setSelectedSpotData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [parkingSpots, setParkingSpots] = useState([]);
    const [position, setPosition] = useState(positionFromState || null);
    const [zoom, setZoom] = useState(12);
    const [isMapWorking, setIsMapWorking] = useState(false);
    const [filters, setFilters] = useState({
        startTime: startDateAndTime ? new Date(startDateAndTime) : null,
        endTime: endDateAndTime ? new Date(endDateAndTime) : null,
        vehicleType: vehicleType?.toLowerCase() || '',
        radius: 10000,
        coords: position,
    });
    const [errors, setErrors] = useState({
        startDateAndTime: '',
        endDateAndTime: '',
        vehicleType: '',
        radius: '',
        coords: '',
    });

    useEffect(() => {
        setFilters(prev => ({ ...prev, coords: position }));
    }, [position]);

    useEffect(() => {
        if (selectedArea && position) {
            const getDistance = async () => {
                try {
                    setIsLoading(true);
                    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${selectedArea.coords[1]},${selectedArea.coords[0]};${position.lng},${position.lat}?overview=false`)

                    const spotData = {
                        id: selectedArea.id,
                        name: authState.user.firstName + " " + authState.user.lastName,
                        lat: selectedArea.coords[0],
                        lng: selectedArea.coords[1],
                        address: 'Location',
                        available: true,
                        vehicleType: vehicleType,
                        price: selectedArea.price || 0,
                        rating: selectedArea.rating || 0,
                        distance: (+(response.data.routes[0].distance) / 1000)?.toFixed(2)
                    };

                    setSelectedSpotData(spotData);
                    setIsPopupOpen(true);
                    setIsLoading(false);

                } catch (error) {
                    setIsLoading(false);
                    toast.error(`Error: Could't Calculate Distance`);
                    setSelectedSpotData({
                        id: selectedArea.id,
                        name: authState.user.firstName + " " + authState.user.lastName,
                        lat: selectedArea.coords[0],
                        lng: selectedArea.coords[1],
                        address: 'Location',
                        available: true,
                        vehicleType: vehicleType,
                        price: selectedArea.price || 0,
                        rating: selectedArea.rating || 0,
                        distance: "N/A"

                    });
                    setIsPopupOpen(true);

                }
            }
            getDistance();
        }

    }, [selectedArea]);
    useEffect(() => {

        if (filters.radius / 1000 <= 1) {

            setZoom(16);
        } else if (filters.radius / 1000 <= 5) {
            setZoom(14);
        } else if (filters.radius / 1000 <= 50) {
            setZoom(12);
        } else if (filters.radius / 1000 <= 100) {
            setZoom(10);
        } else if (filters.radius / 1000 <= 200) {
            setZoom(9);
        } else if (filters.radius / 1000 <= 300) {
            setZoom(8);
        } else if (filters.radius / 1000 <= 500) {
            setZoom(7);
        } else {

            setZoom(6);
        }
    }, [filters.radius]);

    useEffect(() => {
        try {

            const setTimeOut = setTimeout(() => {
                if (filters.vehicleType && filters.startTime) {
                    getParkingSpots();
                }
            }, 1000)


            return () => clearTimeout(setTimeOut);


        } catch (error) {
            toast.error("Failed to fetch parking spots");
            console.log(error, "error");
        }

    }, [position, filters.radius]);

    const getParkingSpots = async () => {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area/nearest-parking-spots`, filters)
        const filteredResponse = response.data.map(item => ({
            id: item._id,
            name: item.parkingArea.name,
            coords: [item?.parkingArea?.location?.coordinates[1], item?.parkingArea?.location?.coordinates[0]],
            address: item?.parkingArea?.addressLine1 + " " + item?.parkingArea?.addressLine2,
            slotCount: item?.slotCount,
            vehicleType: item?.vehicleType,
            price: item?.price,
            rating: item?.parkingArea?.averageRating || 0,
            available: item?.slotCount > 0,
            city: item?.parkingArea?.city,
            district: item?.parkingArea?.district,
            province: item?.parkingArea?.province

        }));
        setParkingSpots(filteredResponse);
    }

    const handleReservationSubmit = async (reservationData) => {
        setIsLoading(true);
        try {
            const data = {
                parkingArea: selectedArea.id,
                startDateAndTime: filters?.startTime ? new Date(filters?.startTime) : new Date(),
                endDateAndTime: filters?.endTime ? new Date(filters?.endTime) : null,
                user: authState.user.userId,
                type: "pre_booking",
                vehicleNumber: reservationData.vehicleNumber.replace(/\s+/g, ''),
                vehicleType: vehicleType || filters?.vehicleType,
                perHourRate: selectedArea.price,
                status: "pending",
                customerMobile: reservationData.customerMobile,
                createdBy: authState.user.userId,
            }

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/pre-booking`, data)
            const paymentDetails = {
                order_id: response.data.data._id,
                amount: selectedArea.price.toFixed(2),
                currency: "LKR",
                return_url: `/customer/find-parking-spot`,
                cancel_url: `/customer/find-parking-spot`,
                notify_url: `${import.meta.env.VITE_BACKEND_APP_URL_PUBLIC}/api/v1/reservation-payment/notify`,
                first_name: authState.user.firstName,
                last_name: authState.user.lastName,
                email: authState.user.email,
                phone: authState.user.phoneNumber,
                address: selectedArea.address || "No Address",
                city: selectedArea.city || "No City",
                country: "Sri Lanka",
                items: "Parking Reservation",
                custom_1: authState.user.userId,
                custom_2: response.data.data.parkingSlot,
            }
            handlePayment(
                {
                    paymentDetails,
                    onComplete: () => { navigate("/customer-landing-page") },
                    hashUrl: `/v1/reservation-payment/generate-hash`
                })



        } catch (error) {
            console.log(error, "error");
            toast.error('Failed to confirm reservation. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedSpotData(null);
        setSelectedArea(null);
    };

    const handleFilterSubmit = () => {
        const errors = {};
        if (!filters.startTime) {
            errors.startTime = "Arrival time is required";
        }
        if (filters.startTime && dayjs(filters.startTime).isBefore(dayjs())) {
            errors.startTime = "Arrival time must be in the future";
        }
        if (!filters.vehicleType) {
            errors.vehicleType = "Vehicle type is required";
        }
        if (filters.endTime && dayjs(filters.endTime).isBefore(dayjs(filters.startTime))) {
            errors.endTime = "Departure time must be after arrival time";
        }
        setErrors(errors);
        if (Object.keys(errors).length === 0) {
            getParkingSpots();
        }

    }



    return (
        <div className="min-h-screen bg-gray-100">
            {/* Back Arrow Navigation */}
            <div className="max-w-7xl mx-auto">
                <button
                    className="flex items-center gap-2 mt-4 ml-2 text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 font-semibold text-lg rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 lg:mt-8 lg:ml-0"
                    onClick={() => navigate('/customer-landing-page')}
                >
                    <FaArrowLeft className="text-xl" />
                    <span className="hidden sm:inline">Back to Home</span>
                </button>
            </div>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
                        <p className="text-gray-600 font-medium">Finding parking spots...</p>
                    </div>
                </div>
            )}

            {/* Mobile Layout */}
            <div className="lg:hidden max-w-md mx-auto bg-white min-h-screen shadow-lg">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 text-white">
                    <h1 className="text-2xl font-bold text-center">Find Parking</h1>
                    <p className="text-center text-cyan-100 mt-1">Discover available spots near you</p>
                </div>

                {/* Main Content */}
                <div className="p-3 space-y-3">
                    {/* Search Form Section */}
                    {(!vehicleType || !position) && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Location Map */}
                          <div className="relative">
                                <div className="h-40 bg-gray-50 z-0 relative">
                                    <MapComponent
                                        ref={mapRef}
                                        position={position}
                                        setPosition={setPosition}
                                        zoom={12}
                                        height="100%"
                                        message="Tap to set your location"
                                        setIsMapWorking
                                    />
                                </div>
                                <div className="absolute top-2 left-2 right-2">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                                        <p className="text-xs text-gray-600 text-center">Tap on the map to select your location</p>
                                    </div>
                                </div>
                            </div>

                            {/* Coordinates Display */}
                            <div className="p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Longitude</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-center"
                                            value={Number(position?.lng)?.toFixed(6)}
                                            onChange={(e) => { setPosition({ ...position, lng: Number(e.target.value) }) }}
                                            disabled={position?false:true}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Latitude</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-center"
                                            value={Number(position?.lat)?.toFixed(6)}
                                            onChange={(e) => { setPosition({ ...position, lat: Number(e.target.value) }) }}
                                            disabled={position?false:true}
                                        />
                                    </div>
                                </div>
                                (isMapWorking && <button
                                    className="w-full p-2 bg-cyan-500 text-white rounded-lg text-sm font-medium active:bg-cyan-600 transition-colors"
                                    onClick={() => mapRef.current.getLocation()}
                                >
                                    📍 Use Current Location
                                </button>)
                            </div>

                            {/* Booking Form */}
                            <div className="p-3 space-y-3 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Booking Details</h3>

                                {/* Vehicle Type */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Vehicle Type</label>
                                    <select
                                        value={filters.vehicleType}
                                        onChange={e => setFilters(f => ({ ...f, vehicleType: e.target.value }))}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="">Select your vehicle</option>
                                        {vehicleTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    {errors.vehicleType && <p className="text-red-500 text-sm">{errors.vehicleType}</p>}
                                </div>

                                {/* Date and Time */}
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Arrival Time</label>
                                        <input
                                            type="datetime-local"
                                            value={filters.startTime}
                                            onChange={e => setFilters(f => ({ ...f, startTime: e.target.value }))}
                                            min={new Date().toISOString().slice(0, 16)}
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        />
                                        {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Departure Time (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={filters.endTime}
                                            onChange={e => setFilters(f => ({ ...f, endTime: e.target.value }))}
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        />
                                        {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    className="w-full p-3 bg-emerald-500 text-white rounded-lg font-semibold text-lg active:bg-emerald-600 transition-colors shadow-lg"
                                    onClick={() => handleFilterSubmit()}
                                >
                                    🔍 Find Parking Spots
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    {parkingSpots?.length > 0 && (
                        <div className="space-y-3">
                            {/* Map View */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-52 bg-gray-50  z-0 relative">
                                    <CustomPointsMapContainer
                                        parkingSpots={parkingSpots}
                                        setSelectedArea={setSelectedArea}
                                        currentPosition={position}
                                        zoom={zoom}
                                    />
                                </div>

                                {/* Radius Filter */}
                                <div className="p-3 border-t border-gray-100">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-700">Search Radius</label>
                                            <span className="text-sm font-bold text-cyan-600">{filters.radius / 1000} km</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="300"
                                            value={filters.radius / 1000 || 0}
                                            onChange={(e) => setFilters(f => ({ ...f, radius: parseInt(e.target.value) * 1000 }))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>0 km</span>
                                            <span>300 km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parking Spots List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-3 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800">Available Spots</h3>
                                    <p className="text-sm text-gray-500 mt-1">Found {parkingSpots.length} parking areas</p>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {parkingSpots.map(spot => (
                                        <div
                                            key={spot.id}
                                            className={`p-3 active:bg-gray-50 transition-colors ${selectedSpotData?.id === spot.id
                                                    ? 'bg-cyan-50 border-l-4 border-l-cyan-500'
                                                    : ''
                                                }`}
                                            onClick={() => setSelectedArea(spot)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-cyan-500 text-2xl">
                                                    {vehicleTypes.find(v => v.value === spot.vehicleType)?.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-800 truncate">{spot.name}</div>
                                                    <div className="text-sm text-gray-600 truncate">{spot.address}</div>
                                                    <div className="text-xs text-gray-500">{spot.city}, {spot.district}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-cyan-600 text-lg">Rs.{spot?.price?.toFixed(0)}</div>
                                                    <div className="text-xs text-gray-500">per hour</div>
                                                    <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${spot.slotCount > 5
                                                            ? 'text-green-700 bg-green-100'
                                                            : 'text-orange-700 bg-orange-100'
                                                        }`}>
                                                        {spot.slotCount > 5 ? 'Available' : 'Limited'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="flex gap-4">
                        {/* Left Side - Search Form */}
                        {!position || !vehicleType &&(<div className="w-1/3">
                            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                                <h2 className="text-2xl font-bold text-cyan-700 mb-4">Find Parking</h2>

                                {/* Location Selection */}
                                <div className="space-y-3 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                                   <div className="bg-gray-50 rounded-lg p-3 h-40 z-0 relative">
                                        <MapComponent
                                            ref={mapRef}
                                            position={position}
                                            setPosition={setPosition}
                                            zoom={12}
                                            height="100%"
                                            message="Click to set your location"
                                            setIsMapWorking
                                            
                                        />
                                    </div>

                                    {/* Coordinates */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Longitude</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-center text-sm"
                                                value={position?.lng?.toFixed(6)}
                                                onChange={(e) => { setPosition({ ...position, lng: e.target.value }) }}
                                                disabled={position?.lng}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Latitude</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-center text-sm"
                                                value={position?.lat?.toFixed(6)}
                                                onChange={(e) => { setPosition({ ...position, lat: e.target.value }) }}
                                                disabled={!isMapWorking}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="w-full p-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors"
                                        onClick={() => mapRef.current.getLocation()}
                                    >
                                        📍 Use Current Location
                                    </button>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-800">Booking Details</h3>

                                    {/* Vehicle Type */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Vehicle Type</label>
                                        <select
                                            value={filters.vehicleType}
                                            onChange={e => setFilters(f => ({ ...f, vehicleType: e.target.value }))}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        >
                                            <option value="">Select your vehicle</option>
                                            {vehicleTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                        {errors.vehicleType && <p className="text-red-500 text-sm">{errors.vehicleType}</p>}
                                    </div>

                                    {/* Date and Time */}
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Arrival Time</label>
                                            <input
                                                type="datetime-local"
                                                value={filters.startTime}
                                                onChange={e => setFilters(f => ({ ...f, startTime: e.target.value, endTime: "" }))}
                                                min={dayjs().format('YYYY-MM-DDTHH:mm')}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                            />
                                            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Departure Time (Optional)</label>
                                            <input
                                                type="datetime-local"
                                                value={filters.endTime}
                                                onChange={e => setFilters(f => ({ ...f, endTime: e.target.value }))}
                                                min={dayjs(filters.startTime).format('YYYY-MM-DDTHH:mm')}
                                                disabled={!filters.startTime}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                            />
                                            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
                                        </div>
                                    </div>

                                    {/* Search Button */}
                                    <button
                                        className="w-full p-3 bg-emerald-500 text-white rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors shadow-lg"
                                        onClick={() => handleFilterSubmit()}
                                    >
                                        🔍 Find Parking Spots
                                    </button>
                                </div>
                            </div>
                        </div>)}

                        {/* Right Side - Results */}
                        <div className="w-2/3">
                            {parkingSpots?.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Map View */}
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="h-80 z-0 relative">
                                            <CustomPointsMapContainer
                                                parkingSpots={parkingSpots}
                                                setSelectedArea={setSelectedArea}
                                                currentPosition={position}
                                                zoom={zoom}
                                            />
                                        </div>

                                        {/* Radius Filter */}
                                        <div className="p-3 border-t border-gray-100">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-medium text-gray-700">Search Radius</label>
                                                    <span className="text-sm font-bold text-cyan-600">{filters.radius / 1000} km</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="300"
                                                    value={filters.radius / 1000 || 0}
                                                    onChange={(e) => setFilters(f => ({ ...f, radius: parseInt(e.target.value) * 1000 }))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>0 km</span>
                                                    <span>300 km</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parking Spots List */}
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="p-4 border-b border-gray-100">
                                            <h3 className="text-xl font-semibold text-gray-800">Available Parking Spots</h3>
                                            <p className="text-gray-500 mt-1">Found {parkingSpots.length} parking areas</p>
                                        </div>

                                        <div className="divide-y divide-gray-100">
                                            {parkingSpots.map(spot => (
                                                <div
                                                    key={spot.id}
                                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedSpotData?.id === spot.id
                                                            ? 'bg-cyan-50 border-l-4 border-l-cyan-500'
                                                            : ''
                                                        }`}
                                                    onClick={() => setSelectedArea(spot)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-cyan-500 text-3xl">
                                                            {vehicleTypes.find(v => v.value === spot.vehicleType)?.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-800 text-lg">{spot.name}</div>
                                                            <div className="text-gray-600">{spot.address}</div>
                                                            <div className="text-sm text-gray-500">{spot.city}, {spot.district}, {spot.province}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-cyan-600 text-xl">Rs.{spot?.price?.toFixed(0)}</div>
                                                            <div className="text-sm text-gray-500">per hour</div>
                                                            <div className={`text-sm font-medium px-3 py-1 rounded-full mt-2 ${spot.slotCount > 5
                                                                    ? 'text-green-700 bg-green-100'
                                                                    : 'text-orange-700 bg-orange-100'
                                                                }`}>
                                                                {spot.slotCount > 5 ? 'Available' : 'Limited Slots'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                    <div className="text-gray-400 text-6xl mb-4">🚗</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Your Perfect Parking Spot</h3>
                                    <p className="text-gray-500">Fill out the form on the left and click "Find Parking Spots" to discover available parking areas near you.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Spot Details Popup */}
            <SpotDetailsPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                onSubmit={handleReservationSubmit}
                spotData={selectedSpotData}
                loading={isLoading}
                userData={authState.user}
            />

            <ToastContainer />
        </div>
    );
};

export default FindParkingSpot;