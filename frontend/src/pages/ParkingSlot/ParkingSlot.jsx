import ViewParkingArea from "../User/ParkingOwner/ParkingArea/ViewParkingArea";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ParkingSlot = () => {
    const { authState } = useAuth();
    const [parkingOwnerId, setParkingOwnerId] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {

                const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${authState.user.userId}`, { withCredentials: true });
                setParkingOwnerId(response.data.data.parkingOwnerId);
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