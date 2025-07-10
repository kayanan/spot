import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound"; // Make sure NotFound is imported
// profile import start
import Profile from "./pages/Profile/Profile";
// profile import end
// admin dashboard import start
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard";
import ManagerDashboard from "./pages/Dashboard/ManagerDashboard";
// admin dashboard import end
import ProvinceList from "./pages/Location/Province/ProvinceList";
import AddProvince from "./pages/Location/Province/AddProvince";
import UpdateProvince from "./pages/Location/Province/UpdateProvince";
import ViewProvince from "./pages/Location/Province/ViewProvince";
import AddDistrict from "./pages/Location/District/AddDistrict";
import UpdateDistrict from "./pages/Location/District/UpdateDistrict";
import ViewDistrict from "./pages/Location/District/ViewDistrict";
import AddCity from "./pages/Location/City/AddCity";
import UpdateCity from "./pages/Location/City/UpdateCity";
import ViewCity from "./pages/Location/City/ViewCity";
import Register from "./pages/auth/RegisterCustomer";
// parking subscription fee import start
import ListSubscriptionFees from "./pages/ParkingSubscriptionFee/ListSubscriptionFees";
import AddSubscriptionFee from "./pages/ParkingSubscriptionFee/AddSubscriptionFee"; 
import UpdateSubscriptionFee from "./pages/ParkingSubscriptionFee/UpdateSubscriptionFee";
// parking subscription fee import end
// //  customer import start
import CustomerList from "./pages/User/Customer/CustomerList";
//import AddCustomer from "./pages/User/Customer/AddCustomer";
import UpdateCustomer from "./pages/User/Customer/UpdateCustomer";
import ViewCustomer from "./pages/User/Customer/ViewCustomer";
// // user import end

// role import start
import RoleList from "./pages/User/Role/RoleList";
import AddRole from "./pages/User/Role/AddRole";
import UpdateRole from "./pages/User/Role/UpdateRole";
import ViewRole from "./pages/User/Role/ViewRole";

// role import end

// parking owner import start
import ParkingOwnerList from "./pages/User/ParkingOwner/ParkingOwnerList";
import UpdateParkingOwner from "./pages/User/ParkingOwner/UpdateParkingOwner";
import ViewParkingOwner from "./pages/User/ParkingOwner/ViewParkingOwner";
import ParkingSpotDetails from "./pages/auth/ParkingSpotDetails";
import PendingRequest from "./pages/User/ParkingOwner/PendingRequest";
// parking owner import end

// parking area import start
import ParkingAreaList from "./pages/User/ParkingOwner/ParkingArea/ParkingAreaList";
import ViewParkingArea from "./pages/User/ParkingOwner/ParkingArea/ViewParkingArea";
import SubscriptionDetails from "./pages/User/ParkingOwner/ParkingArea/SubscriptionDetails";
// parking area import end
// parking area home page import start
import ParkingAreaHomePage from "./pages/ParkingArea/ParkingAreaHomePage";
// parking area home page import end

// reports import start
import ListParkingPayments from "./pages/Report/ParkingPayment/ListParkingPayments";
import AdminReport from "./pages/Report/AdminReport/AdminReport";
import ParkingOwnerReport from "./pages/Report/ParkingOwnerReport/ParkingOwnerReport";
// reports import end

// customer import start
import CustomerLandingPage from "./pages/CustomerUi/CustomerLandingPage";
import FindParkingSpot from "./pages/CustomerUi/FindParkingSpot";
import ReservationHistory from "./pages/CustomerUi/ReservationHistory";
import ActiveReservation from "./pages/CustomerUi/ActiveReservation";
import UpcommingReservation from "./pages/CustomerUi/UpcommingReservation";
// customer import end

const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { authState } = useAuth();


  


  const isLoginPage = window.location.pathname === "/login" || window.location.pathname === "/parking-owner/spot-details" || window.location.pathname === "/customer/register";
  //for testing purpose
  // const isLoginPage = false;
  // authState.isAuthenticated = true;
//--------------------------------
  return (
    <div className="flex">
      {!isLoginPage && authState.isAuthenticated && (
        <Sidebar isOpen={isSidebarOpen} />
      )}
      <div
        className={`flex-1 transition-all duration-300 ${
          !isLoginPage ? (isSidebarOpen ? "ml-0 xl:ml-64" : "ml-20") : ""
        }`}
      >
      {/* <divclassName={`flex-1 transition-all duration-300 ${!isLoginPage ? (isSidebarOpen ? "ml-0 xl:ml-64" : "ml-20") : "" }`}> */}
        {!isLoginPage && authState.isAuthenticated && (
          <Navbar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}
 <div className={`${isLoginPage ? "pt-0" : "pt-20"}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/customer/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            {/* ------------Location Route Start-------- */}
            {/* admin dashboard route start */}
           {authState.user?.roles?.includes("ADMIN") && ( <Route path="/dashboard" element={<AdminDashboard />} />)}
           {authState.user?.roles?.includes("CUSTOMER") && ( <Route path="/dashboard" element={<CustomerDashboard />} />)}
           {authState.user?.roles?.includes("PARKING_OWNER") && ( <Route path="/dashboard" element={<ManagerDashboard />} />)}
            {/* admin dashboard route end */}
            {/* province route start */}
            <Route path="/province" element={<ProvinceList />} />
            <Route path="/province/add" element={<AddProvince />} />
            <Route path="/province/update/:id" element={<UpdateProvince />} />
            <Route path="/province/view/:id" element={<ViewProvince />} />
            {/* province route end */}
            {/* District route start */}
            <Route path="/district/add" element={<AddDistrict />} />
            <Route path="/district/update/:id" element={<UpdateDistrict />} />
            <Route path="/district/view/:id" element={<ViewDistrict />} />
            {/* District route end */}
            {/* City route start */}
            <Route path="/city/add" element={<AddCity />} />
            <Route path="/city/update/:id" element={<UpdateCity />} />
            <Route path="/city/view/:id" element={<ViewCity />} />
            {/* City route end */}
            {/* ------------Location Route End-------- */}


            {/* user route start */}
            {/* <Route path="/user" element={<UserList />} /> */}
            {/* <Route path="/user/add" element={<AddUser />} /> */}
            {/* <Route path="/user/update/:id" element={<UpdateUser />} /> */}
            {/* <Route path="/user/view/:id" element={<ViewUser />} /> */}
            {/* user route end */}

            {/* role route start */}
            <Route path="/role" element={<RoleList />} />
            <Route path="/role/add" element={<AddRole />} />
            <Route path="/role/update/:id" element={<UpdateRole />} />
            <Route path="/role/view/:id" element={<ViewRole />} />
            {/* role route end */}

            {/* customer route start */}
            {/* <Route path="/user" element={<Navigate to="/user" replace />} /> */}
            <Route path="/customer" element={<CustomerList />} />
            <Route path="/customer/view/:id" element={<ViewCustomer />} />
            <Route path="/customer/update/:id" element={<UpdateCustomer />} />
            {/* customer route end */}

            {/* parking owner route start */}
            <Route path="/owner" element={<ParkingOwnerList />} />
            <Route path="/owner/view/:id" element={<ViewParkingOwner />} />
            <Route path="/owner/update/:id" element={<UpdateParkingOwner />} />
            <Route path="/parking-owner/spot-details" element={<ParkingSpotDetails />} />
            <Route path="/owner/pending-request" element={<PendingRequest />} />
            {/* parking owner route end */}

            {/* parking area route start */}
            <Route path="/parking-area" element={<ParkingAreaList />} />
            <Route path="/parking-area/view/:id" element={<ViewParkingArea />} />
            <Route path="/parking-area/subscription-details/:id" element={<SubscriptionDetails />} />
            {/* parking area route end */}

            {/* parking subscription fee route start */}
            <Route path="/parking-subscription-fee" element={<ListSubscriptionFees key={location.state?.key}/>} />
            <Route path="/parking-subscription-fee/add" element={<AddSubscriptionFee />} />
            <Route path="/parking-subscription-fee/update/:id" element={<UpdateSubscriptionFee />} />
            {/* parking subscription fee route end */}
            {/* reports route start */}
            <Route path="/reports/parking-payments" element={<ListParkingPayments />} />
            <Route path="/reports/admin" element={<AdminReport />} />
            <Route path="/reports/parking-owner" element={<ParkingOwnerReport />} />
            {/* <Route path="/reports/parking-reservations" element={<ListParkingReservations />} />
            <Route path="/reports/parking-slots" element={<ListParkingSlots />} /> */}
            {/* reports route end */}
            {/* parking area home page route start */}
            <Route path="/parking-area-home" element={<ParkingAreaHomePage />} />
            {/* parking area home page route end */}


            {/* customer route start */}
            <Route path="/customer-landing-page" element={<CustomerLandingPage />} />
            <Route path="/reservation/find-parking-spot" element={<FindParkingSpot />} />
            <Route path="/reservation/history" element={<ReservationHistory />} />
            <Route path="/reservation/active" element={<ActiveReservation />} />
            <Route path="/reservation/upcoming" element={<UpcommingReservation />} />
            {/* customer route end */}

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
