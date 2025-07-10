// src/pages/User/UserList.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  EyeIcon,
  PencilAltIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ToggleGroup from "../../../utils/ToggleGroup";
import { statusOptions } from "../../../utils/DropdownOptions";

const RoleList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState(state?.status || true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 10;
  const [deleted, setDeleted] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/roles/`,
          { withCredentials: true }
        );
        console.log(data);
        setRoles(data.roles);
      } catch (error) {
        console.error("Error fetching roles:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [deleted]);

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this item?")) {
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_ADMIN_URL}/v1/roles/${id}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.error("Role deleted!");
      setTimeout(() => navigate("/role", { state: { status } }), 300);
      setDeleted((prev) => !prev);
    } catch (error) {
      toast.error("Error deleting Role. Please try again.");
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.isActive === status &&
      (searchTerm
        ? role.type?.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = filteredRoles.slice(
    indexOfFirstRole,
    indexOfLastRole
  );
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div
        className={`flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 `}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-500">
          Roles
        </h1>
        <div className={`flex items-center gap-3 w-full sm:w-auto`}>
          <input
            type="text"
            placeholder="Search roles..."
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
        <button
          onClick={() => navigate("/role/add", { state: { status } })}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md shadow-md transition w-full sm:w-auto"
        >
          Add Role
        </button>
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
                <th className="py-3 px-4 font-semibold">#</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRoles.map((role, index) => (
                <tr key={role._id} className="border-t hover:bg-cyan-50">
                  <td className="py-3 px-4 flex justify-center items-center">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">{role?.type.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4">{role?.description}</td>
                  <td className="py-3 px-4 flex justify-center gap-2 space-x-2">
                    <Link
                      to={`/role/view/${role._id}`}
                      state={{ Role: role }}
                      className="bg-teal-400 hover:bg-teal-600 text-white px-3 py-2 rounded-full"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() =>
                        navigate(`/role/update/${role._id}`, {
                          state: { Role: role },
                        })
                      }
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-full"
                    >
                      <PencilAltIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(role._id);
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-full"
                    >
                      <TrashIcon className="h-5 w-5" />
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
                className="w-24 px-4 py-2 mb-6 bg-gray-300 hover:bg-gray-600 rounded-md text-center"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-24 px-4 py-2 mb-6 bg-gray-300 hover:bg-gray-600 rounded-md text-center"
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

export default RoleList;
