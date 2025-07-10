import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaEnvelope, FaPhone, FaUserAlt, FaCar, FaParking } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  </div>
);

const ViewCustomer = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const customer = state?.user;




  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <Link to="/user" className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600">
        <FaArrowLeft className="mr-2" />
        Back to Customer List
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full border-4 border-cyan-200 overflow-hidden">
            <img
              src={
                customer.profileImage
                  ? `${import.meta.env.VITE_BACKEND_URL}${customer.profileImage}`
                  : `/assets/default-avatar.png`
              }
              alt={`${customer.firstName} ${customer.lastName}`}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-cyan-700 capitalize">{`${customer.firstName} ${customer.lastName}`}</h2>
            <p className="text-lg text-gray-500">{customer.role?.type?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-700">Customer Details</h3>
            <span
              className={`text-base font-semibold px-3 py-1 rounded-full ${customer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >
              {customer.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">First Name</p>
              <p className="text-base font-semibold">{customer.firstName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Name</p>
              <p className="text-base font-semibold">{customer.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">NIC</p>
              <p className="text-base font-semibold">{customer.nic}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mobile</p>
              <p className="text-base font-semibold">{customer.mobile}</p>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold text-cyan-700 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-cyan-500 text-xl" />
              <a href={`mailto:${customer.email}`} className="text-base text-cyan-600 hover:underline">
                {customer.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-cyan-500 text-xl" />
              <span className="text-base">{customer.mobile}</span>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold text-cyan-700 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaUserAlt className="text-cyan-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="text-base font-semibold">{customer.role?.type?.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FaCar className="text-gray-500" />
              <p className="text-sm font-medium text-gray-500">Vehicle Numbers</p>
              <div className="flex flex-wrap gap-2">
               
                {customer?.vehicle?.map((vehicle, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${vehicle.isDefault
                      ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                  >
                    {vehicle.number}
                    {vehicle.isDefault && (
                      <span className="ml-1 text-xs text-cyan-600">(Default)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaParking className="text-cyan-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Preferred Parking</p>
                <p className="text-base font-semibold">{customer.preferredParking || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ViewCustomer; 