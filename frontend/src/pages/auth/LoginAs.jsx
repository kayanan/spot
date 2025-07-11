import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
    FaUserShield,
    FaCar,
    FaUserTie,
    FaUser,
    FaArrowRight,
    FaSignOutAlt
} from "react-icons/fa";

const LoginAs = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userRoles, setUserRoles] = useState(location.state.roles || []);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const { loginAs } = useAuth();
    // useEffect(() => {
    //     fetchUserRoles();
    // }, []);

    // const fetchUserRoles = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile`, {
    //             withCredentials: true,
    //         });

    //         const roles = response.data.user.role || [];
    //         setUserRoles(roles);

    //         // If only one role, auto-select it
    //         if (roles.length === 1) {
    //             handleRoleSelect(roles[0]);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching user roles:", error);
    //         toast.error("Failed to load user roles");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleRoleSelect = async (role) => {
        try {
            setSelectedRole(role);

            // // Call API to switch role context
            // await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/auth/switch-role`, {
            //     role: role
            // }, {
            //     withCredentials: true,
            // });
            loginAs(role);

            toast.success(`Switched to ${getRoleDisplayName(role)}`);

            // Navigate based on role
            // setTimeout(() => {
            //     navigate(getRoleDashboard(role));
            // }, 1000);

        } catch (error) {
            console.error("Error switching role:", error);
            toast.error("Failed to switch role");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_APP_URL}/v1/auth/logout`, {}, {
                withCredentials: true,
            });
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
            toast.error("Failed to logout");
        }
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            'ADMIN': 'Administrator',
            'PARKING_OWNER': 'Parking Owner',
            'PARKING_MANAGER': 'Parking Manager',
            'CUSTOMER': 'Customer'
        };
        return roleNames[role] || role;
    };

    const getRoleIcon = (role) => {
        const icons = {
            'ADMIN': FaUserShield,
            'PARKING_OWNER': FaCar,
            'PARKING_MANAGER': FaUserTie,
            'CUSTOMER': FaUser
        };
        return icons[role] || FaUser;
    };

    const getRoleDescription = (role) => {
        const descriptions = {
            'ADMIN': 'Full system access with user management and analytics',
            'PARKING_OWNER': 'Manage parking areas and view business insights',
            'PARKING_MANAGER': 'Oversee parking operations and staff management',
            'CUSTOMER': 'Book parking spots and manage reservations'
        };
        return descriptions[role] || 'Access to role-specific features';
    };

    const getRoleColor = (role) => {
        const colors = {
            'ADMIN': 'from-purple-500 to-indigo-600',
            'PARKING_OWNER': 'from-blue-500 to-cyan-600',
            'PARKING_MANAGER': 'from-green-500 to-emerald-600',
            'CUSTOMER': 'from-orange-500 to-amber-600'
        };
        return colors[role] || 'from-gray-500 to-gray-600';
    };

    const getRoleDashboard = (role) => {
        const dashboards = {
            'ADMIN': '/admin-dashboard',
            'PARKING_OWNER': '/owner',
            'PARKING_MANAGER': '/manager-dashboard',
            'CUSTOMER': '/customer-dashboard'
        };
        return dashboards[role] || '/dashboard';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your roles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Choose Your Role</h1>
                    <p className="text-gray-600 text-lg">
                        Select the role you'd like to access today
                    </p>
                </div>

                {/* Role Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {userRoles.map((role) => {
                        const IconComponent = getRoleIcon(role);
                        const isSelected = selectedRole === role;

                        return (
                            <div
                                key={role}
                                onClick={() => handleRoleSelect(role)}
                                className={`
                  relative group cursor-pointer transform transition-all duration-300 hover:scale-105
                  ${isSelected ? 'ring-4 ring-blue-400' : 'hover:shadow-xl'}
                `}
                            >
                                <div className={`
                  bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent
                  ${isSelected ? 'border-blue-400 bg-blue-50' : 'hover:border-gray-200'}
                `}>
                                    {/* Role Icon */}
                                    <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto
                    bg-gradient-to-r ${getRoleColor(role)}
                    ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                    transition-transform duration-300
                  `}>
                                        <IconComponent className="text-white text-2xl" />
                                    </div>

                                    {/* Role Title */}
                                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                                        {getRoleDisplayName(role)}
                                    </h3>

                                    {/* Role Description */}
                                    <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">
                                        {getRoleDescription(role)}
                                    </p>

                                    {/* Select Button */}
                                    <div className={`
                    flex items-center justify-center space-x-2 py-2 px-4 rounded-lg
                    ${isSelected
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 group-hover:bg-blue-500 group-hover:text-white'
                                        }
                    transition-all duration-300
                  `}>
                                        <span className="text-sm font-medium">
                                            {isSelected ? 'Selected' : 'Select'}
                                        </span>
                                        <FaArrowRight className={`text-sm ${isSelected ? 'text-white' : 'group-hover:text-white'}`} />
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Logout Section */}
                <div className="text-center">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        You can switch between roles at any time from your profile menu
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginAs;