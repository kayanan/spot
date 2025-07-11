

// frontend/src/components/Sidebar.jsx
// Production‐ready, improved design sidebar with expandable sub‐menus,
// smooth transitions, and auto‐expansion for active child routes.

import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MapIcon,
  UsersIcon,
  ChartBarIcon,
  ChevronRightIcon,
  IdentificationIcon,
  CalendarIcon,
  OfficeBuildingIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  LocationMarkerIcon,
  CashIcon,
  HomeIcon,
} from "@heroicons/react/outline";

import { FaParking } from "react-icons/fa";


import { useAuth } from "../context/AuthContext";

// If you're not using Next.js or a framework requiring "use client", remove this line.
// "use client";

const Sidebar = ({ isOpen }) => {
  const { authState } = useAuth();
  const privilege = authState?.privilege || "";
  const location = useLocation();

  // Track which menus are open using an object: { [menuName]: boolean }
  const [openMenus, setOpenMenus] = useState({});

  // Define the navigation links, including children for "Branch Transactions"
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: ChartBarIcon, privilege: ["ADMIN", "PARKING_OWNER", "PARKING_MANAGER", "CUSTOMER"] },
    { name: "Location Management", path: "/province", icon: MapIcon, privilege: ["ADMIN"] },
    { name: "Subscription Management", path: "/parking-subscription-fee", icon: CalendarIcon, privilege: ["ADMIN"] },
    {
      name: "User Management",
      icon: UsersIcon,
      privilege: ["ADMIN"],
      children: [
        { name: "Paking Owner", path: "/owner", icon: OfficeBuildingIcon, privilege: ["ADMIN"] },
        { name: "Customers", path: "/customer", icon: UserCircleIcon, privilege: ["ADMIN"] },
        { name: "Roles", path: "/role", icon: ShieldCheckIcon, privilege: ["ADMIN"] },
      ],
    },
    {
      name: "Reports", icon: ChartBarIcon,
      privilege: ["ADMIN", "PARKING_OWNER"],
      children: [
        { name: "Parking Payments", path: "/reports/parking-payments", icon: CashIcon, privilege: ["ADMIN", "PARKING_OWNER"] },
        { name: "Admin Report", path: "/reports/admin", icon: ChartBarIcon, privilege: ["ADMIN"] },
        { name: "Parking Owner Report", path: "/reports/parking-owner", icon: ChartBarIcon, privilege: ["ADMIN", "PARKING_OWNER"] },

      ],
    },
    {
      name: "Area Management", icon: LocationMarkerIcon,
      privilege: ["ADMIN", "PARKING_OWNER"],
      children: [
        { name: "Parking Areas", privilege: ["ADMIN", "PARKING_OWNER"], path: "/parking-area-home", icon: MapIcon },
        { name: "Staffs", privilege: ["ADMIN", "PARKING_OWNER"], path: "/parking-staff", icon: IdentificationIcon },
      ],
    },
    { name: "Parking Slot", path: `/parking-slot/${authState.user.userId}`, icon: FaParking, privilege: ["ADMIN", "PARKING_MANAGER", "PARKING_OWNER"] },
    { name: "Customer", path: "/customer-landing-page", icon: UserCircleIcon, privilege: ["ADMIN",  "CUSTOMER"] },

  ];

  // Auto‐expand any menu that has an active child route
  useEffect(() => {
    const currentPath = location.pathname;
    navLinks.forEach((link) => {
      if (link.children) {
        const hasActiveChild = link.children.some((child) =>
          currentPath.startsWith(child.path)
        );
        if (hasActiveChild) {
          setOpenMenus((prev) => ({ ...prev, [link.name]: true }));
        }
      }
    });
  }, [location.pathname]);

  // Toggle a specific menu by name
  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white shadow-lg z-40 flex flex-col ${isOpen ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out`}
    >
      {/* Sidebar Header */}
      <div className="flex flex-col items-center py-6 border-b border-gray-700">
        <h2
          className={`${isOpen ? "text-2xl font-bold text-cyan-400" : "text-lg font-bold text-cyan-400"
            } transition-all duration-300`}
        >
          {isOpen ? "FindMySpot" : "FMS"}
        </h2>
        {isOpen && (
          <p className="text-sm font-medium text-gray-400 mt-1 transition-opacity duration-300">
            Parking Management System
          </p>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col w-full mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        {navLinks
          // Filter top-level items by privilege
          .filter((link) => link.privilege?.includes(privilege))
          .map((link) => {
            // If the link has children => sub-menu
            if (link.children && link.children.length > 0) {
              const isMenuOpen = openMenus[link.name] || false;
              // Determine if any child is active
              const hasActiveChild = link.children.some((child) =>
                location.pathname.startsWith(child.path)
              );

              return (
                <div key={link.name} className="px-3 py-1">
                  {/* Parent item */}
                  <div
                    onClick={() => toggleMenu(link.name)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 group ${hasActiveChild
                      ? "bg-cyan-500/20 text-white"
                      : "text-gray-300 hover:bg-gray-700/60"
                      }`}
                  >
                    {/* Left side: icon + label */}
                    <div className="flex items-center min-w-0">
                      <link.icon
                        className={`h-5 w-5 flex-shrink-0 ${hasActiveChild
                          ? "text-cyan-400"
                          : "text-gray-400 group-hover:text-gray-200"
                          }`}
                      />
                      {isOpen && (
                        <span className="ml-3 truncate transition-all duration-200">
                          {link.name}
                        </span>
                      )}
                    </div>

                    {/* Right side: chevron (only if expanded) */}
                    {isOpen && (
                      <ChevronRightIcon
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? "rotate-90" : ""
                          }`}
                      />
                    )}
                  </div>

                  {/* Submenu with smooth height animation */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div
                      className={`mt-1 ml-2 pl-2 border-l-2 border-gray-700 space-y-1 py-1 ${isOpen ? "" : "ml-0 pl-0 border-l-0"
                        }`}
                    >
                      {link.children
                        //filter submenu by privilege
                        .filter((sub) => sub.privilege?.includes(privilege))
                        .map((sub) => (
                          <NavLink
                            key={sub.name}
                            to={sub.path}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-cyan-500 text-white shadow-md"
                                : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                              }`
                            }
                          >
                            {sub.icon && (
                              <sub.icon
                                className={`h-4 w-4 flex-shrink-0 mr-2 ${location.pathname.startsWith(sub.path)
                                  ? "text-white"
                                  : "text-gray-500"
                                  }`}
                              />
                            )}
                            {isOpen && <span className="truncate">{sub.name}</span>}
                          </NavLink>
                        ))}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Normal top-level link
              const IconComponent = link.icon;
              // Determine if top-level link is active
              return (
                <div key={link.name} className="px-3 py-1">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${isActive
                        ? "bg-cyan-500 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-700/60 hover:text-gray-200"
                      }`
                    }
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="ml-3 truncate">{link.name}</span>}
                  </NavLink>
                </div>
              );
            }
          })}
      </div>

      {/* Optional footer */}
      {isOpen && (
        <div className="mt-auto border-t border-gray-700 p-4">
          <div className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} FindMySpot
          </div>
        </div>
      )}
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;