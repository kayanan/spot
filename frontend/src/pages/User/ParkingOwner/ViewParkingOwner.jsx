// src/pages/User/ParkingOwner/ViewParkingOwner.jsx

import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaEnvelope, FaPhone, FaBuilding, FaParking, FaCar, FaCheck, FaTimes, FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ParkingAreaList from "./ParkingArea/ParkingAreaList";
import ConfirmationPopup from "../../../utils/ConfirmationPopup";
import PromptPopup from "../../../utils/PromptPopup";

const SkeletonLoader = () => (
  <div className="grid md:grid-cols-2 gap-6 animate-pulse">
    {/* Profile Skeleton */}
    <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center">
      <div className="w-32 h-32 rounded-full bg-gray-300"></div>
      <div className="mt-4 w-3/4 h-6 bg-gray-300 rounded"></div>
      <div className="mt-2 w-1/2 h-4 bg-gray-300 rounded"></div>
    </div>
    {/* Details Skeleton */}
    <div className="bg-gray-200 rounded-lg p-6 space-y-4">
      <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full h-4 bg-gray-300 rounded"></div>
        <div className="w-full h-4 bg-gray-300 rounded"></div>
        <div className="w-full h-4 bg-gray-300 rounded"></div>
        <div className="w-full h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
    {/* Additional Sections */}
    <div className="bg-gray-200 rounded-lg p-6 space-y-4">
      <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
      <div className="w-full h-4 bg-gray-300 rounded"></div>
      <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const ViewParkingOwner = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const filters = location.state?.filters || {};
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Popup states
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const fetchParkingOwner = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerResponse = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${id}`, { withCredentials: true });
      setOwner(ownerResponse.data.user);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      toast.error("Failed to load data. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchParkingOwner();

  }, []);

  const handleApprove = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/approve/${id}`, {}, { withCredentials: true });
      toast.success("Parking owner approved successfully", {
        onClose: () => {
          navigate(`/owner/pending-request`);
        },
        autoClose: 1000,
      });
    } catch (err) {
      console.error("Error approving parking owner:", err.message);
      toast.error("Error approving parking owner: " + err.message);
    }
  };

  const handleReject = async (reason) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/reject/${id}`, { reason }, { withCredentials: true });

      toast.success(response.data.message || "Parking owner rejected successfully", {
        onClose: () => {
          navigate(`/owner/pending-request`);
        },
        autoClose: 1000,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error rejecting parking owner");
    }
  };

  const handleStatusChange = async (isActive) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/update/${id}`,
        { isActive },
        { withCredentials: true }
      );
      toast.success(`Parking owner ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchParkingOwner();
    } catch (err) {
      console.error("Error updating status:", err.message);
      toast.error("Error updating status: " + err.message);
    }
  };

  const initiateReject = () => {
    setShowRejectConfirm(true);
  };

  const onRejectConfirm = () => {
    setShowRejectConfirm(false);
    setShowRejectPrompt(true);
  };

  const onRejectPromptConfirm = (reason) => {
    setShowRejectPrompt(false);
    handleReject(reason);
  };

  const initiateStatusChange = (isActive) => {
    setPendingStatusChange(isActive);
    setShowStatusConfirm(true);
  };

  const onStatusConfirm = () => {
    setShowStatusConfirm(false);
    handleStatusChange(pendingStatusChange);
    setPendingStatusChange(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchParkingOwner}
          className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md"
        >
          Retry
        </button>
        <br />
        <Link
          to="/parking-owner"
          state={{ filters }}
          className="mt-4 inline-flex items-center text-gray-600 hover:text-cyan-600"
        >
          <FaArrowLeft className="mr-2" />
          Back to Parking Owner List
        </Link>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <Link to="/owner" state={{ filters }} className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600">
        <FaArrowLeft className="mr-2" />
        Back to Parking Owner List
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden">
            <img
              src={
                owner.profileImage
                  ? `${import.meta.env.VITE_BACKEND_URL}${owner.profileImage}`
                  : `http://localhost:5173/assets/default-avatar.png`
              }
              alt={`${owner.firstName} ${owner.lastName}`}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold capitalize">{`${owner.firstName} ${owner.lastName}`}</h2>
            <p className="text-lg text-gray-500">Parking Owner</p>
          </div>
        </div>

        {/* Owner Details Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Owner Details</h3>
            <div className="flex gap-2">
              <span
                className={`text-base font-semibold px-2 py-1 rounded ${owner.approvalStatus ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {owner.approvalStatus ? "Approved" : "Pending"}
              </span>
              {owner.approvalStatus && (
                <span
                  className={`text-base font-semibold px-2 py-1 rounded ${owner.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                >
                  {owner.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base font-medium text-gray-500">First Name</p>
              <p className="text-base font-semibold">{owner.firstName}</p>
            </div>
            <div>
              <p className="text-base font-medium text-gray-500">Last Name</p>
              <p className="text-base font-semibold">{owner.lastName}</p>
            </div>
            <div>
              <p className="text-base font-medium text-gray-500">NIC</p>
              <p className="text-base font-semibold">{owner.nic}</p>
            </div>
            <div>
              <p className="text-base font-medium text-gray-500">Username</p>
              <p className="text-base font-semibold">{owner.username}</p>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-gray-500" />
              <a href={`mailto:${owner.email}`} className="text-base text-cyan-600 hover:underline">
                {owner.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-gray-500" />
              <span className="text-base">{owner.mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBuilding className="text-gray-500" />
              <span className="text-base">{owner.address}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <FaCar className="text-cyan-500 text-xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Manage Parking Owner</h3>
          </div>

          <div className="space-y-4">
            {!owner.approvalStatus ? (
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-yellow-800 text-sm">This parking owner is pending approval. Please review their details and take appropriate action.</p>
                </div>
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg transition duration-300 hover:shadow-lg hover:from-green-600 hover:to-green-700"
                >
                  <FaCheck className="text-lg" />
                  <span className="font-semibold">Approve Parking Owner</span>
                </button>
                <button
                  onClick={initiateReject}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg transition duration-300 hover:shadow-lg hover:from-red-600 hover:to-red-700"
                >
                  <FaTimes className="text-lg" />
                  <span className="font-semibold">Reject Parking Owner</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-800 text-sm">This parking owner has been approved. You can manage their active status below.</p>
                </div>
                  <button
                  onClick={() => initiateStatusChange(!owner.isActive)}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition duration-300 hover:shadow-lg font-semibold ${
                    owner.isActive
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  }`}
                >
                  {owner.isActive ? (
                    <>
                      <FaToggleOff className="text-lg" />
                      <span>Deactivate Parking Owner</span>
                    </>
                  ) : (
                    <>
                      <FaToggleOn className="text-lg" />
                      <span>Activate Parking Owner</span>
                    </>
                  )}
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parking Areas Section */}
      <div className="mt-8">
        <div className="flex gap-4 items-center mb-6">
          <h2 className="text-2xl font-bold">Parking Areas</h2>
          <button type="button" className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md" onClick={() => navigate(`/parking-owner/spot-details`, { state: { ownerId: id } })}>
            <FaPlus className="mr-2" />
            Add Parking Area
          </button>
        </div>
        <ParkingAreaList parkingOwner={owner} />
      </div>

      {/* Popups */}
      <ConfirmationPopup
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={onRejectConfirm}
        title="Confirm Rejection"
        message="Do you want to reject this parking owner application? This action cannot be undone."
        confirmText="Yes, Reject"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        icon="danger"
      />

      <PromptPopup
        isOpen={showRejectPrompt}
        onClose={() => setShowRejectPrompt(false)}
        onConfirm={onRejectPromptConfirm}
        title="Rejection Reason"
        message="Please provide a reason for rejecting this parking owner application:"
        placeholder="Enter the reason for rejection..."
        confirmText="Submit Rejection"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        required={true}
        maxLength={200}
      />

      <ConfirmationPopup
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={onStatusConfirm}
        title="Confirm Status Change"
        message={`Do you want to ${pendingStatusChange ? 'activate' : 'deactivate'} this parking owner?`}
        confirmText={pendingStatusChange ? "Activate" : "Deactivate"}
        cancelText="Cancel"
        confirmButtonClass={pendingStatusChange ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
        icon={pendingStatusChange ? "info" : "warning"}
      />

      <ToastContainer />
    </div>
  );
};

export default ViewParkingOwner;

