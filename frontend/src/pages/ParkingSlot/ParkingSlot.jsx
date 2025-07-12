import ViewParkingArea from "../User/ParkingOwner/ParkingArea/ViewParkingArea";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ParkingSlot = () => {
    const { id } = useParams();
    

    useEffect(() => {
        const fetchUser = async () => {
            try {

                const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${authState.user.userId}`, { withCredentials: true });
                console.log(response.data.data.parkingAreaID, "response.data.data.parkingAreaID");
                setParkingOwnerId(response.data.data.parkingAreaID);
            }
            catch (error) {
                console.error("Error fetching parking owner id:", error);
            }
        }
        fetchUser();
    }, []);

    return (
        <div>
            <ViewParkingArea parkingOwnerId={parkingOwnerId} />
        </div>
    )
}

export default ParkingSlot;