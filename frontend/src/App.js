import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Import components
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Units from './pages/Units';
import Recommendations from './pages/Recommendations';
import FAQs from './pages/FAQs';
import TermsOfService from './pages/TermsOfService';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import MessagingDemo from './pages/MessagingDemo';

// Guest components
import GuestDashboard from './pages/guest/GuestDashboard';
import GuestUnits from './pages/guest/GuestUnits';
import UnitDetails from './pages/guest/UnitDetails';
import PropertyReviewsPage from './pages/guest/PropertyReviewsPage';
import BookingForm from './pages/guest/BookingForm';
import PaymentPage from './pages/guest/PaymentPage';
import HostProfile from './pages/guest/HostProfile';
import GuestRecommendations from './pages/guest/GuestRecommendations';
import PropertySearch from './pages/guest/PropertySearch';
import BookingHistory from './pages/guest/BookingHistory';
import BookingDetails from './pages/guest/BookingDetails';
import CheckoutPhotos from './pages/guest/CheckoutPhotos';
import GuestReview from './pages/guest/GuestReview';
import CheckoutAndReview from './pages/guest/CheckoutAndReview';
import GuestMessages from './pages/guest/GuestMessages';
import GuestProfile from './pages/guest/GuestProfile';
import GuestSettings from './pages/guest/GuestSettings';
import GuestFavorites from './pages/guest/GuestFavorites';
import GuestNotifications from './pages/guest/GuestNotifications';
import GuestWebSocketNotifications from './pages/guest/GuestWebSocketNotifications';

// Payment components
import PaymentTest from './pages/payment/PaymentTest';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';

// Host components  
import HostDashboard from './pages/host/HostDashboard';
import HostUnits from './pages/host/HostUnits';
import HostPropertyReviews from './pages/host/HostPropertyReviews';
import AddUnit from './pages/host/AddUnit';
import EditUnit from './pages/host/EditUnit';
import HostBookings from './pages/host/HostBookings';
import HostPayments from './pages/host/HostPayments';
import HostFinancial from './pages/host/HostFinancial';
import HostMessages from './pages/host/HostMessages';
import HostReports from './pages/host/HostReports';
import HostPromoCodes from './pages/host/HostPromoCodes';
import HostSettings from './pages/host/HostSettings';
import HostNotifications from './pages/host/HostNotifications';
import PropertyManagement from './pages/host/PropertyManagement';
import HostAnalytics from './pages/host/HostAnalytics';
import HostVerificationForm from './pages/host/HostVerificationForm';

// Admin components
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminReports from './pages/admin/AdminReports';
import AdminUnits from './pages/admin/AdminUnits';
import AdminReviews from './pages/admin/AdminReviews';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminMessages from './pages/admin/AdminMessages';
import Financial from './pages/admin/Financial';
import HostVerification from './pages/admin/HostVerification';
import ChatbotAnalytics from './pages/admin/ChatbotAnalytics';
import AdminProfile from './pages/admin/AdminProfile';
import AdminNotifications from './pages/admin/AdminNotifications';
import CommunicationAdminManagement from './pages/admin/CommunicationAdminManagement';

// Communication Admin components
import CommunicationAdminDashboard from './pages/admin/CommunicationAdminDashboard';
import CommunicationAdminMessages from './pages/admin/CommunicationAdminMessages';
import CommunicationAdminChatbotAnalytics from './pages/admin/CommunicationAdminChatbotAnalytics';
import CommunicationAdminLiveChat from './pages/admin/CommunicationAdminLiveChat';
import CommunicationAdminSettings from './pages/admin/CommunicationAdminSettings';
import CommunicationAdminProfile from './pages/admin/CommunicationAdminProfile';
import CommunicationAdminNotifications from './pages/admin/CommunicationAdminNotifications';
import { useAuth } from './contexts/AuthContext';

const getDashboardByRole = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'communication_admin') return '/comm-admin/dashboard';
  if (role === 'host') return '/host/dashboard';
  return '/guest/dashboard';
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (user?.role) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return <Home />;
};

const RequireAuth = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return <Outlet />;
};

const GuestOnlyAuthPages = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (user?.role) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/units" element={<Units />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/messaging-demo" element={<MessagingDemo />} />

              {/* Payment routes (public for redirects) */}
              <Route path="/payment/test" element={<PaymentTest />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />

              {/* Auth pages (redirect authenticated users) */}
              <Route element={<GuestOnlyAuthPages />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Email verification (public) */}
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Guest routes */}
              <Route element={<RequireAuth allowedRoles={['guest']} />}>
                <Route path="/guest/dashboard" element={<GuestDashboard />} />
                <Route path="/guest/units" element={<GuestUnits />} />
                <Route path="/guest/units/:id" element={<UnitDetails />} />
                <Route path="/guest/units/:id/reviews" element={<PropertyReviewsPage />} />
                <Route path="/guest/units/:id/book" element={<BookingForm />} />
                <Route path="/guest/units/:unitId/payment" element={<PaymentPage />} />
                <Route path="/guest/host/:hostId" element={<HostProfile />} />
                <Route path="/guest/recommendations" element={<GuestRecommendations />} />
                <Route path="/guest/property-search" element={<PropertySearch />} />
                <Route path="/guest/search" element={<PropertySearch />} />
                <Route path="/guest/bookings" element={<BookingHistory />} />
                <Route path="/guest/bookings/:bookingId" element={<BookingDetails />} />
                <Route path="/guest/bookings/:bookingId/checkout-photos" element={<CheckoutPhotos />} />
                <Route path="/guest/bookings/:bookingId/review" element={<GuestReview />} />
                <Route path="/guest/bookings/:bookingId/checkout-review" element={<CheckoutAndReview />} />
                <Route path="/guest/messages" element={<GuestMessages />} />
                <Route path="/guest/favorites" element={<GuestFavorites />} />
                <Route path="/guest/profile" element={<GuestProfile />} />
                <Route path="/guest/settings" element={<GuestSettings />} />
                <Route path="/guest/notifications" element={<GuestWebSocketNotifications />} />
                <Route path="/guest/notifications-old" element={<GuestNotifications />} />
              </Route>
              
              {/* Host routes */}
              <Route element={<RequireAuth allowedRoles={['host']} />}>
                <Route path="/host/verification" element={<HostVerificationForm />} />
                <Route path="/host/dashboard" element={<HostDashboard />} />
                <Route path="/host/units" element={<HostUnits />} />
                <Route path="/host/units/add" element={<AddUnit />} />
                <Route path="/host/units/edit/:id" element={<EditUnit />} />
                <Route path="/host/units/:id/reviews" element={<HostPropertyReviews />} />
                <Route path="/host/bookings" element={<HostBookings />} />
                <Route path="/host/payments" element={<HostPayments />} />
                <Route path="/host/financial" element={<HostFinancial />} />
                <Route path="/host/messages" element={<HostMessages />} />
                <Route path="/host/reports" element={<HostReports />} />
                <Route path="/host/promo-codes" element={<HostPromoCodes />} />
                <Route path="/host/settings" element={<HostSettings />} />
                <Route path="/host/notifications" element={<HostNotifications />} />
                <Route path="/host/properties" element={<PropertyManagement />} />
                <Route path="/host/analytics" element={<HostAnalytics />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<RequireAuth allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/units" element={<AdminUnits />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/activity-logs" element={<ActivityLogs />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/chatbot-analytics" element={<ChatbotAnalytics />} />
                <Route path="/admin/financial" element={<Financial />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/host-verification" element={<HostVerification />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/comm-admin-management" element={<CommunicationAdminManagement />} />
              </Route>
              
              {/* Communication Admin routes */}
              <Route element={<RequireAuth allowedRoles={['communication_admin']} />}>
                <Route path="/comm-admin/dashboard" element={<CommunicationAdminDashboard />} />
                <Route path="/comm-admin/messages" element={<CommunicationAdminMessages />} />
                <Route path="/comm-admin/chatbot-analytics" element={<CommunicationAdminChatbotAnalytics />} />
                <Route path="/comm-admin/live-chat" element={<CommunicationAdminLiveChat />} />
                <Route path="/comm-admin/settings" element={<CommunicationAdminSettings />} />
                <Route path="/comm-admin/profile" element={<CommunicationAdminProfile />} />
                <Route path="/comm-admin/notifications" element={<CommunicationAdminNotifications />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;