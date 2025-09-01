import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import FloatingQueryIcon from "./components/FloatingQueryIcon";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SellProperty from "./pages/SellProperty";
import PropertyDetail from "./pages/PropertyDetail";
import Admin from "./pages/Admin";
import AdminBookings from "./pages/AdminBookings";
import AdminProperties from "./pages/AdminProperties";
import AdminUsers from "./pages/AdminUsers";
import AdminDealerRequests from "./pages/AdminDealerRequests";
import AdminDealerTree from "./pages/AdminDealerTree";
import AdminNotifications from "./pages/AdminNotifications";
import AdminInquiries from "./pages/AdminInquiries";
import DealerSignup from "./pages/DealerSignup";
import BecomeDealer from "./pages/BecomeDealer";
import Profile from "./pages/Profile";
import MyProperties from "./pages/MyProperties";
import Properties from "./pages/Properties";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiesPolicy from "./pages/CookiesPolicy";
import TestPage from "./pages/TestPage";
import TestProfile from "./pages/TestProfile";
import SimpleProfile from "./pages/SimpleProfile";
import TestInput from "./pages/TestInput";
import TestAuth from "./pages/TestAuth";
import TestLogin from "./pages/TestLogin";
import TestWhatsApp from "./pages/TestWhatsApp";
import TestTelegram from "./pages/TestTelegram";
import ListProperty from "./pages/ListProperty";
import TestSimple from "./pages/TestSimple";
import TestAddressForm from "./pages/TestAddressForm";
import TestFloatingIcon from "./pages/TestFloatingIcon";
import ErrorNotificationDemo from "./components/ErrorNotificationDemo";
import TestErrorNotifications from "./pages/TestErrorNotifications";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <FloatingQueryIcon />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dealer-signup" element={<DealerSignup />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-properties"
            element={
              <ProtectedRoute>
                <MyProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="sell"
            element={
              <ProtectedRoute>
                <SellProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="list-property"
            element={
              <ProtectedRoute>
                <ListProperty />
              </ProtectedRoute>
            }
          />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="properties" element={<Properties />} />
          <Route path="test-simple" element={<TestSimple />} />
          <Route path="test-address-form" element={<TestAddressForm />} />
          <Route path="test-floating-icon" element={<TestFloatingIcon />} />
          <Route path="error-demo" element={<ErrorNotificationDemo />} />
          <Route
            path="test-error-notifications"
            element={<TestErrorNotifications />}
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/properties"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/dealer-requests"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDealerRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/dealer-tree"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDealerTree />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/notifications"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/inquiries"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="become-dealer"
            element={
              <ProtectedRoute>
                <BecomeDealer />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="test-profile"
            element={
              <ProtectedRoute>
                <TestProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="simple-profile"
            element={
              <ProtectedRoute>
                <SimpleProfile />
              </ProtectedRoute>
            }
          />
          <Route path="about" element={<About />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="cookies-policy" element={<CookiesPolicy />} />
          <Route path="test" element={<TestPage />} />
          <Route path="test-input" element={<TestInput />} />
          <Route path="test-auth" element={<TestAuth />} />
          <Route path="test-login" element={<TestLogin />} />
          <Route path="test-whatsapp" element={<TestWhatsApp />} />
          <Route path="test-telegram" element={<TestTelegram />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
