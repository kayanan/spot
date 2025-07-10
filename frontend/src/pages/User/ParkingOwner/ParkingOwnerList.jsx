// src/pages/User/ParkingOwner/ParkingOwnerList.jsx

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { EyeIcon, PencilAltIcon } from "@heroicons/react/outline";
import Dropdown from "../../../utils/Dropdown";
import { approvalStatusOptions, isActiveOptions } from "../../../utils/DropdownOptions";

const ParkingOwnerList = () => {
  const [parkingOwners, setParkingOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [pendingOwnersCount, setPendingOwnersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState( {
    role: "PARKING_OWNER",
    approvalStatus: "true",
    isActive: "true"
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch parking owners on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/list`,
          { withCredentials: true,
            params: {
              ...filters
            }
           }
        );

        setParkingOwners(res.data.users);
        setFilteredOwners(res.data.users);
      } catch (error) {
        console.error("Error fetching parking owners:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Filter owners based on search term
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = parkingOwners.filter((owner) => {
      return (
        owner.firstName.toLowerCase().includes(lowerSearch) ||
        owner.lastName.toLowerCase().includes(lowerSearch) ||
        owner.nic?.toLowerCase().includes(lowerSearch) ||
        owner.mobile?.toLowerCase().includes(lowerSearch)
      );
    });
    setFilteredOwners(filtered);
  }, [searchTerm, parkingOwners]);
 useEffect(() => {
  const fetchPendingOwnersCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/pending-owners-count`,
        { withCredentials: true }
      );
      setPendingOwnersCount(res.data.count);
    } catch (error) {
      console.error("Error fetching pending owners count:", error.message);
    }
  };
  fetchPendingOwnersCount();
 }, []);
  // Handle dropdown changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-500">
          Parking Owner Management
        </h1>
        <div className="w-full sm:w-auto sm:flex-1 sm:mx-4 relative">

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-4">
        
        <h1 className="text-1xl sm:text-2xl font-bold text-gray-500 w-full">
          Approved Parking Owners List
        </h1>


        {/* Status */}
        <Dropdown
          label="Status"
          filterName="isActive"
          selectedValue={filters.isActive}
          options={isActiveOptions}
          onChange={handleFilterChange}
        />
        <Link 
          to="/owner/pending-request" 
          className="ml-10 inline-flex items-center justify-center w-1/2 bg-cyan-500 hover:bg-cyan-600 text-white px-2 py-1 h-10 rounded-full transition duration-200 shadow-md hover:shadow-lg relative"
        >
          <span> Pending Requests</span>
          {pendingOwnersCount > 0 && (
            <span className="absolute -top-5 -right-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center">
              {pendingOwnersCount}
            </span>
          )}
        </Link>
        <button
            onClick={() => navigate("/owner/add", { state: { isActive } })}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-2 py-1 h-10 rounded-md shadow-md transition w-full sm:w-auto"
          >
            Add Parking Owner
          </button>
      </div>
      

      {/* Loading Spinner or Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full table-auto text-sm hidden md:table">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 px-4 font-semibold">Profile</th>
                  <th className="py-3 px-4 font-semibold">First Name</th>
                  <th className="py-3 px-4 font-semibold">Last Name</th>
                  <th className="py-3 px-4 font-semibold">NIC</th>
                  <th className="py-3 px-4 font-semibold">Mobile</th>
                  <th className="py-3 px-4 font-semibold">Approval</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <tr
                    key={owner._id}
                    className="border-t hover:bg-cyan-50"
                  >
                    <td className="py-3 px-4 text-center">
                      <img
                        src={
                          owner.profileImage
                            ? `${import.meta.env.VITE_BACKEND_URL}${owner.profileImage}`
                            : `http://localhost:5173/assets/default-avatar.png`
                        }
                        alt="Profile"
                        className="h-10 w-10 sm:h-16 sm:w-16 rounded-full object-cover mx-auto"
                      />
                    </td>
                    <td className="py-3 px-4">{owner.firstName}</td>
                    <td className="py-3 px-4">{owner.lastName}</td>
                    <td className="py-3 px-4">{owner.nic}</td>
                    <td className="py-3 px-4">{owner.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        owner.approvalStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {owner.approvalStatus ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        owner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {owner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-center space-x-2">
                      <Link
                        to={`/owner/view/${owner._id}` }
                        state={{ filters }}
                        className="bg-gray-400 hover:bg-gray-600 text-white px-3 py-2 rounded-full mt-4"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/owner/update/${owner._id}`}
                        state={{ filters }}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-full mt-4"
                      >
                        <PencilAltIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Stacked Layout */}
            <div className="md:hidden">
              {filteredOwners.map((owner) => (
                <div
                  key={owner._id}
                  className="border-b p-4 flex flex-col space-y-2 hover:bg-cyan-50"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        owner.profileImage
                          ? `${import.meta.env.VITE_BACKEND_URL}${owner.profileImage}`
                          : `http://localhost:5173/assets/default-avatar.png`
                      }
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{`${owner.firstName} ${owner.lastName}`}</h3>
                      <div className="flex space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          owner.approvalStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {owner.approvalStatus ? 'Approved' : 'Pending Approval'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          owner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {owner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">NIC:</span> {owner.nic}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Mobile:</span> {owner.mobile}
                  </p>
                  <div className="flex justify-between">
                    <Link
                      to={`/owner/view/${owner._id}`}
                      className="bg-gray-400 hover:bg-gray-600 text-white px-3 py-2 rounded-full"
                    >
                      View
                    </Link>
                    <Link
                      to={`/owner/update/${owner._id}`}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-full"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingOwnerList;
