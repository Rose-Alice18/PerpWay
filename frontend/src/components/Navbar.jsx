import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import perpwayLogo from '../assets/perpway-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('perpway-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('perpway-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('perpway-theme', 'light');
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('userAuthenticated');
      const name = localStorage.getItem('userName');
      const role = localStorage.getItem('userRole');

      setIsAuthenticated(authenticated === 'true');
      // Show "Admin Roseline" for admin, otherwise show first name
      if (role === 'admin') {
        setUserName('Admin Roseline');
      } else {
        setUserName(name || 'User');
      }
      setUserRole(role || 'user');
    };

    checkAuth();
    // Check auth status on every route change
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authTime');
    setIsAuthenticated(false);
    setShowUserMenu(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', emoji: '🏠' },
    { name: 'Drivers', path: '/drivers', emoji: '🚗' },
    { name: 'Delivery', path: '/delivery', emoji: '📦' },
    { name: 'Services', path: '/services', emoji: '🛍️' },
    { name: 'Ride Pairing', path: '/rides', emoji: '🚙' },
  ];

  const moreLinks = [
    { name: 'Marketplace', path: '/marketplace', emoji: '🏪' },
    { name: 'About Us', path: '/about', emoji: 'ℹ️' },
    { name: 'Contact', path: '/contact', emoji: '📧' },
    { name: 'FAQ', path: '/faq', emoji: '❓' },
    { name: 'Terms & Privacy', path: '/terms', emoji: '📜' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-[#1e293b] shadow-lg sticky top-0 z-50 transition-colors duration-300 border-b border-transparent dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative -m-2"
            >
              <motion.img
                src={perpwayLogo}
                alt="Perpway Logo"
                className="h-20 w-auto"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))'
                }}
                animate={{
                  filter: [
                    "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
                    "drop-shadow(0 8px 16px rgba(206, 17, 38, 0.25))",
                    "drop-shadow(0 8px 16px rgba(252, 209, 22, 0.25))",
                    "drop-shadow(0 8px 16px rgba(0, 107, 63, 0.25))",
                    "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <div className="flex flex-col justify-center">
              <motion.span
                className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green bg-clip-text text-transparent leading-tight whitespace-nowrap"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% auto"
                }}
              >
                Perpway
              </motion.span>
              <motion.span
                className="text-[6px] md:text-[8px] font-bold bg-gradient-to-r from-ghana-red/80 via-ghana-yellow/80 to-ghana-green/80 bg-clip-text text-transparent -mt-0.5 tracking-wide uppercase whitespace-nowrap"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% auto",
                  maxWidth: "100%",
                  display: "inline-block"
                }}
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                Personal Easy Rides & Packages
              </motion.span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={link.path}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                      isActive(link.path)
                        ? 'bg-ashesi-primary text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {/* Animated background on hover for non-active links */}
                    {!isActive(link.path) && (
                      <motion.div
                        className="absolute inset-0 bg-ashesi-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Subtle glow effect on active link */}
                    {isActive(link.path) && (
                      <motion.div
                        className="absolute inset-0 bg-ashesi-primary rounded-xl blur-sm opacity-50"
                        animate={{
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-2">
                      <motion.span
                        animate={{
                          rotate: isActive(link.path) ? [0, 10, -10, 0] : 0,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {link.emoji}
                      </motion.span>
                      <span className="text-sm">{link.name}</span>
                    </span>
                  </motion.div>

                  {/* Bottom indicator line for active link */}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-ashesi-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden flex items-center gap-2 ${
                  showMoreMenu || moreLinks.some(link => isActive(link.path))
                    ? 'bg-ashesi-primary text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {/* Animated background on hover for non-active state */}
                {!showMoreMenu && !moreLinks.some(link => isActive(link.path)) && (
                  <motion.div
                    className="absolute inset-0 bg-ashesi-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}

                <span className="relative z-10 flex items-center gap-2 text-sm">
                  <span>More</span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: showMoreMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </span>
              </motion.button>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  onMouseLeave={() => setShowMoreMenu(false)}
                >
                  {moreLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setShowMoreMenu(false)}
                        className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 relative group ${
                          isActive(link.path)
                            ? 'bg-ashesi-primary/10 text-ashesi-primary dark:text-ashesi-primary'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive(link.path) && (
                          <motion.div
                            layoutId="moreActive"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-ashesi-primary"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        <motion.div
                          className="text-xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {link.emoji}
                        </motion.div>
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="ml-2 p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:shadow-lg transition-all text-xl relative overflow-hidden group"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-ghana-yellow/20 to-ghana-red/20 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% auto" }}
              />
              <span className="relative z-10">{isDarkMode ? '☀️' : '🌙'}</span>
            </motion.button>

            {/* User Menu or Sign In Button */}
            {isAuthenticated ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-gradient-to-r from-ashesi-primary to-ghana-red text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                    {userRole === 'admin' ? 'R' : userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{userName}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole} Account</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-ghana-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span>🚪</span>
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="ml-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-ashesi-primary to-ghana-red text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <span>🔐</span>
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:shadow-lg transition-all text-gray-700 dark:text-gray-200"
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </motion.svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden pb-4 space-y-2"
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                    isActive(link.path)
                      ? 'bg-ashesi-primary text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  {!isActive(link.path) && (
                    <div className="absolute inset-0 bg-ashesi-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-xl">{link.emoji}</span>
                    <span>{link.name}</span>
                  </span>
                </Link>
              </motion.div>
            ))}

            {/* Mobile More Links */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
              <div className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                More
              </div>
              {moreLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + index) * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group my-1 ${
                      isActive(link.path)
                        ? 'bg-ashesi-primary text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    {!isActive(link.path) && (
                      <div className="absolute inset-0 bg-ashesi-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-xl">{link.emoji}</span>
                      <span>{link.name}</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Theme Toggle */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
              <button
                onClick={toggleTheme}
                className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <span className="mr-2">{isDarkMode ? '☀️' : '🌙'}</span>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                  <div className="px-4 py-2 text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <span className="mr-2">{userRole === 'admin' ? '👨‍💼' : '👤'}</span>
                    {userName}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-medium text-ghana-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-all my-1"
                  >
                    <span className="mr-2">🚪</span>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/signin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-ashesi-primary to-ghana-red text-white hover:shadow-lg transition-all my-1 mt-2"
              >
                <span className="mr-2">🔐</span>
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
