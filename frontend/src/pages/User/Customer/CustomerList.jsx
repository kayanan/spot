// src/pages/User/UserList.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { EyeIcon, PencilAltIcon } from "@heroicons/react/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ToggleGroup from "../../../utils/ToggleGroup";
import { statusOptions } from "../../../utils/DropdownOptions";

const CustomerList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(state?.status || true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/users/list`,

          { withCredentials: true,
            params: {
              isActive: status,
              role: "CUSTOMER",
              page: currentPage,
              limit: usersPerPage,
            }
           }
        );
        console.log(data.users);
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error.message);
        toast.error("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [status]);

  const filteredUsers = users.filter(
    (user) =>
      user.isActive === status &&
      (searchTerm
        ? user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber?.toString().replace(/^94/, '0')?.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );


  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 pr-24">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-500">
          Users
        </h1>
       
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
          />
          <ToggleGroup
            value={status}
            setValue={setStatus}
            values={statusOptions}
          />
       
              
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
                <th className="py-3 px-4 font-semibold">Profile</th>
                <th className="py-3 px-4 font-semibold">First Name</th>
                <th className="py-3 px-4 font-semibold">Last Name</th>
                <th className="py-3 px-4 font-semibold">NIC</th>
                <th className="py-3 px-4 font-semibold">Mobile</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-cyan-50">
                  <td className="py-3 px-4">
                    <img
                      src={
                        user.profileImage
                          ? `${import.meta.env.VITE_BACKEND_URL}${user.profileImage}`
                          : `/assets/default-avatar.png`
                      }
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover mx-auto"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">{user?.firstName}</td>
                  <td className="py-3 px-4 text-center">{user?.lastName}</td>
                  <td className="py-3 px-4 text-center">{user?.nic}</td>
                  <td className="py-3 px-4 text-center">{user?.phoneNumber.toString().replace(/^94/, '0')}</td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                    <Link
                      to={`/customer/view/${user._id}`}
                      state={{ user }}
                      className="bg-teal-400 hover:bg-teal-600 text-white px-3 py-2 rounded-full"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() =>
                        navigate(`/customer/update/${user._id}`, {
                          state: { user },
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

export default CustomerList;
