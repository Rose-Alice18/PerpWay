import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    email: 'support@perpway.com',
    phone: '',
    whatsapp: ''
  });

  // Fetch admin contact settings
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/settings`);
        if (response.data && response.data.general) {
          setContactInfo({
            email: 'support@perpway.com', // Always show this on frontend
            phone: response.data.general.supportPhone || '',
            whatsapp: response.data.general.supportPhone || '' // Use same number for WhatsApp
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <footer className="bg-[#1a1d29] text-white mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10">
        {/* Main footer content - clean single line on desktop */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">

          {/* Left: Logo & Tagline */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl md:text-2xl font-bold text-ghana-yellow">Perpway</span>
            </Link>
            <p className="text-gray-400 text-sm">Your community hub 🚀</p>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
            <Link to="/drivers" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <span>🚗</span> Drivers
            </Link>
            <Link to="/delivery" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <span>📦</span> Delivery
            </Link>
            <Link to="/services" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <span>🛍️</span> Services
            </Link>
            <Link to="/rides" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <span>🚙</span> Rides
            </Link>
            <Link to="/shopping" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <span>🛒</span> Shopping
            </Link>
            <Link to="/marketplace" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <span>🏪</span> Marketplace
            </Link>
          </nav>

          {/* Right: Contact */}
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              <span>📧</span> Contact
            </a>
            <div className="flex items-center gap-3">
              {contactInfo.whatsapp && (
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  className="text-gray-400 hover:text-ghana-yellow transition-colors text-xl"
                  title="WhatsApp"
                >
                  💬
                </a>
              )}
              {contactInfo.phone && (
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-gray-400 hover:text-ghana-red transition-colors text-xl"
                  title="Call us"
                >
                  📱
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Copyright & Admin Gateway */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs">
            © 2024 Perpway • Made with <span className="text-ghana-red">❤️</span> for the community
          </p>

          {/* Admin Gateway - Subtle but visible */}
          <Link
            to="/admin/dashboard"
            className="text-gray-700 hover:text-gray-500 transition-colors text-xs px-2 py-1 rounded hover:bg-gray-800/30"
            title="Admin"
          >
            ⚙️
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
