import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaUser, FaParking, FaCar, FaCheck, FaClock, FaUsers, FaBuilding, FaInfoCircle, FaTimes ,FaCreditCard} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import ListParkingSlots from "../ParkingSlots/ListParkingSlots";
import { useAuth } from "../../../../context/AuthContext";

const ViewParkingArea = () => {
    const { id } = useParams();
    const parkingOwnerId = useLocation().state.parkingOwnerId;
    const [slots, setSlots] = useState(useLocation().state?.slot || []);
    const { authState } = useAuth();
    const [parkingArea, setParkingArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const fetchParkingArea = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area/${id}`, { withCredentials: true });
            setParkingArea(response.data.data);
        } catch (err) {
            console.error("Error fetching parking area:", err);
            setError("Failed to load parking area details");
            toast.error("Failed to load parking area details");
        } finally {
            setLoading(false);
        }
    };

    const fetchParkingSlots = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-slot/parking-area/${id}`, { withCredentials: true });
            setSlots(response.data.data || []);
        } catch (err) {
            console.error("Error fetching parking slots:", err);
        }
    }

    useEffect(() => {
        fetchParkingArea();
        if (slots.length === 0) {
            fetchParkingSlots();
        }
    }, [id]);
    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchParkingArea}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md"
                >
                    Retry
                </button>
            </div>
        );
    }

    const totalSlots = slots?.length || 0;
    const reservedSlots = slots?.filter(slot => slot.isReserved)?.length || 0;
    const inactiveSlots = slots?.filter(slot => !slot.isActive)?.length || 0;
    const availableSlots = totalSlots - reservedSlots - inactiveSlots;

    return (
        <div className="container mx-auto p-6">
            {/* Back Button */}
            <Link to={authState.privilege === "ADMIN" ? `/owner/view/${parkingOwnerId}` : authState.privilege === "PARKING_OWNER" ? `/parking-area-home` : `/dashboard`} className="inline-flex items-center text-gray-600 hover:text-cyan-600 mb-6">
                <FaArrowLeft className="mr-2" />
                Back to Parking Areas
            </Link>

            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-8 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{parkingArea?.name?.toUpperCase()}</h1>
                            <p className="text-cyan-100 text-sm">{parkingArea?.description}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${parkingArea?.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}>
                            {parkingArea?.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Basic Information */}
                <div className="md:col-span-2 space-y-6">
                    {/* Location Card */}
                    <div className="flex flex-row gap-6 bg-white rounded-xl shadow-md p-6">
                        <div className="w-1/3 border-r border-gray-200  pr-6">
                            <div className="flex items-center mb-4">
                                <FaBuilding className="text-cyan-500 mr-3 text-xl" />
                                <h2 className="text-xl font-semibold">Location Details</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <FaMapMarkerAlt className="mr-3 text-cyan-500" />
                                    <div>
                                        <p className="font-medium">{parkingArea?.addressLine1}</p>
                                        <p className="text-sm text-gray-500">{parkingArea?.addressLine2},{parkingArea?.city?.name}, {parkingArea?.district?.name}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="w-1/3 border-r border-gray-200  pr-6">
                            <div className="flex items-center mb-4">
                                <FaClock className="text-cyan-500 mr-3 text-xl" />
                                <h2 className="text-xl font-semibold">Operating Hours</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-600">Opening Time</span>
                                    <span className="font-semibold text-cyan-600">{parkingArea?.openingTime || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="text-gray-600">Closing Time</span>
                                    <span className="font-semibold text-cyan-600">{parkingArea?.closingTime || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-1/3  border-gray-200">
                            <div className="flex items-center mb-4">
                            <FaCreditCard className="text-cyan-500 mr-3 text-xl" />
                                <h2 className="text-xl font-semibold">Subscription Details</h2>
                            </div>
                            <div className="">
                                <div className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded-lg">
                                    <span className="text-gray-600">From</span>
                                   <span className="font-semibold text-cyan-600">{parkingArea?.parkingSubscriptionPaymentId?.subscriptionStartDate.split("T")[0] || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded-lg">
                                    <span className="text-gray-600">To</span>
                                    <span className="font-semibold text-cyan-600">{parkingArea?.parkingSubscriptionPaymentId?.subscriptionEndDate.split("T")[0] || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded-lg">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-semibold text-black-600">{parkingArea?.parkingSubscriptionPaymentId?.amount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) || "N/A"}</span>
                                </div>
                                <button className="bg-cyan-500 text-white px-4 py-1 rounded-md w-full mt-2 hover:bg-cyan-600" onClick={() => {
                                    navigate(`/parking-area/subscription-details/${parkingArea?._id}`,{state:{parkingOwnerId: parkingOwnerId}});
                                }}>
                                    More Details
                                </button>
                            </div>
                        </div>


                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <FaUsers className="text-cyan-500 mr-3 text-xl" />
                            <h2 className="text-xl font-semibold">Management Team</h2>
                        </div>
                        <div className="space-y-4">
                            {parkingArea?.managers?.map((manager, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                                                <FaUser className="text-cyan-500" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-800">{manager.firstName} {manager.lastName}</p>
                                                <p className="text-sm text-gray-500">{manager.role || "Manager"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <FaPhone className="mr-2 text-cyan-500" />
                                            <span>{manager.contactNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Statistics */}
                <div className="space-y-6">
                    {/* Statistics Card */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center mb-2">
                            <FaInfoCircle className="text-cyan-500 mr-2 text-xl" />
                            <h2 className="text-xl font-semibold">Parking Statistics</h2>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <FaParking className="mr-2 text-cyan-500 text-xl" />
                                    <span className="text-gray-600">Total Slots</span>
                                </div>
                                <span className="font-semibold text-cyan-600 text-xl">{totalSlots}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <FaTimes className="mr-2 text-red-500 text-xl" />
                                    <span className="text-gray-600">Inactive Slots</span>
                                </div>
                                <span className="font-semibold text-red-600 text-xl">{inactiveSlots}</span>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <FaClock className="mr-2 text-orange-500 text-xl" />
                                    <span className="text-gray-600">Reserved Slots</span>
                                </div>
                                <span className="font-semibold text-orange-600 text-xl">{reservedSlots}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <FaCheck className="mr-2 text-green-500 text-xl" />
                                    <span className="text-gray-600">Available Slots</span>
                                </div>
                                <span className="font-semibold text-green-600 text-xl">{availableSlots}</span>
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours Card */}

                </div>
            </div>

            {/* Parking Slots Section */}
            <div className="mt-8">
                <div className="flex items-center mb-6">
                    <FaCar className="text-cyan-500 mr-3 text-xl" />
                    <h2 className="text-2xl font-bold">Parking Slots</h2>
                </div>
                <ListParkingSlots slots={slots} fetchParkingSlots={fetchParkingSlots} parkingArea={parkingArea}/>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ViewParkingArea;