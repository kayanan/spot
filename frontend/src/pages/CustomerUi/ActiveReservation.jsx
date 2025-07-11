import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FaClock, FaMapMarkerAlt, FaCar, FaMoneyBillWave, FaParking, FaChevronRight, FaCreditCard, FaArrowLeft, FaDirections } from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import handlePayment from "../../utils/payherePaymentOption";

dayjs.extend(relativeTime);

function getElapsedTime(start) {
    const now = dayjs();
    const startTime = dayjs(start);
    const diff = now.diff(startTime, "minute");
    const hours = Math.floor(diff / 60);
    const ceilHours = Math.ceil(diff / 60);
    const minutes = diff % 60;
    return {elapsedTime:`${hours > 0 ? `${hours}h ` : ""}${minutes}m`,ceilHours:ceilHours}
}

const StatusBadge = ({ status }) => (
    <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${status === "active" || status === "confirmed"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
            }`}
    >
        {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
);

const PaymentBadge = ({ paymentStatus }) => (
    <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${paymentStatus === "paid"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-orange-100 text-orange-700"
            }`}
    >
        {paymentStatus === "paid" ? "Paid" : "Payment Pending"}
    </span>
);

const ReservationCard = ({ reservation, onMakePayment }) => {
  const [elapsed, setElapsed] = useState(getElapsedTime(reservation.startDateAndTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedTime(reservation.startDateAndTime));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [reservation.startDateAndTime]);

  const handleGetDirection = (reservation) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${reservation.parkingArea?.location?.coordinates[1]},${reservation.parkingArea?.location?.coordinates[0]}`, "_blank", "noopener,noreferrer");
  };
  const totalAmount = reservation.perHourRate * elapsed.ceilHours;
  const totalPaidAmount = reservation.paymentIds.reduce((acc, curr) => curr.paymentStatus === "paid" ? acc + curr.paymentAmount : acc, 0);
  const totalAmountDue = totalAmount - totalPaidAmount;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 mb-6">
      {/* Header with Status and Payment Badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={reservation.status} />
          <PaymentBadge paymentStatus={reservation.paymentStatus} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-600">Rs. {totalAmount}</div>
          <div className="text-sm text-gray-500">Total Cost</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Location and Details */}
        <div className="space-y-4">
          {/* Location */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-500 p-2 rounded-lg">
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

          {/* Time and Cost Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FaClock className="text-cyan-500" />
                <span className="font-medium text-gray-700">Elapsed Time</span>
              </div>
              <span className="font-bold text-lg text-cyan-600">{elapsed.elapsedTime}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Rate/Hour</div>
                <div className="font-bold text-green-600">Rs. {reservation.perHourRate}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Amount Paid</div>
                <div className="font-bold text-blue-600">Rs. {totalPaidAmount}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600 mb-1">Balance Due</div>
                <div className="font-bold text-orange-600">Rs. {totalAmountDue}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Vehicle and Actions */}
        <div className="space-y-4">
          {/* Vehicle and Slot Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <FaCar className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{reservation.vehicleNumber}</div>
                <div className="text-sm text-gray-600">{reservation.vehicleType?.vehicleType || 'N/A'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <FaParking className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">Slot {reservation.vehicleType?.vehicleType?.charAt(0).toUpperCase()}-{reservation.parkingSlot?.slotNumber || 'N/A'}</div>
                <div className="text-sm text-gray-600">Parking Spot</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            
            {!reservation.isParked && (
              <button 
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                onClick={() => handleGetDirection(reservation)}
              >
                <FaDirections />
                Get Directions
              </button>
            )}
            
            {reservation.paymentStatus !== "paid" && reservation.status === "completed" && reservation.isParked && (
              <button
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                onClick={() => onMakePayment(reservation)}
              >
                <FaCreditCard />
                Make Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveReservation = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        fetchActiveReservations();
    }, []);

    const fetchActiveReservations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user's reservations and filter for active ones
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/active`,
                {
                    params: {
                        userId: authState.user.userId,
                        page: 1,
                        limit: 9999
                    },
                    withCredentials: true
                }
            );


            if (response.data.success) {
                setReservations(response.data.data);

            } else {
                setError('Failed to fetch active reservations');
            }
        } catch (err) {
            console.error('Error fetching active reservations:', err);
            setError('Failed to load active reservations');
            toast.error('Failed to load active reservations');
        } finally {
            setLoading(false);
        }
    };

    const handleMakePayment = async (reservation) => {
        const finalAmount = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservation._id}/calculate-final-amount`);
        const totalAmount = Number(Number(finalAmount.data.data.totalAmount) - Number(finalAmount.data.data.totalPaidAmount));
        console.log(reservation);
        const paymentDetails = {
            order_id: reservation._id,
            amount: totalAmount.toFixed(2),
            currency: "LKR",
            return_url: `/reservation/active`,
            cancel_url: `/reservation/active`,
            notify_url: `${import.meta.env.VITE_BACKEND_APP_URL_PUBLIC}/api/v1/reservation-payment/notify`,
            first_name: authState.user?.firstName || "walk-in",
            last_name: authState.user?.lastName || "customer",
            email: authState.user?.email || "walk-in@customer.com",
            phone: authState.user?.phoneNumber || "0712345678",
            address: reservation.parkingArea?.addressLine1 || "No Address",
            city: reservation.parkingArea?.city || "colombo",
            country: "Sri Lanka",
            items: "Parking Reservation",
            custom_1: authState.user.userId,
            custom_2: reservation.parkingSlot._id,
        }
        console.log(paymentDetails);
        handlePayment(
            {
                paymentDetails,
                onComplete: async () => { await handleReservationComplete(reservation._id) },
                hashUrl: `/v1/reservation-payment/generate-hash`
            })
    };
    const handleReservationComplete = async (reservationId) => {

        try {
            await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}`, { paymentStatus: "paid" });
            await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}/complete`);
            toast.success("Payment Made successfully");
            fetchActiveReservations();







        } catch (error) {
            toast.error("Failed to process parking checkout");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-6 md:px-16">
                {/* Back Arrow Navigation */}
                <div className="max-w-3xl mx-auto mb-6">
                    <button
                        className="flex items-center gap-2 text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 font-semibold text-lg rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        onClick={() => navigate('/customer-landing-page')}
                    >
                        <FaArrowLeft className="text-xl" />
                        <span className="hidden sm:inline">Back to Home</span>
                    </button>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
                    Active Reservations
                </h1>
                
                <div className="max-w-3xl mx-auto">
                    {/* Loading Skeleton */}
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 animate-pulse">
                            {/* Header Skeleton */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                                    <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="text-right">
                                    <div className="w-24 h-8 bg-gray-200 rounded"></div>
                                    <div className="w-20 h-4 bg-gray-200 rounded mt-1"></div>
                                </div>
                            </div>

                            {/* Content Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div className="bg-gray-100 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1">
                                                <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
                                                <div className="w-48 h-4 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="w-16 h-5 bg-gray-200 rounded"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="bg-gray-100 rounded-lg p-3">
                                                    <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                                                    <div className="w-16 h-5 bg-gray-200 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1">
                                                <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                                                <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1">
                                                <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
                                                <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                                        <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-6 md:px-16">
                {/* Back Arrow Navigation */}
                <div className="max-w-3xl mx-auto mb-6">
                    <button
                        className="flex items-center gap-2 text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 font-semibold text-lg rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        onClick={() => navigate('/customer-landing-page')}
                    >
                        <FaArrowLeft className="text-xl" />
                        <span className="hidden sm:inline">Back to Home</span>
                    </button>
                </div>
                
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reservations</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={fetchActiveReservations}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/customer-landing-page')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                            >
                                Go Back Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-6 md:px-16 scroll-mt-24" >
            {/* Back Arrow Navigation */}
            <div className="max-w-3xl mx-auto mb-6">
                <button
                    className="flex items-center gap-2 text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 font-semibold text-lg rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    onClick={() => navigate('/customer-landing-page')}
                >
                    <FaArrowLeft className="text-xl" />
                    <span className="hidden sm:inline">Back to Home</span>
                </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
                Active Reservations
            </h1>
            <div className="max-w-3xl mx-auto">
                {reservations.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <FaParking className="mx-auto text-6xl mb-4" />
                        <div className="text-lg">No active reservations</div>
                        <p className="text-sm text-gray-500 mt-2">You don't have any active parking reservations at the moment.</p>
                    </div>
                ) : (
                    reservations.map((res) => (
                        <ReservationCard
                            key={res._id}
                            reservation={res}
                            onMakePayment={handleMakePayment}
                        />
                    ))
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default ActiveReservation;