import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingDashboard from './components/FloatingDashboard';
import Home from './pages/Home';
import DriverFinder from './pages/DriverFinder';
import Delivery from './pages/Delivery';
import ServiceHub from './pages/ServiceHub';
import RidePairing from './pages/RidePairing';
import SignIn from './pages/SignIn';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import RiderUpdate from './pages/RiderUpdate';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Marketplace from './pages/Marketplace';
import ShoppingRequest from './pages/ShoppingRequest';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin/dashboard');
  const isUserDashboardRoute = location.pathname.startsWith('/dashboard');
  const isRiderUpdateRoute = location.pathname.startsWith('/rider-update');

  // Global 401/403 handler — redirect to sign in when session expires
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          const userRole = localStorage.getItem('userRole');
          // Don't redirect if already on a sign-in page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/signin') && !currentPath.includes('/admin') && !currentPath.includes('/reset-password')) {
            localStorage.removeItem('userAuthenticated');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('authTime');
            navigate(userRole === 'admin' ? '/admin' : '/signin');
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      {!isAdminRoute && !isUserDashboardRoute && !isRiderUpdateRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drivers" element={<DriverFinder />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/services" element={<ServiceHub />} />
          <Route path="/rides" element={<RidePairing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin" element={<SignIn />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/rider-update/:riderCode" element={<RiderUpdate />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/shopping-request" element={<ShoppingRequest />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>
      {!isAdminRoute && !isUserDashboardRoute && !isRiderUpdateRoute && <Footer />}

      {/* Floating Dashboard - appears on all pages except dashboards when user is signed in */}
      {!isAdminRoute && !isUserDashboardRoute && <FloatingDashboard />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
