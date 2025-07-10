import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';
import { FaFilter, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaCar, FaClock, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaEye, FaChevronLeft, FaChevronRight, FaStar, FaStarHalfAlt, FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Simplified status utilities
const getStatusConfig = (status) => {
  const configs = {
    confirmed: { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="text-green-600" /> },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FaHourglassHalf className="text-yellow-600" /> },
    cancelled: { color: 'bg-red-100 text-red-800', icon: <FaTimesCircle className="text-red-600" /> },
    completed: { color: 'bg-blue-100 text-blue-800', icon: <FaCheckCircle className="text-blue-600" /> }
  };
  return configs[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', icon: <FaClock className="text-gray-600" /> };
};

const getPaymentStatusColor = (status) => {
  const colors = {
    paid: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-orange-100 text-orange-800',
    refunded: 'bg-purple-100 text-purple-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatus = (reservation) => {
  if(reservation.status === 'pending'){
    if(reservation.createdAt > new Date(new Date().getTime() - 1000 * 60 * 5)){
      return 'Pending';
    }
    else{
      return 'Cancelled'; 
    }
  }
  else if(reservation.status === 'completed'){
    return 'Completed';
  }
  else if(reservation.status === 'cancelled'){
    return 'Cancelled';
  }
  else if(reservation.status === 'confirmed'){
    return 'Confirmed';
  }
  else{
    return 'Not Found';
  }
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange, readonly = false, size = 'text-lg' }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform duration-200`}
        >
          {star <= rating ? (
            <FaStar className={`${size} text-yellow-400`} />
          ) : (
            <FaStar className={`${size} text-gray-300`} />
          )}
        </button>
      ))}
    </div>
  );
};

// Rating Modal Component
const RatingModal = ({ reservation, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      await onSubmit(rating, message);
      toast.success('Rating submitted successfully!');
      onClose();
    } catch (error) {
        toast.error('Failed to submit rating. Please try again.');
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Rate Your Experience</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimesCircle size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Reservation Card Component
const ReservationCard = ({ reservation, onViewDetails, onAddRating }) => {
  const statusConfig = getStatusConfig(getStatus(reservation));
  const hasRating = reservation.rating && reservation.rating !== null;
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {statusConfig.icon}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {getStatus(reservation)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">Rs. {reservation.totalAmount?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-gray-500">Total Amount</div>
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <FaCar className="text-gray-400" />
            <span className="font-medium text-gray-900">{reservation.vehicleNumber}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" />
            <span className="text-sm text-gray-600">{reservation.parkingArea?.name || 'Unknown Location'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <div className="text-sm text-gray-600">
              {dayjs(reservation.startDateAndTime).format('MMM DD, YYYY')}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-400" />
            <div className="text-sm text-gray-600">
              {dayjs(reservation.startDateAndTime).format('HH:mm')} - {reservation.endDateAndTime ? dayjs(reservation.endDateAndTime).format('HH:mm') : 'Ongoing'}
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your Rating</span>
            {hasRating && (
              <span className="text-xs text-gray-500">Already rated</span>
            )}
          </div>
          
          {hasRating ? (
            <div className="space-y-2">
              <StarRating rating={reservation.rating?.rating || 0} readonly={true} size="text-sm" />
              {reservation.rating?.message && (
                <p className="text-xs text-gray-600 italic">"{reservation.rating.message}"</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAddRating(reservation)}
              className="w-full px-3 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Rate Your Experience
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-gray-400" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
              {reservation.paymentStatus.charAt(0).toUpperCase() + reservation.paymentStatus.slice(1)}
            </span>
          </div>
          <button
            onClick={() => onViewDetails(reservation)}
            className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            <FaEye />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Simplified Details Modal
const ReservationDetailsModal = ({ reservation, onClose }) => {
  const statusConfig = getStatusConfig(getStatus(reservation));
  
  const details = [
    { label: 'Reservation ID', value: reservation?._id || 'N/A' },
    { label: 'Vehicle Number', value: reservation?.vehicleNumber || 'N/A' },
    { label: 'Parking Area', value: reservation?.parkingArea?.name || 'N/A' },
    { label: 'Date', value: dayjs(reservation?.startDateAndTime).format('MMM DD, YYYY') || 'N/A' },
    { label: 'Time', value: `${dayjs(reservation?.startDateAndTime).format('HH:mm')} - ${reservation?.endDateAndTime ? dayjs(reservation?.endDateAndTime).format('HH:mm') : 'Ongoing'}` || 'N/A' },
    { label: 'Rate per Hour', value: `Rs. ${reservation.perHourRate?.toFixed(2) || 'N/A'}` },
    { label: 'Total Amount', value: `Rs. ${reservation.totalAmount?.toFixed(2) || 'N/A'}` },
    { label: 'Type', value: reservation?.type === 'pre_booking' ? 'Pre-booking' : 'On-spot' || 'N/A' },
    { label: 'Created', value: dayjs(reservation?.createdAt).format('MMM DD, YYYY HH:mm') || 'N/A' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Reservation Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimesCircle size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{detail.label}:</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {getStatus(reservation)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                {reservation.paymentStatus.charAt(0).toUpperCase() + reservation.paymentStatus.slice(1)}
              </span>
            </div>

            {/* Rating in Details */}
            {reservation.rating && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Your Rating:</span>
                  <div className="text-right">
                    <StarRating rating={reservation.rating?.rating || 0} readonly={true} size="text-sm" />
                    {reservation.rating?.message && (
                      <p className="text-xs text-gray-600 mt-1 italic">"{reservation.rating.message}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FaChevronLeft size={12} />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage ? 'bg-cyan-500 text-white' :
                page === '...' ? 'text-gray-400 cursor-default' :
                'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Next
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

// Simplified Filter Component
const FilterSection = ({ filters, onFilterChange, showFilters, setShowFilters }) => {
  const filterOptions = [
    { name: 'status', label: 'Status', type: 'select', options: ['', 'pending', 'confirmed', 'completed', 'cancelled'] },
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['', 'pending', 'paid', 'refunded'] }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaFilter />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Vehicle number or location..."
                  value={filters.searchTerm}
                  onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Dynamic Filters */}
            {filterOptions.map(filter => (
              <div key={filter.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{filter.label}</label>
                <select
                  value={filters[filter.name]}
                  onChange={(e) => onFilterChange({ ...filters, [filter.name]: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">All {filter.label}s</option>
                  {filter.options.slice(1).map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const ReservationHistory = () => {
    const { authState } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        startDate: '',
        endDate: '',
        searchTerm: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedReservationForRating, setSelectedReservationForRating] = useState(null);
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const navigate = useNavigate();

    useEffect(() => {
        if(filters.searchTerm){
            const timer = setTimeout(fetchReservations, 1000);
            return () => clearTimeout(timer);
        }
        else{
            fetchReservations();
        }
    }, [filters,pagination.currentPage]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const params = { ...filters, page: pagination.currentPage, limit: pagination.itemsPerPage };
            
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/user/${authState.user.userId}`, {
                params,
                withCredentials: true
            });
            
            if (response.data.success) {
                setReservations(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: Math.ceil(response.data.count/prev.itemsPerPage) || 1,
                    totalItems: response.data.count || 0
                }));
            }
        } catch (err) {
            setError('Failed to fetch reservation history');
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleViewDetails = (reservation) => {
        setSelectedReservation(reservation);
        setShowDetails(true);
    };

    const handleAddRating = (reservation) => {
        setSelectedReservationForRating(reservation);
        setShowRatingModal(true);
    };

    const handleSubmitRating = async (rating, message) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/rating/add`, {
                reservationId: selectedReservationForRating._id,
                rating,
                message
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                // Refresh the reservations to show the new rating
                await fetchReservations();
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            throw error;
        }
    };

    const clearFilters = () => {
        handleFilterChange({
            status: '',
            paymentStatus: '',
            startDate: '',
            endDate: '',
            searchTerm: ''
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading reservation history...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading History</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchReservations}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Arrow */}
            <button
                className="flex items-center gap-2 mb-4 text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 font-semibold text-lg rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 px-4 pt-6"
                onClick={() => navigate('/customer-landing-page')}
                aria-label="Go to Home"
            >
                <FaArrowLeft />
                <span>Back to Home</span>
            </button>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-2xl font-bold text-gray-900">Reservation History</h1>
                        <p className="text-gray-600 mt-1">View and manage your parking reservations</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Filters */}
                <FilterSection 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-gray-600">
                        Showing {reservations.length} of {pagination.totalItems} reservations
                        {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Reservations Grid */}
                {reservations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reservations Found</h3>
                        <p className="text-gray-600">Try adjusting your filters or check back later for new reservations.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {reservations.map((reservation) => (
                                <ReservationCard 
                                    key={reservation._id} 
                                    reservation={reservation}
                                    onViewDetails={handleViewDetails}
                                    onAddRating={handleAddRating}
                                />
                            ))}
                        </div>
                        
                        <Pagination 
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Details Modal */}
            {showDetails && selectedReservation && (
                <ReservationDetailsModal
                    reservation={selectedReservation}
                    onClose={() => {
                        setShowDetails(false);
                        setSelectedReservation(null);
                    }}
                />
            )}

            {/* Rating Modal */}
            {showRatingModal && selectedReservationForRating && (
                <RatingModal
                    reservation={selectedReservationForRating}
                    onClose={() => {
                        setShowRatingModal(false);
                        setSelectedReservationForRating(null);
                    }}
                    onSubmit={handleSubmitRating}
                />
            )}
            <ToastContainer />
        </div>
    );
};

export default ReservationHistory;