import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import SellProperty from './pages/SellProperty'
import PropertyDetail from './pages/PropertyDetail'
import Admin from './pages/Admin'
import AdminBookings from './pages/AdminBookings'
import AdminProperties from './pages/AdminProperties'
import AdminUsers from './pages/AdminUsers'
import AdminDealerRequests from './pages/AdminDealerRequests'
import AdminDealerTree from './pages/AdminDealerTree'
import AdminNotifications from './pages/AdminNotifications'
import DealerSignup from './pages/DealerSignup'
import BecomeDealer from './pages/BecomeDealer'
import Profile from './pages/Profile'
import MyProperties from './pages/MyProperties'
import About from './pages/About'
import TestPage from './pages/TestPage'
import TestProfile from './pages/TestProfile'
import SimpleProfile from './pages/SimpleProfile'
import TestInput from './pages/TestInput'
import TestAuth from './pages/TestAuth'
import TestLogin from './pages/TestLogin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dealer-signup" element={<DealerSignup />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="my-properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
          <Route path="sell" element={<ProtectedRoute><SellProperty /></ProtectedRoute>} />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Admin /></ProtectedRoute>} />
          <Route path="admin/properties" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProperties /></ProtectedRoute>} />
          <Route path="admin/bookings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBookings /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
          <Route path="admin/dealer-requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDealerRequests /></ProtectedRoute>} />
          <Route path="admin/dealer-tree" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDealerTree /></ProtectedRoute>} />
          <Route path="admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} />
          <Route path="become-dealer" element={<ProtectedRoute><BecomeDealer /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="test-profile" element={<ProtectedRoute><TestProfile /></ProtectedRoute>} />
          <Route path="simple-profile" element={<ProtectedRoute><SimpleProfile /></ProtectedRoute>} />
          <Route path="about" element={<About />} />
          <Route path="test" element={<TestPage />} />
          <Route path="test-input" element={<TestInput />} />
          <Route path="test-auth" element={<TestAuth />} />
          <Route path="test-login" element={<TestLogin />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App 