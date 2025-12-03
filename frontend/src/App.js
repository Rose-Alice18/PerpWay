import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DriverFinder from './pages/DriverFinder';
import Delivery from './pages/Delivery';
import ServiceHub from './pages/ServiceHub';
import RidePairing from './pages/RidePairing';
import SignIn from './pages/SignIn';
import AdminDashboard from './pages/AdminDashboard';
import RiderUpdate from './pages/RiderUpdate';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Marketplace from './pages/Marketplace';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin/dashboard');
  const isRiderUpdateRoute = location.pathname.startsWith('/rider-update');

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      {!isAdminRoute && !isRiderUpdateRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drivers" element={<DriverFinder />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/services" element={<ServiceHub />} />
          <Route path="/rides" element={<RidePairing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin" element={<SignIn />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/rider-update/:riderCode" element={<RiderUpdate />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </main>
      {!isAdminRoute && !isRiderUpdateRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
