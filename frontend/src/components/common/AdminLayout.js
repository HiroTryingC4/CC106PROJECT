import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  StarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import PageTransition from './PageTransition';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const sidebarItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'Activity Logs', href: '/admin/activity-logs', icon: ClipboardDocumentListIcon },
    { name: 'Comm Admins', href: '/admin/comm-admin-management', icon: ChatBubbleLeftRightIcon },
    { name: 'Financial', href: '/admin/financial', icon: CurrencyDollarIcon },
  ];

  const bottomNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'Financial', href: '/admin/financial', icon: CurrencyDollarIcon },
    { name: 'More', href: null, icon: Bars3Icon },
  ];

  const isActive = (href) => location.pathname === href;
  const currentPage = sidebarItems.find(i => i.href === location.pathname)?.name || 'Admin Panel';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'A';

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsMobileMenuOpen(false);
    try { logout(); } finally { navigate('/login'); }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

      {/* ── Mobile Top Header ── */}
      <div className="lg:hidden sticky top-0 z-40 shadow-md" style={{backgroundColor: '#4E7B22'}}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{currentPage}</p>
              <p className="text-green-100 text-xs flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3" /> Administrator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <BellIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Slide-down Menu ── */}
      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
          <div className="lg:hidden fixed top-[57px] left-0 right-0 z-50 shadow-xl" style={{backgroundColor: '#4E7B22'}}>
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/20">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base">
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-green-100 text-xs">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-yellow-200 text-xs">
                  <ShieldCheckIcon className="w-3 h-3" /> Administrator
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3">
              {sidebarItems.map(({ name, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition ${
                    isActive(href) ? 'bg-white text-[#4E7B22]' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {name}
                </Link>
              ))}
            </div>

            <div className="flex border-t border-white/20">
              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/profile'); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-xs font-medium hover:bg-white/10 transition"
              >
                <Cog6ToothIcon className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-red-200 text-xs font-medium hover:bg-white/10 transition border-l border-white/20"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:w-64 text-white flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
        <div className="p-6">
          <h2 className="font-semibold mb-1 text-2xl">Smart Stay</h2>
          <p className="text-green-100 text-sm">Admin Panel</p>
        </div>

        <div className="flex items-center gap-3 px-6 pb-4 border-b border-white/20">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-yellow-200 text-xs flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" /> Administrator
            </p>
          </div>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          {sidebarItems.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              to={href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive(href) ? 'bg-white text-gray-900 border-r-4' : 'text-white hover:bg-black/20'
              }`}
              style={isActive(href) ? {borderRightColor: '#4E7B22'} : {}}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/15 px-6 py-5 space-y-2">
          <button
            onClick={() => navigate('/admin/profile')}
            className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
          >
            <Cog6ToothIcon className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </div>

        <footer className="text-white py-12" style={{backgroundColor: '#0C1805'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Smart Stay Admin</h3>
                <p className="text-gray-300 text-sm">Comprehensive platform management and analytics.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Management</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><Link to="/admin/users" className="hover:text-white">User Management</Link></li>
                  <li><Link to="/admin/reviews" className="hover:text-white">Reviews</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">System</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><Link to="/admin/activity-logs" className="hover:text-white">Activity Logs</Link></li>
                  <li><Link to="/admin/financial" className="hover:text-white">Financial</Link></li>
                  <li><Link to="/admin/reports" className="hover:text-white">Reports</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>Email: admin@smartstay.com</p>
                  <p>Emergency: +1 (234) 567-8911</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-400">© 2024 Smart Stay Admin Panel. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5">
          {bottomNavItems.map(({ name, href, icon: Icon }) => {
            const active = href ? isActive(href) : false;
            return (
              <button
                key={name}
                onClick={() => href ? navigate(href) : setIsMobileMenuOpen(o => !o)}
                className={`flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                  active ? 'text-[#4E7B22]' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#4E7B22]' : 'text-gray-400'}`} />
                <span>{name}</span>
                {active && <span className="w-1 h-1 rounded-full bg-[#4E7B22]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl ring-1 ring-black/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <ArrowRightOnRectangleIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Logout Confirmation</h3>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to logout from your admin account?</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleLogout} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-medium text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
