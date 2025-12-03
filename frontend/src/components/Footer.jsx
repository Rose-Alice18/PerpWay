import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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
          <nav className="flex items-center gap-6 md:gap-8 text-sm">
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
          </nav>

          {/* Right: Contact */}
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="mailto:info@perpway.com"
              className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              <span>📧</span> Contact
            </a>
            <div className="flex items-center gap-3">
              <a href="https://wa.me/" className="text-gray-400 hover:text-ghana-yellow transition-colors text-xl" title="WhatsApp">
                💬
              </a>
              <a href="tel:" className="text-gray-400 hover:text-ghana-red transition-colors text-xl" title="Call us">
                📱
              </a>
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
