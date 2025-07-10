import { useState, useEffect } from 'react';
import { FaCar, FaTruck, FaBus, FaMotorcycle, FaCheck, FaTimes, FaClock, FaPlus, FaEdit, FaUniversity, FaUser, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from '../../../../context/AuthContext';
import axios from "axios";
import PopUpMenu from "../../../../utils/PopUpMenu";
import ParkingDetailsPopup from "../../../../utils/ParkingDetailsPopup";
import UserDetailsPopup from "../../../../utils/UserDetailsPopup";
import BankTransferPopup from '../../../../utils/BankTransferPopup';
import PaymentOptionPopup from '../../../../utils/PaymentOptionPopup';
import ConfirmationPopup from '../../../../utils/ConfirmationPopup';
import PromptPopup from '../../../../utils/PromptPopup';
import ReservationDetailsPopup from '../../../../utils/ReservationDetailsPopup';
import handlePayment from '../../../../utils/payherePaymentOption';
import dayjs from 'dayjs';

const ListParkingSlots = ({ slots, fetchParkingSlots, parkingArea }) => {
    const { authState } = useAuth();
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isPaymentOptionPopupOpen, setIsPaymentOptionPopupOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isBankTransferPopupOpen, setIsBankTransferPopupOpen] = useState(false);
    const [isParkingDetailsOpen, setIsParkingDetailsOpen] = useState(false);
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [finalAmount, setFinalAmount] = useState(0);
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
    const [isPromptPopupOpen, setIsPromptPopupOpen] = useState(false);
    const [vehicleTypeForPriceChange, setVehicleTypeForPriceChange] = useState(null);
    const [isReservationDetailsOpen, setIsReservationDetailsOpen] = useState(false);
    const [searchReservation, setSearchReservation] = useState("");
    const [filteredSlots, setFilteredSlots] = useState(slots);
    // Group slots by vehicle type
    useEffect(() => {

        if (searchReservation) {
            const filteredSlots = slots.filter(slot => slot?.reservationIds?.some(reservation => reservation?.vehicleNumber?.toLowerCase().includes(searchReservation.toLowerCase()) && ((reservation?.status === "confirmed" && new Date(reservation?.startDateAndTime) <= new Date() && !reservation?.isParked && new Date(reservation?.startDateAndTime) >= new Date(new Date().getTime()-1000*60*60*1) ) || (reservation?.status === "completed" && reservation?.isParked && reservation?.paymentStatus === "pending"))));
            setFilteredSlots(filteredSlots);
        }
        else {
            setFilteredSlots(slots);
        }
    }, [searchReservation, slots]);

    const groupedSlots = filteredSlots?.reduce((acc, slot) => {
        const vehicleType = slot.vehicleType?.vehicleType || "Unknown";
        if (!acc[vehicleType]) {
            acc[vehicleType] = [];
        }
        acc[vehicleType].push(slot);
        return acc;
    }, {});


    const getSlotBackgroundColor = (slot) => {
        switch (getSlotStatus(slot)) {
            case "Inactive":
                return "rose"
            case "Available":
                return "emerald"
            case "Pending":
                return "amber"
            case "Reserved":
                return "indigo"
            case "Occupied":
                return "slate"
            default: return "emerald"
        }
    };
    const getSlotStatus = (slot) => {
        if (!slot?.isActive) {
            return "Inactive"
        }
        else if (!slot?.reservationIds && slot?.isActive) {
            return "Available"
        }
        else if (occupiedReservation(slot).length > 0) {
            return "Occupied"
        }
        // else if (slot?.reservationIds?.filter(reservation => { return (reservation?.status === "pending" && new Date(reservation?.startDateAndTime) >= new Date() - 1000 * 60 * 5) }).length > 0) {
        //     return "Pending"
        // }
        else if (findCurrentReservation(slot).length > 0) {
            return "Reserved"
        }

        else {
            return "Available"
        }

    }
    const getVehicleNumber = (slot) => {
       const currentReservation = findCurrentReservation(slot);
       if(occupiedReservation(slot).length > 0){
        return occupiedReservation(slot)[0]?.vehicleNumber?.trim().toUpperCase() || "N/A"
       }
       else if(currentReservation.length > 0){
        return currentReservation[0]?.vehicleNumber?.trim().toUpperCase() || "N/A"
       }
       else{
        return "N/A"
       }
    }

    const getActiveReservations = (slot) => {
        if (slot?.reservationIds?.length > 0) {
            return slot?.reservationIds?.filter(reservation => ((reservation?.status === "confirmed" &&  !reservation?.isParked && new Date(reservation?.startDateAndTime) >= new Date(new Date().getTime() - 1000 * 60 * 60 * 1)) || ((reservation?.status === "completed" || reservation?.status === "confirmed") && reservation?.isParked && reservation?.paymentStatus === "pending"))).length
        }
        else {
            return 0
        }
    }
    const occupiedReservation = (slot) => {
        if (slot?.reservationIds?.length > 0) {
            return slot?.reservationIds?.filter(reservation => ((reservation?.status === "confirmed" && reservation?.isParked)||((reservation?.status === "completed" || reservation?.status === "confirmed") && reservation?.isParked && reservation?.paymentStatus === "pending")) )
        } else {
            return false
        }
    }
    const findCurrentReservation = (slot) => {
        if (slot?.reservationIds?.length > 0) {
            return slot?.reservationIds?.filter(reservation => reservation?.status === "confirmed" && !reservation?.isParked && (new Date(reservation?.startDateAndTime) >= new Date(new Date().getTime() - 1000 * 60 * 60 * 1) ) && (new Date(reservation?.startDateAndTime) <= new Date()) )
        } else {
            return []
        }
    }
    const paymentOption = [
        {
            name: "Cash",
            icon: FaMoneyBillWave,
            color: "text-cyan-700",
            id: "cash"
        },
        {
            name: "Bank Transfer",
            icon: FaUniversity,
            color: "text-cyan-700",
            id: "bank_transfer"
        },
        {
            name: "Paid Customer",
            icon: FaUser,
            color: "text-cyan-700",
            id: "customer"
        },
    ]

    // const fetchSlotData = async (slot) => {
    //     try {
    //         const response = await axios.get(`/api/parking-slots/${slot._id}`);
    //     } catch (error) {
    //         console.error("Error fetching slot data:", error);
    //     }
    // };
    const handlePriceChange = async (price) => {
        setLoading(true);
        setIsPromptPopupOpen(false);
        const data = {
            slotPrice: +price,
            vehicleId: vehicleTypeForPriceChange
        }
        try {
            await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-slot/parking-area/${parkingArea._id}`, data);
            toast.success("Price updated successfully");
            fetchParkingSlots();
        } catch (error) {
            toast.error("Failed to update price");
        }
    };

    const handleParkingDetailsSubmit = async (details) => {

        setLoading(true);
        setUserDetails(details);
        try {
            try {
                const vehicle = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/vehicle/${details.vehicleNumber.replace(/\s+/g, '')}`);
                if (vehicle.data.success) {
                    toast.error("Vehicle already reserved", { position: "top-center", autoClose: 3000 });
                    setLoading(false);
                    return;
                }
                const user = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/mobile-number/${details.customerMobile}`);
                const reservationData = {
                    parkingArea: parkingArea._id,
                    user: user.data._id,
                    vehicleNumber: details.vehicleNumber.replace(/\s+/g, ''),
                    customerMobile: details.customerMobile,
                    perHourRate: selectedSlot.slotPrice,
                    vehicleType: selectedSlot.vehicleType.vehicleType,
                    paymentStatus: "pending",
                    status: "confirmed",
                    createdBy: authState.user.userId,
                    isParked: true,
                    type: "on_spot",
                    startDateAndTime: new Date(),

                }
                if (details?.endsAt) {
                    reservationData.endDateAndTime = new Date(details?.endsAt);
                }

                const reservation = await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation`, reservationData);





                toast.success("Parking reservation created successfully");
                fetchParkingSlots(); // Refresh slots data
            }
            catch (error) {
                console.log(error, "error");
                if (error.response.data.status === false) {
                    setLoading(false);
                    setIsUserDetailsOpen(true);

                }
                else {
                    console.log(error);
                    toast.error("Failed to create parking reservation");
                }
            }

        } catch (error) {

            toast.error("Failed to create parking reservation");
            console.error("Error creating reservation:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        setIsPopupOpen(true);
    };

    const handleStatusUpdate = async (updates) => {
        if (updates.type === "occupied") {
            try {
                await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${updates.data._id}`, { isParked: true });
                toast.success("Reservation updated successfully");
                fetchParkingSlots();
            } catch (error) {
                toast.error("Failed to update reservation status");
                console.error("Error updating reservation:", error);
            }
           
            return;
        }
        else {
            try {
                await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/parking-slot/${selectedSlot._id}`, updates.data);
                toast.success("Slot status updated successfully");
                fetchParkingSlots();
            } catch (error) {
                toast.error("Failed to update slot status");
                console.error("Error updating slot:", error);
            }
        }
    };

    const getSlotDetails = (slot) => {
        return `
            Slot Details:
            - Vehicle Type: ${slot.vehicleType?.vehicleType || 'N/A'}
            - Slot Number: ${slot.slotNumber}
            - Price: ${slot.slotPrice ? `Rs.${slot.slotPrice}/hr` : 'N/A'}
            - Reserved Vehicle Number: ${getVehicleNumber(slot)}
        `;
    };

    const processParkingCheckout = async (data) => {

        try {
            const finalAmount = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${data[0]._id}/calculate-final-amount`);
            const totalAmount = Number(Number(finalAmount.data.data.totalAmount) - Number(finalAmount.data.data.totalPaidAmount));

            setFinalAmount(totalAmount);
            if(Number(totalAmount) > 0){    
                setIsPaymentOptionPopupOpen(true);
            }
            else{
                await handleReservationComplete(data[0]._id);
                toast.success("Success! Payment was already made and parking is now completed.");
                fetchParkingSlots();
            }





        } catch (error) {
            toast.error("Failed to process parking checkout");
        }
    }
    const handleBankTransferSubmit = async (data) => {
        const paymentData = {
            reservation: occupiedReservation(selectedSlot)[0]._id,
            paymentStatus: "paid",
            paymentAmount: finalAmount,
            paymentMethod: "bank_transfer",
            referenceNumber: data.referenceNumber,
            bankName: data.bankName,
            branch: data.branch,
            paidBy: authState.user.userId,
            customer: occupiedReservation(selectedSlot)[0].user,
        }

        await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation-payment`, paymentData)
        setIsBankTransferPopupOpen(false);
        toast.success("Payment received successfully");
        await handleReservationComplete(occupiedReservation(selectedSlot)[0]._id)
       
    }

    const handlePaymentOptionSubmit = async (data) => {
        if (data.paymentMethod === "cash") {
            const paymentData = {
                reservation: occupiedReservation(selectedSlot)[0]._id,
                paymentStatus: "paid",
                paymentAmount: finalAmount,
                paymentMethod: "cash",
                paidBy: authState.user.userId,
                customer: occupiedReservation(selectedSlot)[0].user,
            }
            await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation-payment`, paymentData)
            toast.success("Payment received successfully");
            await handleReservationComplete(occupiedReservation(selectedSlot)[0]._id)


        }
        else if (data.paymentMethod === "bank_transfer") {
            setIsBankTransferPopupOpen(true);
        }
        else if (data.paymentMethod === "customer") {
            await handlePaymentByCustomer(occupiedReservation(selectedSlot)[0]._id)
            // const paymentDetails = {
            //     order_id: occupiedReservation(selectedSlot)[0]._id,
            //     amount: finalAmount.toFixed(2),
            //     currency: "LKR",
            //     return_url: `/customer/find-parking-spot`,
            //     cancel_url: `/customer/find-parking-spot`,
            //     notify_url: `${import.meta.env.VITE_BACKEND_APP_URL_PUBLIC}/api/v1/reservation-payment/notify`,
            //     first_name: authState.user.firstName,
            //     last_name: authState.user.lastName,
            //     email: authState.user.email,
            //     phone: authState.user.phoneNumber,
            //     address: parkingArea?.addressLine1 || "No Address",
            //     city: parkingArea?.city || "No City",
            //     country: "Sri Lanka",
            //     items: "Parking Reservation",
            //     custom_1: authState.user.userId,
            //     // custom_2: response.data.data.parkingSlot,
            // }
            // handlePayment(
            //     {
            //         paymentDetails,
            //         onComplete: async () => { await handleReservationComplete(occupiedReservation(selectedSlot)[0]._id) },
            //         hashUrl: `/v1/reservation-payment/generate-hash`
            //     })

        }
    }

    const handleReservationComplete = async (reservationId) => {
        await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}/complete`);
        toast.success("Reservation completed successfully");
        fetchParkingSlots();
    }

    const handlePaymentByCustomer = async (reservationId) => {
        await axios.patch(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/reservation/${reservationId}`,{status:"completed"});
        toast.success("Payment by customer successfully");
        fetchParkingSlots();
    }



    return (
        <>
            <div className="space-y-4">
                <div className="flex gap-2 items-center justify-center pb-2  ">
                    <input type="text" value={searchReservation} onChange={(e) => setSearchReservation(e.target.value)} className='w-1/2 border-2 border-gray-400 rounded-md px-4 py-2' placeholder='search reservation' />
                    <button className='bg-cyan-700 text-white  text-sm px-4 py-2 rounded-md hover:bg-cyan-800  ' onClick={() => setSearchReservation("")}> Clear</button>
                </div>
                {Object.entries(groupedSlots || {}).map(([vehicleType, slots]) => (
                    <div key={vehicleType} className="bg-white rounded-lg shadow-sm p-4 shadow-gray-400 border-2 border-gray-200">
                        <div className='flex items-center justify-between gap-2'>
                            <div className='flex items-center gap-2'>
                                <h3 className="text-3xl font-bold text-gray-700 mb-3 px-4">{vehicleType.toUpperCase()}</h3>
                                <h3 className="text-xl font-bold mb-3 text-cyan-700 border-l-2 border-gray-400 pl-4">Total Slots: {slots.length}</h3>
                                <h3 className="text-xl font-bold mb-3 text-emerald-700 border-l-2 border-gray-400 pl-4">Available Slots: {slots.filter(slot => slot?.isActive && (!slot?.isReserved && !slot?.isOccupied && !slot?.isReservationPending)).length}</h3>
                                <div className='flex items-center gap-2'>
                                    <h3 className="text-xl font-bold mb-3 text-cyan-700 border-l-2 border-gray-400 pl-4">Price: </h3>
                                    <span className="text-cyan-700 font-bold text-3xl mb-3">{slots[0].slotPrice ? `Rs.${slots[0].slotPrice}/hr` : 'N/A'}</span>
                                    <button
                                        className="bg-cyan-700 text-white px-4 py-2 rounded-md mb-3 flex items-center gap-2 hover:scale-110 transition-transform duration-200 ease-in-out bg-cyan-700"
                                        onClick={() => {
                                            setIsConfirmationPopupOpen(true)
                                            setVehicleTypeForPriceChange(slots[0].vehicleType._id)
                                        }}
                                    >
                                        <FaEdit />
                                    </button>
                                </div>

                            </div>
                            <button className='w-1/4 bg-cyan-700 text-white px-4 py-2  rounded-md mb-3 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-200 ease-in-out bg-cyan-700 mr-4' onClick={() => {
                                setIsParkingDetailsOpen(true)
                                setSelectedSlot(slots[0])
                            }}><FaPlus /> Add On-Spot Reservation</button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {slots.map((slot) => (
                                <div
                                    key={slot._id}
                                    className={`bg-${getSlotBackgroundColor(slot)}-300 hover:bg-${getSlotBackgroundColor(slot)}-400 rounded-lg p-2 hover:shadow-lg transition-shadow duration-300`}

                                >
                                    <div onClick={() => handleSlotClick(slot)} >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center">
                                                <div className="w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center mr-1">
                                                    {vehicleType.toLowerCase() === "car" && <FaCar className="text-cyan-500 text-xs" />}
                                                    {vehicleType.toLowerCase() === "truck" && <FaTruck className="text-cyan-500 text-xs" />}
                                                    {vehicleType.toLowerCase() === "bus" && <FaBus className="text-cyan-500 text-xs" />}
                                                    {vehicleType.toLowerCase() === "motorcycle" && <FaMotorcycle className="text-cyan-500 text-xs" />}
                                                </div>
                                                <span className="text-xs font-medium">{`${vehicleType.charAt(0).toUpperCase()}-${slot.slotNumber}`}</span>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] bg-${getSlotBackgroundColor(slot)}-100 text-${getSlotBackgroundColor(slot)}-800`}>
                                                {getSlotStatus(slot)}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-[10px]">
                                            <div className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded">
                                                <span className="text-gray-600">Vehicle Number:</span>
                                                <span className="w-1/2 font-bold text-2xltext-cyan-600 ml-4">{getVehicleNumber(slot)}</span>
                                            </div>

                                        </div>

                                    </div>
                                    <div className="flex justify-between items-center bg-cyan-100 px-1.5 py-0.5 rounded mt-2 cursor-pointer hover:bg-cyan-200 transition-all duration-300 hover:scale-105" onClick={() => {
                                        setIsReservationDetailsOpen(true)
                                        setSelectedSlot(slot)
                                    }
                                    }>
                                        <span className=" text-[10px] text-cyan-800">{"Reservations: "}</span>
                                        <span className="w-1/2 font-bold text-cyan-800 text-sm ml-4">{slot?.reservationIds?.length > 0 ? getActiveReservations(slot) : 0}</span>
                                    </div> 
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <PopUpMenu
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                title="Update Slot Status"
                message={selectedSlot ? getSlotDetails(selectedSlot) : ''}
                type="info"
                buttons={
                    parkingArea?.parkingSubscriptionPaymentId?.subscriptionEndDate && dayjs(parkingArea.parkingSubscriptionPaymentId.subscriptionEndDate).isAfter(dayjs()) && getSlotStatus(selectedSlot) !== "Pending" ? ([
                        (selectedSlot?.isActive && (getActiveReservations(selectedSlot) === 0)) ? {
                            text: "Set Inactive",
                            variant: "danger",
                            icon: <FaTimes />,
                            onClick: () => handleStatusUpdate({data:{ isActive: false },type:"inactive"})
                        } : {},
                        !selectedSlot?.isActive ? {
                            text: "Set Active",
                            variant: "success",
                            icon: <FaCheck />,
                            onClick: () => handleStatusUpdate({data:{ isActive: true },type:"active"})
                        } : {},
                        (selectedSlot?.isActive && (occupiedReservation(selectedSlot).length > 0)) ? {
                            text: "Checkout",
                            variant: "success",
                            icon: <FaCheck />,
                            onClick: () => processParkingCheckout(occupiedReservation(selectedSlot))
                        } : {},
                        (selectedSlot?.isActive  && (occupiedReservation(selectedSlot).length === 0) && (findCurrentReservation(selectedSlot).length > 0)) ? {
                            text: "set Occupied",
                            variant: "success",
                            icon: <FaClock />,
                            onClick: () => handleStatusUpdate({ data: findCurrentReservation(selectedSlot)[0], type: "occupied" })
                        } : {},
                    ]) : []}
            />

            <ParkingDetailsPopup
                isOpen={isParkingDetailsOpen}
                onClose={() => setIsParkingDetailsOpen(false)}
                onSubmit={handleParkingDetailsSubmit}
                title="Parking Reservation Details"
                loading={loading}
            />
            <UserDetailsPopup
                isOpen={isUserDetailsOpen}
                key={userDetails?.customerMobile}
                onClose={() => setIsUserDetailsOpen(false)}
                onSubmit={handleParkingDetailsSubmit}
                title="User Details"
                loading={loading}
                initialData={userDetails}
            />
            <BankTransferPopup
                isOpen={isBankTransferPopupOpen}
                onClose={() => setIsBankTransferPopupOpen(false)}
                onSubmit={handleBankTransferSubmit}
                amount={finalAmount}
                parkingAreaId={null}
                parkingOwnerId={null}
                imagesRequired={false}
                maxImages={0}
            />
            <PaymentOptionPopup
                isOpen={isPaymentOptionPopupOpen}
                onClose={() => setIsPaymentOptionPopupOpen(false)}
                onSubmit={handlePaymentOptionSubmit}
                amount={finalAmount}
                initialOptions={paymentOption}

            />
            <ConfirmationPopup
                isOpen={isConfirmationPopupOpen}
                onClose={() => setIsConfirmationPopupOpen(false)}
                onConfirm={() => setIsPromptPopupOpen(true)}
                title="Confirmation"
                message="Are you sure you want to change the price?"
            />
            <PromptPopup
                isOpen={isPromptPopupOpen}
                onClose={() => setIsPromptPopupOpen(false)}
                onConfirm={handlePriceChange}
                title="Prompt"
                message="Enter the new price:"
                type="number"
                placeholder="Enter the new price"
                minValue={0}
            />
            <ReservationDetailsPopup
                isOpen={isReservationDetailsOpen}
                onClose={() => setIsReservationDetailsOpen(false)}
                parkingSlotId={selectedSlot?._id}
                parkingSlotData={selectedSlot}
                onReservationUpdate={fetchParkingSlots}
            />
        </>
    );
};

export default ListParkingSlots;