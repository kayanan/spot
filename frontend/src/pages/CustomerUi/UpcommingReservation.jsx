import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FaCalendarAlt, FaMapMarkerAlt, FaCar, FaParking, FaChevronRight, FaArrowLeft, FaDirections } from "react-icons/fa";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const StatusBadge = ({ status }) => (
    <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${status === "confirmed" || status === "pending"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-200 text-gray-600"
            }`}
    >
        {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
);
const handleGetDirection = (reservation) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${reservation.parkingArea?.location?.coordinates[1]},${reservation.parkingArea?.location?.coordinates[0]}`, "_blank", "noopener,noreferrer");
};


const ReservationCard = ({ reservation }) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 mb-6">
    {/* Header with Status and Date */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <StatusBadge status={reservation.status} />
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {dayjs(reservation.startDateAndTime).format("MMM D, YYYY h:mm A")}
        </span>
      </div>
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Location */}
      <div className="space-y-4">
        {/* Location */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FaMapMarkerAlt className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{reservation.parkingArea?.name || 'Unknown Location'}</h3>
              <p className="text-sm text-gray-600">
                {reservation.parkingArea?.addressLine1} {reservation.parkingArea?.addressLine2}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle and Slot Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaCar className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Vehicle</span>
            </div>
            <div className="font-semibold text-gray-800">{reservation.vehicleNumber}</div>
            <div className="text-sm text-gray-600">{reservation.vehicleType?.vehicleType || 'N/A'}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaParking className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Parking Slot</span>
            </div>
            <span className="font-semibold text-gray-800">Slot : {reservation.vehicleType?.vehicleType?.charAt(0).toUpperCase()}-{reservation.parkingSlot?.slotNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Right Column - Actions */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
          <div className="space-y-3">
            
            <button 
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
              onClick={() => handleGetDirection(reservation)}
            >
              <FaDirections />
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UpcommingReservation = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUpcomingReservations();
    }, []);

    const fetchUpcomingReservations = async () => {
        try {
            setLoading(true);
            setError(null);



            // Get user's reservations and filter for upcoming ones
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/user/${authState.user.userId}`,
                {
                    params: {
                        status: 'confirmed',
                        isParked: false,
                        startDate: dayjs().format('YYYY-MM-DD'),
                        page: 1,
                        limit: 50
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                // Filter for upcoming reservations (not started yet)
                const upcomingReservations = response.data.data.filter(reservation => {
                    const now = new Date();
                    const startTime = new Date(reservation.startDateAndTime);

                    // Reservation is upcoming if it hasn't started yet
                    return startTime > now;
                });

                setReservations(upcomingReservations);
            } else {
                setError('Failed to fetch upcoming reservations');
            }
        } catch (err) {
            console.error('Error fetching upcoming reservations:', err);
            setError('Failed to load upcoming reservations');
            toast.error('Failed to load upcoming reservations');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading upcoming reservations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reservations</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchUpcomingReservations}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-6 md:px-16">
            {/* Back Arrow */}
            <button
                className="flex items-center gap-2 mb-4 text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 font-semibold text-lg rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                onClick={() => navigate("/customer-landing-page")}
                aria-label="Go to Home"
            >
                <FaArrowLeft />
                <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
                Upcoming Reservations
            </h1>
            <div className="max-w-3xl mx-auto">
                {reservations.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <FaCalendarAlt className="mx-auto text-6xl mb-4" />
                        <div className="text-lg">No upcoming reservations</div>
                        <p className="text-sm text-gray-500 mt-2">You don't have any upcoming parking reservations.</p>
                    </div>
                ) : (
                    reservations.map((res) => (
                        <ReservationCard key={res._id} reservation={res} />
                    ))
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpcommingReservation;