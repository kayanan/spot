// src/pages/User/UserList.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ToggleGroup from "../../utils/ToggleGroup";
import { statusOptions } from "../../utils/DropdownOptions";

const ListSubscriptionFees = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [parkingSubscriptionFees, setParkingSubscriptionFees] = useState([]);
  const [status, setStatus] = useState(state?.status || true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const parkingSubscriptionFeesPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/parking-subscription-fee/`,
          { withCredentials: true }
        );
        console.log(data);
        setParkingSubscriptionFees(data || []);
      } catch (error) {
        console.error("Error fetching parking subscription fees:", error.message);
        toast.error("Failed to fetch parking subscription fees. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [status]);

  const filteredParkingSubscriptionFees = parkingSubscriptionFees?.filter(
    (parkingSubscriptionFee) =>
      (searchTerm
        ? parkingSubscriptionFee?.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parkingSubscriptionFee?.startDate?.toString().includes(searchTerm) ||
          parkingSubscriptionFee?.endDate?.toString().includes(searchTerm) ||
          parkingSubscriptionFee?.below100?.toString().includes(searchTerm) ||
          parkingSubscriptionFee?.between100and300?.toString().includes(searchTerm) ||
          parkingSubscriptionFee?.between300and500?.toString().includes(searchTerm) ||
          parkingSubscriptionFee?.above500?.toString().includes(searchTerm)
        : true)
  );
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this parking subscription fee?")) {
      try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/parking-subscription-fee/${id}`, { withCredentials: true });
      toast.error("Parking subscription fee deleted successfully");
      setTimeout(() => {
       
        navigate("/parking-subscription-fee", { state: { key: id } });
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete parking subscription fee. Please try again.");

    }
  };  
  
  }

  const indexOfLastParkingSubscriptionFee = currentPage * parkingSubscriptionFeesPerPage;
  const indexOfFirstParkingSubscriptionFee = indexOfLastParkingSubscriptionFee - parkingSubscriptionFeesPerPage;
  const currentParkingSubscriptionFees = filteredParkingSubscriptionFees?.slice(indexOfFirstParkingSubscriptionFee, indexOfLastParkingSubscriptionFee);
  const totalPages = Math.ceil(filteredParkingSubscriptionFees?.length / parkingSubscriptionFeesPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 pr-24">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-500">
          Parking Subscription Fees
        </h1>
       
          <input
            type="text"
            placeholder="Search parking subscription fees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
          />
          <ToggleGroup
            value={status}
            setValue={setStatus}
            values={statusOptions}
          />
       <div className="flex justify-end">
        <button
          onClick={() => navigate("/parking-subscription-fee/add")}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-full"
        >
          Add New Parking Subscription Fee
        </button>
       </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 font-semibold">Vehicle Type</th>
                <th className="py-3 px-4 font-semibold">Start Date</th>
                <th className="py-3 px-4 font-semibold">End Date</th>
                <th className="py-3 px-4 font-semibold">Below 100</th>
                <th className="py-3 px-4 font-semibold">Between 100 and 300</th>
                <th className="py-3 px-4 font-semibold">Between 300 and 500</th>
                <th className="py-3 px-4 font-semibold">Above 500</th>
                <th className="py-3 px-4 font-semibold">Created By</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentParkingSubscriptionFees?.map((parkingSubscriptionFee) => (
                <tr key={parkingSubscriptionFee._id} className="border-t hover:bg-cyan-50">
                  <td className="py-3 px-4">
                    {parkingSubscriptionFee?.vehicleType?.vehicleType?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.startDate.split("T")[0]}</td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.endDate.split("T")[0]}</td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.below100.toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.between100and300.toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.between300and500.toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.above500.toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
                  <td className="py-3 px-4 text-center">{parkingSubscriptionFee?.createdBy?.firstName} {parkingSubscriptionFee?.createdBy?.lastName
                    }</td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                   <button
                      onClick={() => handleDelete(parkingSubscriptionFee._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/parking-subscription-fee/update/${parkingSubscriptionFee._id}`, {
                          state: { parkingSubscriptionFee },
                        })
                      }
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-full"
                    >
                      <PencilAltIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="w-24 px-4 py-2 mb-6 bg-gray-300 hover:bg-gray-600 rounded-md text-center disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-24 px-4 py-2 mb-6 bg-gray-300 hover:bg-gray-600 rounded-md text-center disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ListSubscriptionFees;
