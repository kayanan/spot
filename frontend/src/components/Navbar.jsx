// // src/pages/components/Navbar.jsx

// import { MenuIcon, SearchIcon, BellIcon, ChevronDownIcon, UserCircleIcon } from "@heroicons/react/outline";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const navigate = useNavigate();

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="mb-16">
//       <nav
//         className={`bg-gray-800 h-16 flex items-center fixed top-0 ${
//           isSidebarOpen ? "left-64" : "left-20"
//         } right-0 z-30 transition-all duration-300`}
//       >
//         {/* Sidebar Toggle Button */}
//         <button
//           onClick={toggleSidebar}
//           className="text-gray-400 hover:text-cyan-500 focus:outline-none ml-4 transition-colors duration-200"
//         >
//           <MenuIcon className="h-6 w-6" />
//         </button>

//         {/* Search Box */}
//         <div className="flex-grow mx-4">
//           <div className="relative w-3/4 max-w-2xl">
//             <input
//               type="text"
//               placeholder="Search here..."
//               className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
//             />
//             <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//           </div>
//         </div>

//         {/* Notification and Profile Section */}
//         <div className="flex items-center space-x-6 mr-8 relative">
//           {/* Notification Icon */}
//           <div className="relative group">
//             <BellIcon className="h-6 w-6 text-gray-400 cursor-pointer hover:text-cyan-500 transition-colors duration-200" />
//             <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center text-xs text-white font-medium">
//               3
//             </span>
//           </div>

//           {/* Profile Section */}
//           <div className="flex items-center space-x-3 cursor-pointer group" onClick={toggleDropdown}>
//             <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
//               <UserCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-cyan-500 transition-colors duration-200" />
//             </div>
//             <ChevronDownIcon
//               className={`h-5 w-5 text-gray-400 group-hover:text-cyan-500 transition-all duration-200 ${
//                 isDropdownOpen ? "rotate-180" : ""
//               }`}
//             />
//           </div>

//           {/* Dropdown Menu */}
//           {isDropdownOpen && (
//             <div className="absolute right-0 top-14 bg-gray-800 rounded-lg shadow-lg w-48 border border-gray-700 transform transition-all duration-200">
//               <ul className="py-2">
//                 <li
//                   className="py-2.5 px-4 hover:bg-gray-700 text-gray-400 hover:text-cyan-500 cursor-pointer transition-colors duration-200"
//                   onClick={() => navigate("/profile")}
//                 >
//                   View Profile
//                 </li>
//                 <li
//                   className="py-2.5 px-4 hover:bg-gray-700 text-red-400 hover:text-red-500 font-medium cursor-pointer transition-colors duration-200"
//                 >
//                   Logout
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default Navbar;


// frontend/src/components/Navbar.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userImage from "../assets/user.png"; // Default profile image fallback
import PropTypes from "prop-types";

// Heroicons (v1) or outline icons
import {
  MenuIcon,
  ChevronDownIcon,
  XIcon,
  UserIcon,
  LogoutIcon,
} from "@heroicons/react/outline";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  // States for profile dropdown, mobile menu
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // State for current date/time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Auth and navigation
  const { authState, logout } = useAuth();
  const user = authState.user;
  const navigate = useNavigate();

  // Refs for detecting clicks outside dropdowns
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Profile image or fallback
  const profileImageUrl = user?.profileImage
    ? `${import.meta.env.VITE_BACKEND_URL}${user.profileImage}`
    : userImage;

  // Format date/time for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Update date/time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("[data-mobile-toggle]")
      ) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle sidebar (desktop)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`bg-gray-800 h-16 flex items-center fixed top-0 ${isSidebarOpen ? "left-64" : "left-20"
          } right-0 z-30 transition-all duration-300 border-b border-gray-700`}
      >
        {/* Sidebar Toggle */}
        <div className="flex items-center ml-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 rounded-md p-1"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Date/Time */}
        <div className="flex-grow mx-4 text-center hidden md:block text-gray-300 font-medium">
          {formatDate(currentDateTime)}
        </div>

        {/* Mobile Profile Icon */}
        <div className="md:hidden flex items-center justify-end flex-grow mr-4">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            data-mobile-toggle
            aria-label="Open menu"
          >
            <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-600">
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = userImage; }}
              />
            </div>
          </button>
        </div>

        {/* Desktop Profile */}
        <div className="hidden md:flex items-center space-x-4 mr-4 relative">
          {/* Profile Dropdown */}
          <div
            className="relative flex items-center space-x-2 cursor-pointer"
            ref={profileDropdownRef}
            onClick={toggleProfileDropdown}
          >
            <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-600">
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = userImage; }}
              />
            </div>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`}
            />
            {showProfileDropdown && (
              <div className="absolute right-0 top-12 bg-gray-800 rounded-md shadow-lg w-56 border border-gray-700 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-600">
                      <img
                        src={profileImageUrl || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = userImage; }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
                    </div>
                  </div>
                </div>
                <ul>
                  <li
                    className="flex items-center py-2 px-4 hover:bg-gray-700 text-gray-300 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileDropdown(false);
                      navigate("/profile");
                    }}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </li>
                  <li
                    className="flex items-center py-2 px-4 hover:bg-gray-700 text-red-400 font-medium cursor-pointer border-t border-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileDropdown(false);
                      logout(true);
                    }}
                  >
                    <LogoutIcon className="h-4 w-4 mr-2" />
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-y-0 right-0 w-64 bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${showMobileMenu ? "translate-x-0" : "translate-x-full"
          } md:hidden flex flex-col`}
      >
        {/* -- Header row with "Hello Friend" and Close button -- */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-200">Hello Friend</h2>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="text-gray-400 hover:text-cyan-500 focus:outline-none"
              aria-label="Close menu"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* -- User info block -- */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-600">
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = userImage;
                }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-200">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* -- Profile actions -- */}
        <div className="p-4 border-b border-gray-700">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full py-2 px-3 rounded-md hover:bg-gray-700 text-gray-300"
              >
                <UserIcon className="h-5 w-5 mr-3" />
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  logout(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full py-2 px-3 rounded-md hover:bg-gray-700 text-red-400"
              >
                <LogoutIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* -- Stuck to the bottom -- */}
        <div className="border-t border-gray-700 p-4 mt-auto">
          <p className="text-xs text-gray-400">Current time</p>
          <p className="text-sm text-gray-300">{formatDate(currentDateTime)}</p>
        </div>
      </div>

      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
};

Navbar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Navbar;

