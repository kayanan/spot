import React, { useState, useEffect } from 'react';
import { FaTimes, FaCar, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaCreditCard, FaCheck, FaTimes as FaX, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReservationDetailsPopup = ({
    isOpen,
    onClose,
    parkingSlotId,
    parkingSlotData,
    onReservationUpdate
}) => {
    const getActiveReservations = (slot) => {
        if (slot?.length > 0) {
            const filteredReservations = slot?.filter(reservation => ((reservation?.status === "confirmed" && !reservation?.isParked && (new Date(reservation?.startDateAndTime) >= new Date(new Date().getTime() - 1000 * 60 * 60 * 1)) )||((reservation?.status === "completed" || reservation?.status === "confirmed") && reservation?.isParked && reservation?.paymentStatus === "pending")))
            return filteredReservations.sort((a, b) => new Date(a.startDateAndTime) - new Date(b.startDateAndTime))
        }
        else {
            return []
        }
    }
    const findCurrentReservation = (reservations) => {
        if (reservations?.length > 0) {
            return reservations?.filter(reservation => reservation?.status === "confirmed" && !reservation?.isParked && (new Date(reservation?.startDateAndTime) >= new Date(new Date().getTime() - 1000 * 60 * 60 * 1)) && (new Date(reservation?.startDateAndTime) <= new Date()))
        } else {
            return []
        }
    }
    const findUpcommingReservations = (reservations) => {
        console.log(reservations)
        if (reservations?.length > 0) {
            return reservations?.filter(reservation => reservation?.status === "confirmed" && !reservation?.isParked && (new Date(reservation?.startDateAndTime) >= new Date(new Date().getTime() - 1000 * 60 * 60 * 1)))
        } else {
            return []
        }
    }
    const occupiedReservation = (reservations) => {
        if (reservations?.length > 0) {
            return reservations?.filter(reservation => ((reservation?.status === "confirmed" && reservation?.isParked)||(reservation?.status === "completed" && reservation?.isParked && reservation?.paymentStatus === "pending")))
        } else {
            return []
        }
    }
    const [reservations, setReservations] = useState(getActiveReservations(parkingSlotData?.reservationIds || []));
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [search, setSearch] = useState('');
    const [filteredReservations, setFilteredReservations] = useState(getActiveReservations(parkingSlotData?.reservationIds || []));
    useEffect(() => {
        if (isOpen && parkingSlotId) {
            fetchReservations();
        }
    }, [isOpen, parkingSlotId]);

    console.log(filteredReservations, "filteredReservations")

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/parking-slot/${parkingSlotId}`);
            if (response?.data?.success) {
                setReservations(getActiveReservations(response?.data?.data));
                setFilteredReservations(getActiveReservations(response?.data?.data));


            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            toast.error('Failed to fetch reservation details');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (search) {
            setFilteredReservations(reservations.filter(reservation => {
                {
                    return (reservation?.user?.firstName?.toLowerCase().includes(search.toLowerCase())
                        || reservation?.user?.lastName?.toLowerCase().includes(search.toLowerCase())
                        || reservation?.user?.email?.toLowerCase().includes(search.toLowerCase())
                        || reservation?.user?.phoneNumber?.trim().toLowerCase().includes(search.trim().toLowerCase())
                        || reservation?.vehicleNumber?.toLowerCase().includes(search.trim().toLowerCase())
                    )
                }
            }));
        } else {
            setFilteredReservations(reservations);
        }
    }, [search]);
    const handleAction = async (action, reservationId) => {
        setActionLoading(prev => ({ ...prev, [reservationId]: true }));


        try {
            let response;

            switch (action) {
                case 'complete':
                    response = await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}/complete`);
                    break;
                case 'cancel':
                    response = await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}/cancel`);
                    break;
                case 'slotChange':
                    response = await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}/change-slot`);
                    break;
                case 'markAsOccupied':
                    response = await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}/mark-as-occupied`);
                    break;
                default:
                    throw new Error('Invalid action');
            }
            if (response.data.success) {
                toast.success(`Reservation ${action} successfully to ${response?.data?.data?.parkingSlot?.slotNumber}`);
                //fetchReservations(); // Refresh the list
                if (onReservationUpdate) {
                    onReservationUpdate();
                    fetchReservations();
                }
            }
        } catch (error) {
            console.error(`Error ${action}ing reservation:`, error);
            toast.error(`Failed to ${action} reservation`);
        } finally {
            setActionLoading(prev => ({ ...prev, [reservationId]: false }));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (paymentStatus) => {
        switch (paymentStatus) {
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'refunded':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount || 0);
    };

    const getVehicleIcon = (vehicleType) => {
        if (!vehicleType) return <FaCar className="h-4 w-4" />;

        const type = vehicleType.vehicleType?.toLowerCase() || 'car';
        switch (type) {
            case 'motorcycle':
                return <FaCar className="h-4 w-4" />; // Using car icon for now
            case 'bus':
                return <FaCar className="h-4 w-4" />; // Using car icon for now
            default:
                return <FaCar className="h-4 w-4" />;
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reservation Details</h2>
                        <p className="text-gray-600 mt-1">
                            Slot {parkingSlotData?.slotNumber} - {parkingSlotData?.vehicleType?.vehicleType}
                        </p>
                    </div>
                    <div className='w-full flex items-center space-x-2 ml-10'>
                        <input type="text" placeholder='Search Reservation' className='w-1/2 border-2 border-gray-300 rounded-md p-2' onChange={(e) => setSearch(e.target.value)} value={search} />
                        <button className='bg-gray-500 text-white px-4 py-2 rounded-md text-xs h-8 w-20' onClick={() => setSearch('')}>Clear</button>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                        </div>
                    ) : filteredReservations?.length === 0 ? (
                        <div className="text-center py-12">
                            <FaCar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reservations</h3>
                            <p className="text-gray-600">This parking slot has no reservations yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReservations?.map((reservation) => (
                                <div key={reservation._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    {/* Reservation Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {getVehicleIcon(reservation.vehicleType)}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Reservation #{reservation._id.slice(-8)}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {reservation.type === 'pre_booking' ? 'Pre-booking' : 'On-spot'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <span className={`px-3 py-1  text-xs font-medium  border-2 border-dashed border-gray-300 rounded-md ${findCurrentReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) || occupiedReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) ? "bg-cyan-100 text-cyan-800" : "bg-red-100 text-red-800"}`}>
                                                {findCurrentReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) || occupiedReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) ? "Current Reservation" : "Upcoming Reservation"}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                                {reservation.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${reservation.paymentIds?.length > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {"Advance : " + (reservation.paymentIds?.length > 0 ? "Paid" : "Pending")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reservation Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <FaUser className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {reservation.user?.firstName} {reservation.user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-600">Customer</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <FaPhone className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {reservation.customerMobile}
                                                    </p>
                                                    <p className="text-xs text-gray-600">Contact</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <FaCar className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {reservation.vehicleNumber}
                                                    </p>
                                                    <p className="text-xs text-gray-600">Vehicle Number</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <FaClock className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatDate(reservation.startDateAndTime)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">Start Time</p>
                                                </div>
                                            </div>

                                            {reservation.endDateAndTime && (
                                                <div className="flex items-center space-x-3">
                                                    <FaClock className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatDate(reservation.endDateAndTime)}
                                                        </p>
                                                        <p className="text-xs text-gray-600">End Time</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-3">
                                                <FaCreditCard className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(reservation.totalAmount || reservation.perHourRate)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {reservation.totalAmount ? 'Total Amount' : 'Per Hour Rate'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                                        {/* Complete Reservation */}
                                        {/* {reservation.status === 'confirmed' && ( */}
                                        {findCurrentReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) && occupiedReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) && (
                                            <button
                                                onClick={() => handleAction('markAsOccupied', reservation._id)}
                                                disabled={actionLoading[reservation._id]}
                                                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                            >
                                                <FaCheck className="h-3 w-3" />
                                                <span>Mark as Occupied</span>
                                            </button>
                                        )}

                                        {/* Cancel Reservation */}
                                        {/* {['pending', 'confirmed'].includes(reservation.status) && ( */}
                                        {findCurrentReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) && !occupiedReservation(filteredReservations).map(reservation => reservation._id).includes(reservation._id) && (
                                            <button
                                                onClick={() => handleAction('cancel', reservation._id)}
                                                disabled={actionLoading[reservation._id]}
                                                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                            >
                                                <FaX className="h-3 w-3" />
                                                <span>Cancel Reservation</span>
                                            </button>
                                        )}

                                        {/* Change Slot */}
                                        {/* {['pending', 'confirmed'].includes(reservation.status) && ( */}
                                        {findUpcommingReservations(filteredReservations).map(reservation => reservation._id).includes(reservation._id) && (
                                            <button
                                                onClick={() => handleAction('slotChange', reservation._id)}
                                                disabled={actionLoading[reservation._id]}
                                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                            >
                                                <FaCreditCard className="h-3 w-3" />
                                                <span>Change Slot</span>
                                            </button>
                                        )}



                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        Total Reservations: {reservations?.length > 0 ? reservations.length : 0}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailsPopup; 