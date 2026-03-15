import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';

// Import components
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Units from './pages/Units';
import Recommendations from './pages/Recommendations';
import FAQs from './pages/FAQs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Guest components
import GuestDashboard from './pages/guest/GuestDashboard';
import GuestUnits from './pages/guest/GuestUnits';
import UnitDetails from './pages/guest/UnitDetails';
import BookingForm from './pages/guest/BookingForm';
import PaymentPage from './pages/guest/PaymentPage';
import HostProfile from './pages/guest/HostProfile';
import GuestRecommendations from './pages/guest/GuestRecommendations';
import PropertySearch from './pages/guest/PropertySearch';
import BookingHistory from './pages/guest/BookingHistory';
import BookingDetails from './pages/guest/BookingDetails';
import CheckoutPhotos from './pages/guest/CheckoutPhotos';
import GuestMessages from './pages/guest/GuestMessages';
import GuestProfile from './pages/guest/GuestProfile';
import GuestSettings from './pages/guest/GuestSettings';
import GuestNotifications from './pages/guest/GuestNotifications';

// Host components  
import HostDashboard from './pages/host/HostDashboard';
import PropertyManagement from './pages/host/PropertyManagement';
import HostAnalytics from './pages/host/HostAnalytics';

// Admin components
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/units" element={<Units />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Guest routes */}
              <Route path="/guest/dashboard" element={<GuestDashboard />} />
              <Route path="/guest/units" element={<GuestUnits />} />
              <Route path="/guest/units/:id" element={<UnitDetails />} />
              <Route path="/guest/units/:id/book" element={<BookingForm />} />
              <Route path="/guest/units/:unitId/payment" element={<PaymentPage />} />
              <Route path="/guest/host/:hostId" element={<HostProfile />} />
              <Route path="/guest/recommendations" element={<GuestRecommendations />} />
              <Route path="/guest/search" element={<PropertySearch />} />
              <Route path="/guest/bookings" element={<BookingHistory />} />
              <Route path="/guest/bookings/:bookingId" element={<BookingDetails />} />
              <Route path="/guest/bookings/:bookingId/checkout-photos" element={<CheckoutPhotos />} />
              <Route path="/guest/messages" element={<GuestMessages />} />
              <Route path="/guest/profile" element={<GuestProfile />} />
              <Route path="/guest/settings" element={<GuestSettings />} />
              <Route path="/guest/notifications" element={<GuestNotifications />} />
              
              {/* Host routes */}
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/properties" element={<PropertyManagement />} />
              <Route path="/host/analytics" element={<HostAnalytics />} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;