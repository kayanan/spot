// // src/context/AuthContext.jsx

// import PropTypes from "prop-types";
// import { createContext, useContext, useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify"; // optional: to show logout notification

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();

//   const [authState, setAuthState] = useState({
//     isAuthenticated: false,
//     user: null, // Will store the entire user object
//     privilegeList: [],
//     loginAs: false,
//   });
//   const [loading, setLoading] = useState(true);

//   // Reference to store the idle timeout ID
//   // const idleTimeoutId = useRef(null);

//   // Helper function: fetch full user from /auth/profile
//   const fetchFullUser = async () => {
//     try {
//       const { data } = await axios.get(
//         `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${authState.user?.userId}`,
//         {
//           withCredentials: true,
//         }
//       );
//       return data.user;
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//       throw error;
//     }
//   };

//   // LOGIN
//   const login = async (credentials) => {
//     try {
//       // 1) Log in (which sets an HTTP-only cookie with the token)
//       const { data } = await axios.post(
       
//         `${import.meta.env.VITE_BACKEND_APP_URL}/v1/auth/login`,
//         {
//           email: credentials.username, // Backend expects 'email' field
//           password: credentials.password
//         },
//         { withCredentials: true }
//       );
      
//       console.log("Login successful:", data);
//       if(data.roles.length > 1){
//         setAuthState({
//           isAuthenticated: false,
//           user: {
//             userId: data.userId,
//             firstName: data.firstName,
//             lastName: data.lastName,
//             email: data.email,
//             roles: data.roles,
//             mobileNumber: data?.mobileNumber || '',
  
//           },
//           token: data.accessToken,
//           privilegeList: data.roles || [],
//           loginAs: false,
//         });
//         navigate("/login-as", { state: { roles: data.roles } });
//       }
//       else{
//         setAuthState({
//           isAuthenticated: true,
//           user: {
//             userId: data.userId,
//             firstName: data.firstName,
//             lastName: data.lastName,
//             email: data.email,
//             roles: data.roles,
//             mobileNumber: data?.mobileNumber || '',
  
//           },
//           token: data.accessToken,
//           privilegeList: data.roles || [],
//           loginAs: true,
//         });
//         navigate("/dashboard");
//       }
//     } catch (error) {
//      console.log(error,"error");
      
//       console.error("Login failed:", error);
//       // rethrow the full error so error.response.status stays available
//       throw error;
//     }
//   };

//   // LOGOUT
//   const logout = async (manual = false) => {
//     try {
//       // Clear the cookie by calling logout endpoint
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_APP_URL}/v1/auth/logout`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );
//     } catch (error) {
//       console.error("Logout API call failed:", error);
//     }
    
//     // Always clear local state
//     setAuthState({
//       isAuthenticated: false,
//       user: null,
//       privilegeList: [],
//     });
//     navigate("/login");
    
//     if (manual) {
//       toast.success("You have been logged out successfully", {
//         position: "top-center",
//         autoClose: 3000,
//       });
//     } else {
//       toast.info("You have been logged out due to inactivity", {
//         position: "top-center",
//         autoClose: 3000,
//       });
//     }
//   };

//   // VALIDATE TOKEN: check if the user is still logged in
//   const validateToken = async () => {
//     try {
//       // Check if we have a valid session by making a request to the current user endpoint
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/current`,
//         {
//           withCredentials: true,
//         }
//       );
//       // If we get here, the user is authenticated
//       const data={
//         user: {
//           userId: response.data.userId,
//           firstName: response.data.firstName,
//           lastName: response.data.lastName,
//           email: response.data.email,
//           roles: response.data.roles,
//           mobileNumber: response.data?.mobileNumber || '',
//         },
//         privilegeList: response.data.roles || [],
//         isAuthenticated: false,
//       }
//       if(authState.loginAs){
//         setAuthState({
//           ...data,
//           isAuthenticated: true,
//           loginAs: true,
//         });
//       }
//       else{
//         setAuthState(data);
//       }
//     } catch (error) {
//       console.error(
//         "Token validation failed:",
//         error.message || error.response?.data
//       );
//       setAuthState({
//         isAuthenticated: false,
//         user: null,
//         privilegeList: [],
//       });
//       navigate("/login");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // (Optional) Refresh privileges
//   const updatePrivileges = async () => {
//     try {
//       const user = await fetchFullUser();
//       setAuthState((prev) => ({
//         ...prev,
//         user,
//         privilegeList: user.privilegeList || [],
//       }));
//       console.log("Privileges updated:", user.privilegeList);
//     } catch (error) {
//       console.error(
//         "Failed to update privileges:",
//         error.message || error.response?.data
//       );
//     }
//   };

//   const loginAs = async (role) => {
//     setAuthState(prev => ({
//       ...prev,
//       privilege: role,
//       isAuthenticated: true,
//       loginAs: true,
//     }));
//     navigate("/dashboard");
//   }
  

//   // Set up auto logout after 30 minutes of inactivity when user is authenticated
//   // useEffect(() => {
//   //   if (authState.isAuthenticated) {
//   //     // List of events that indicate user activity
//   //     const events = [
//   //       "mousemove",
//   //       "mousedown",
//   //       "keydown",
//   //       "scroll",
//   //       "touchstart",
//   //     ];

//   //     const resetIdleTimer = () => {
//   //       if (idleTimeoutId.current) {
//   //         clearTimeout(idleTimeoutId.current);
//   //       }
//   //       // Set the idle timer for 30 minutes (1800000 ms)
//   //       idleTimeoutId.current = setTimeout(() => {
//   //         logout();
//   //       }, 30 * 60 * 1000);
//   //     };

//   //     // Register the event listeners for each event
//   //     events.forEach((event) => {
//   //       window.addEventListener(event, resetIdleTimer);
//   //     });
//   //     // Initialize the timer on mount
//   //     resetIdleTimer();

//   //     // Cleanup event listeners and timer on unmount or when authState changes
//   //     return () => {
//   //       events.forEach((event) => {
//   //         window.removeEventListener(event, resetIdleTimer);
//   //       });
//   //       if (idleTimeoutId.current) {
//   //         clearTimeout(idleTimeoutId.current);
//   //       }
//   //     };
//   //   }
//   // }, [authState.isAuthenticated]);

//   // On mount, validate token
//   useEffect(() => {
//     validateToken();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
//         <span className="ml-3 text-gray-600">Loading...</span>
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider
//       value={{ authState, login, logout, updatePrivileges, loginAs }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export const useAuth = () => useContext(AuthContext);


// src/context/AuthContext.jsx

import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    privilegeList: [],
    loginAs: false,
  });

  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId) => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/profile/${userId}`,
      { withCredentials: true }
    );
    return data.user;
  };

  const login = async ({ username, password }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/auth/login`,
        { email: username, password },
        { withCredentials: true }
      );
console.log(data, "data");
      const baseUser = {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roles: data.roles,
        mobileNumber: data?.mobileNumber || "",
        parkingAreaId: data?.parkingAreaId || "",
      };
      if (data.roles.length > 1) {
        setAuthState({
          isAuthenticated: false,
          user: baseUser,
          privilegeList: data.roles,
          loginAs: false,
        });
        navigate("/login-as", { state: { roles: data.roles } });
      } else {
        localStorage.setItem('loginAs', true);
        localStorage.setItem('privilege', data.roles[0]);
        setAuthState({
          isAuthenticated: true,
          user: baseUser,
          privilegeList: data.roles,
          loginAs: true,
          privilege: data.roles[0],
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async (manual = false) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem('loginAs');
    localStorage.removeItem('privilege');
    setAuthState({
      isAuthenticated: false,
      user: null,
      privilegeList: [],
      loginAs: false,
    });

    navigate("/login");

    toast[manual ? "success" : "info"](
      manual ? "You have been logged out." : "Logged out due to inactivity.",
      { position: "top-center", autoClose: 3000 }
    );
  };

  const validateToken = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_APP_URL}/v1/user/current`,
        { withCredentials: true }
      );
      const loginAs = localStorage.getItem('loginAs');
      const baseUser = {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roles: data.roles,
        mobileNumber: data?.mobileNumber || "",
      };

      setAuthState({
        isAuthenticated: loginAs ? true : false,
        user: baseUser,
        privilegeList: data.roles,
        loginAs: loginAs ? true : false,
        privilege:  localStorage.getItem('privilege') || null,
      });
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem('loginAs');
      localStorage.removeItem('privilege');
      setAuthState({
        isAuthenticated: false,
        user: null,
        privilegeList: [],
        loginAs: false,
      });
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const loginAs = (role) => {
    localStorage.setItem('loginAs', true);
    localStorage.setItem('privilege', role);
    setAuthState((prev) => ({
      ...prev,
      privilege: role,
      isAuthenticated: true,
      loginAs: true,
    }));
    navigate("/dashboard");
  };

  const updatePrivileges = async () => {
    try {
      const user = await fetchUserProfile(authState.user?.userId);
      setAuthState((prev) => ({
        ...prev,
        user,
        privilegeList: user.privilegeList || [],
      }));
      console.log("Privileges updated.");
    } catch (error) {
      console.error("Privilege update failed:", error);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ authState, login, logout, updatePrivileges, loginAs }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
