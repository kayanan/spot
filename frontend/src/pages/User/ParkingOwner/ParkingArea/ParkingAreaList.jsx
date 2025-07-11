import { Link } from "react-router-dom";
import { FaBuilding, FaParking, FaCar, FaMapMarkerAlt, FaCreditCard, FaUniversity, FaMoneyBillWave } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import BankTransferPopup from "../../../../utils/BankTransferPopup";
import dayjs from "dayjs";
import handlePayment from "../../../../utils/payherePaymentOption";
import PaymentOptionPopup from "../../../../utils/PaymentOptionPopup";
import { useAuth } from "../../../../context/AuthContext";

const getSlotTypeCount = (slots) => {
  const countByType = {};
  slots.forEach(slot => {
    const type = slot?.vehicleType?.vehicleType || 'Unknown';
    countByType[type] = (countByType[type] || 0) + 1;
  });

  return countByType;
};

const calculateAmount = (parkingArea, subscriptionFee) => {

  const slotTypeCount = getSlotTypeCount(parkingArea?.slots?.data || []);
  const amount = Object.entries(slotTypeCount).reduce((acc, [type, count]) => {
    const fee = subscriptionFee.find(fee => fee?.vehicleType?.vehicleType === type);
    return acc + (count < 100 ? fee?.below100 : count < 300 ? fee?.between100and300 : count < 500 ? fee?.between300and500 : fee?.above500) * count;
  }, 0);

  return amount;
}

const ParkingAreaList = ({ parkingOwner }) => {
  const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedParkingArea, setSelectedParkingArea] = useState(null);
  const [activeSubscriptionFee, setActiveSubscriptionFee] = useState(0);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaymentOptionPopupOpen, setIsPaymentOptionPopupOpen] = useState(false);
  const paymentOptions = [

    { id: 'card', name: 'Card Payment', icon: FaCreditCard, color: 'text-blue-600' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: FaUniversity, color: 'text-purple-600' },
  ]

  const { authState } = useAuth();
  const handleBankTransferSubmit = async (formData) => {
    
try{
  setLoading(true);
  setError(null); // Clear any previous errors
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === "images") {
        for (const image of formData[key]) {
          formDataToSend.append("images", image);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/subscription-payment`, formDataToSend, { withCredentials: true });
    if (response.status === 201) {
      toast.success("Bank transfer successful");
      fetchParkingAreas(); // Refresh the data
    } else {
      toast.error("Bank transfer failed");
    }
  } catch (err) {
    console.error("Error submitting bank transfer:", err.message);
    toast.error("Failed to submit bank transfer. Please try again.");
  } finally {
    setLoading(false);
  }
    // Handle the form submission
    // formData will contain:
    // {
    //   referenceNumber: string,
    //   bankName: string,
    //   branch: string,
    //   images: string[],
    //   amount: number
    // }
  };
  const activeReservation = (area) => {
    return area?.slots?.data?.filter(slot => slot?.reservationIds?.filter(reservation => reservation?.status === "confirmed" && new Date(reservation?.startDateAndTime) <= new Date() && (!reservation?.isParked ? new Date(new Date(reservation?.startDateAndTime).getTime() + 1000 * 60 * 60 * 1) >= new Date().getTime() : (reservation?.endDateAndTime ? new Date(reservation?.endDateAndTime) >= new Date().getTime() : true))).length > 0)
  }


  const fetchParkingAreas = async () => {
    
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/parking-area/owner/${parkingOwner?._id}`, { withCredentials: true });
      setParkingAreas(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching parking areas:", err.message);
      setError("Failed to load parking areas. Please try again.");
      toast.error("Failed to load parking areas. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setLoading(false);
    }
  };
  const fetchActiveSubscriptionFee = async () => {
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-subscription-fee/active`);
      setActiveSubscriptionFee(response?.data || []);
    } catch (err) {
      console.error("Error fetching active subscription fee:", err.message);
    }
  };
  useEffect(() => {
    fetchParkingAreas();
    fetchActiveSubscriptionFee();
  }, []);

  const handleStatusChange = async (id, status) => {
    
    const approve = window.confirm(`Are you sure you want to ${status ? "activate" : "deactivate"} this parking area?`);
    if (!approve) return;
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-area/${id}`, { isActive: status });
      if (response.status === 200) {
        toast.success("Parking area status updated successfully", {
          onClose: () => {
            fetchParkingAreas();
          },
          autoClose: 1000
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update parking area status");
    } finally {
      setLoading(false);
    }
  }
  const handlePaymentOptionSubmit = async (paymentOption) => {
    if (paymentOption.paymentMethod === 'card') {
      setIsPaymentOptionPopupOpen(false);
      const paymentDetails = {
        order_id: "ItemNo12345",
        amount: paymentOption.amount,
        currency: "LKR",
        items: "Parking Subscription",
        first_name: parkingOwner?.firstName,
        last_name: parkingOwner?.lastName,
        email: parkingOwner?.email,
        phone: parkingOwner?.phoneNumber,
        address: selectedParkingArea?.addressLine1,
        city: selectedParkingArea?.city?.name,
        country: "Sri Lanka",
        custom_1: parkingOwner?._id,
        custom_2: selectedParkingArea?._id,
        return_url: `/owner/view/${parkingOwner?._id}`,
        cancel_url: `/owner/view/${parkingOwner?._id}`,
        notify_url: `${import.meta.env.VITE_BACKEND_APP_URL_PUBLIC}/api/v1/subscription-payment/notify-payment`,
      }
      handlePayment({
        paymentDetails, onComplete: () => {
          toast.success('Payment successful!');
        }, hashUrl: `/v1/subscription-payment/generate-hash`
      })
    } else if (paymentOption.paymentMethod === 'bank_transfer') {
      setIsPaymentOptionPopupOpen(false);
      setIsBankTransferOpen(true)
      setAmount(calculateAmount(area, activeSubscriptionFee).toFixed(2).toString())
    }
  }

  return loading ? (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white shadow-md rounded-xl overflow-hidden flex flex-col animate-pulse">
          {/* Header Section Skeleton */}
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-white bg-opacity-20 rounded w-32"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-white bg-opacity-20 rounded-full w-20"></div>
                <div className="h-5 bg-white bg-opacity-20 rounded-full w-16"></div>
              </div>
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Description Skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>

            {/* Parking Slots Section Skeleton */}
            <div className="bg-gray-50 rounded-lg p-3 mt-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="w-full flex justify-between items-center bg-white p-2 rounded-md">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="w-full flex justify-between items-center bg-white p-2 rounded-md">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-5"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="w-full flex justify-between items-center bg-white p-2 rounded-md">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-5"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-row gap-2 pt-4 mt-auto">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : error ? (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Parking Areas</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchParkingAreas();
          }}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parkingAreas.map((area) => {
        const slotTypeCount = getSlotTypeCount(area?.slots?.data || []);
        return (
          <div key={area?._id} className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold truncate">{area?.name}</h3>
                {(area?.parkingSubscriptionPaymentId?.subscriptionEndDate && dayjs(area?.parkingSubscriptionPaymentId?.subscriptionEndDate).isAfter(dayjs())) ? (
                  <span className={`px-4 py-0.5 rounded-full text-sm font-semibold bg-cyan-100 text-cyan-800 `} >
                    Subscribed
                  </span>
                ) : (
                  <span className={`px-4 py-0.5 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 `} >
                    Subscribe For Go Live
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${area?.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}>
                  {area?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Description */}
              <div className="">
                <p className="text-gray-600 line-clamp-2">{area?.description || "No description"}</p>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-cyan-500" />
                  <span className="text-sm"> {area?.addressLine1}, {area?.addressLine2}, {area?.city?.name}
                  </span>
                </div>
              </div>

              {/* Parking Slots Section */}
              <div className="bg-gray-50 rounded-lg p-3 mt-4 flex-1">
                <div className="flex items-center mb-2">
                  <FaParking className="text-cyan-500 mr-2" />
                  <h4 className="font-semibold text-gray-800">Parking Slots</h4>
                </div>
                <div >
                  <div className="w-full flex justify-between items-center bg-white p-2 rounded-md">
                    <span className="text-gray-600">Total Slots</span>
                    <span className="font-semibold text-cyan-600">{area.slots?.data?.length || 0}</span>
                  </div>
                  {Object.entries(slotTypeCount).map(([type, count]) => (
                    <div key={type} className="w-full flex justify-between items-center bg-white p-2 rounded-md">
                      <div className="flex items-center">
                        <FaCar className="text-gray-400 mr-5 " />
                        <span className="text-gray-600">{type}</span>
                      </div>
                      <span className="font-semibold text-cyan-600">{count}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-2 pt-4 mt-auto">
                <Link
                  to={`/parking-area/view/${area?._id}`}
                  state={{ slots: area?.slots, parkingOwnerId: parkingOwner?._id, }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white text-center py-2 rounded-lg transition duration-300 font-medium"
                >
                  View Details
                </Link>
                {(parkingOwner?.isActive && area?.parkingSubscriptionPaymentId && dayjs(area?.parkingSubscriptionPaymentId?.subscriptionEndDate).isAfter(dayjs())) ? (activeReservation(area).length === 0 &&
                  <button
                    type="button"
                    onClick={() => handleStatusChange(area?._id, !area?.isActive)}
                    className={`flex-1 py-2 rounded-lg transition duration-300 font-medium ${area?.isActive
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      }`}
                  >
                    {area?.isActive ? "Deactivate" : "Activate"}
                  </button>
                ) : (
                  <>
                    {/* <button id="payhere-payment" onClick={()=>{
                      const paymentDetails = {
                        order_id: "ItemNo12345",
                        amount: calculateAmount(area, activeSubscriptionFee).toFixed(2).toString(),
                        currency: "LKR",
                        items: "Parking Subscription",
                        first_name: parkingOwner?.firstName,
                        last_name: parkingOwner?.lastName,
                        email: parkingOwner?.email,
                        phone: parkingOwner?.phoneNumber,
                        address: area?.addressLine1,
                        city: area?.city?.name,
                        country: "Sri Lanka",
                        custom_1: parkingOwner?._id,
                        custom_2: area?._id,
                        return_url: `/owner/view/${parkingOwner?._id}`,
                        cancel_url: `/owner/view/${parkingOwner?._id}`,
                        notify_url: `${import.meta.env.VITE_BACKEND_ADMIN_URL_PUBLIC}/api/admin/v1/subscription-payment/notify-payment`,
                      }
                      handlePayment({paymentDetails,onComplete:fetchParkingAreas})
                    }}> Card Payment</button> */}
                    <button className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg" onClick={() => {
                      setIsPaymentOptionPopupOpen(true)
                      setAmount(calculateAmount(area, activeSubscriptionFee).toFixed(2).toString())
                      setSelectedParkingArea(area)
                    }}>
                      Make Payment
                    </button>
                    <BankTransferPopup
                      isOpen={isBankTransferOpen}
                      onClose={() => setIsBankTransferOpen(false)}
                      onSubmit={handleBankTransferSubmit}
                      parkingAreaId={selectedParkingArea?._id}
                      parkingOwnerId={parkingOwner?._id}
                      amount={amount}
                    />
                  </>
                )}


              </div>
            </div>
          </div>
        );
      })}
      <PaymentOptionPopup
        isOpen={isPaymentOptionPopupOpen}
        onClose={() => setIsPaymentOptionPopupOpen(false)}
        onSubmit={handlePaymentOptionSubmit}
        amount={amount}
        title="Payment Options"
        initialOptions={paymentOptions}
      />
    </div>

  )
}

export default ParkingAreaList;