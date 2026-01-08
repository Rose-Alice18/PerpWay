import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [deliveries, setDeliveries] = useState([]);
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [shoppingRequests, setShoppingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userInfo, setUserInfo] = useState({});
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false
  });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userAuthenticated');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated || userRole === 'admin') {
      navigate('/signin');
      return;
    }

    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    setUserInfo({ name: userName, email: userEmail });
    fetchUserData(userEmail);
  }, [navigate]);

  const fetchUserData = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const deliveryResponse = await axios.get(`${API_URL}/api/delivery/user/${email}`);
      if (deliveryResponse.data.success) {
        setDeliveries(deliveryResponse.data.deliveries);
      }

      const ridesResponse = await axios.get(`${API_URL}/api/rides/user/${email}`);
      if (ridesResponse.data.success) {
        setCreatedRides(ridesResponse.data.createdRides);
        setJoinedRides(ridesResponse.data.joinedRides);
      }

      const shoppingResponse = await axios.get(`${API_URL}/api/shopping/user/${email}`);
      if (shoppingResponse.data.success) {
        setShoppingRequests(shoppingResponse.data.requests);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authTime');
    navigate('/');
  };

  const handleEditProfile = () => {
    setEditedInfo({
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone || '',
      address: userInfo.address || '',
    });
    setIsEditMode(true);
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedInfo({});
    setSuccessMessage('');
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      setSuccessMessage('');

      const response = await axios.put(`${API_URL}/api/auth/users/profile`, {
        email: userInfo.email,
        name: editedInfo.name,
        phone: editedInfo.phone,
        address: editedInfo.address,
      });

      if (response.data.success) {
        setUserInfo({
          ...userInfo,
          name: editedInfo.name,
          phone: editedInfo.phone,
          address: editedInfo.address,
        });
        localStorage.setItem('userName', editedInfo.name);
        setIsEditMode(false);
        setSuccessMessage('Profile updated successfully! 🎉');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSuccessMessage(error.response?.data?.message || 'Failed to update profile. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSavePassword = async () => {
    try {
      setPasswordLoading(true);
      setPasswordMessage('');

      // Validate password
      if (!editedInfo.newPassword) {
        setPasswordMessage('Please enter a new password.');
        setPasswordLoading(false);
        setTimeout(() => setPasswordMessage(''), 3000);
        return;
      }
      if (editedInfo.newPassword.length < 6) {
        setPasswordMessage('Password must be at least 6 characters long.');
        setPasswordLoading(false);
        setTimeout(() => setPasswordMessage(''), 3000);
        return;
      }
      if (editedInfo.newPassword !== editedInfo.confirmPassword) {
        setPasswordMessage('Passwords do not match. Please try again.');
        setPasswordLoading(false);
        setTimeout(() => setPasswordMessage(''), 3000);
        return;
      }

      const response = await axios.put(`${API_URL}/api/auth/users/profile`, {
        email: userInfo.email,
        newPassword: editedInfo.newPassword,
      });

      if (response.data.success) {
        setEditedInfo({ ...editedInfo, newPassword: '', confirmPassword: '' });
        setPasswordMessage('Password updated successfully! 🎉');
        setIsPasswordEditMode(false);
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage(error.response?.data?.message || 'Failed to update password. Please try again.');
      setTimeout(() => setPasswordMessage(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelPassword = () => {
    setEditedInfo({ ...editedInfo, newPassword: '', confirmPassword: '' });
    setPasswordMessage('');
    setIsPasswordEditMode(false);
  };

  const handleEditPassword = () => {
    setIsPasswordEditMode(true);
    setPasswordMessage('');
  };

  const handleInputChange = (field, value) => {
    setEditedInfo({ ...editedInfo, [field]: value });
  };

  const handleSettingToggle = async (settingName) => {
    try {
      const newSettings = {
        ...userSettings,
        [settingName]: !userSettings[settingName]
      };

      setUserSettings(newSettings);

      // Save to backend
      const response = await axios.put(`${API_URL}/api/auth/users/settings`, {
        email: userInfo.email,
        settings: newSettings
      });

      if (response.data.success) {
        setSuccessMessage('Settings updated successfully! 🎉');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on error
      setUserSettings({ ...userSettings });
      setSuccessMessage('Failed to update settings. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'in-progress':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'assigned':
        return 'bg-gradient-to-r from-purple-500 to-violet-500 text-white';
      case 'authorized':
        return 'bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900';
      case 'pending':
      case 'active':
        return 'bg-gradient-to-r from-orange-500 to-rose-500 text-white';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const stats = {
    deliveries: {
      total: Array.isArray(deliveries) ? deliveries.length : 0,
      pending: Array.isArray(deliveries) ? deliveries.filter(d => d.status === 'pending').length : 0,
      delivered: Array.isArray(deliveries) ? deliveries.filter(d => d.status === 'delivered').length : 0,
      totalSpent: Array.isArray(deliveries) ? deliveries.reduce((sum, d) => sum + (d.price || 0), 0) : 0,
    },
    rides: {
      created: Array.isArray(createdRides) ? createdRides.length : 0,
      joined: Array.isArray(joinedRides) ? joinedRides.length : 0,
      active: (Array.isArray(createdRides) && Array.isArray(joinedRides)) ? [...createdRides, ...joinedRides].filter(r => r.status === 'active').length : 0,
      completed: (Array.isArray(createdRides) && Array.isArray(joinedRides)) ? [...createdRides, ...joinedRides].filter(r => r.status === 'completed').length : 0,
    },
    shopping: {
      total: Array.isArray(shoppingRequests) ? shoppingRequests.length : 0,
      pending: Array.isArray(shoppingRequests) ? shoppingRequests.filter(s => s.status === 'pending').length : 0,
      authorized: Array.isArray(shoppingRequests) ? shoppingRequests.filter(s => s.status === 'authorized').length : 0,
      assigned: Array.isArray(shoppingRequests) ? shoppingRequests.filter(s => s.status === 'assigned').length : 0,
      delivered: Array.isArray(shoppingRequests) ? shoppingRequests.filter(s => s.status === 'delivered').length : 0,
    },
  };

  const filteredDeliveries = Array.isArray(deliveries) ? deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'authorized', 'assigned', 'in-progress'].includes(delivery.status);
    return delivery.status === filter;
  }) : [];

  // Separate active and history rides
  const activeCreatedRides = Array.isArray(createdRides) ? createdRides.filter(r => r.status === 'active' || r.status === 'pending') : [];
  const historyCreatedRides = Array.isArray(createdRides) ? createdRides.filter(r => r.status === 'completed' || r.status === 'cancelled') : [];
  const activeJoinedRides = Array.isArray(joinedRides) ? joinedRides.filter(r => r.status === 'active' || r.status === 'pending') : [];
  const historyJoinedRides = Array.isArray(joinedRides) ? joinedRides.filter(r => r.status === 'completed' || r.status === 'cancelled') : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent mb-4"
          />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">Loading your vibe...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-24" style={{ isolation: 'isolate' }}>
      {/* Floating User Profile Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl px-4 md:px-6 lg:px-8 py-6 shadow-lg sticky top-0 border-b border-purple-200 dark:border-gray-700"
        style={{ zIndex: 1000 }}
      >
        <div className="max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-xl"
            >
              {userInfo.name?.charAt(0).toUpperCase()}
            </motion.div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {userInfo.name ? `${userInfo.name}'s Dashboard` : "User's Dashboard"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-3">
            {/* Home/Landing Page Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
              title="Go to Home Page"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </motion.button>

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-indigo-700 dark:to-purple-800 hover:shadow-lg transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 scroll-smooth">
        <AnimatePresence mode="wait">
          {/* Explore Tab - Navigate to Index */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Hero Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl text-white relative overflow-hidden"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0],
                  }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"
                />
                <div className="relative">
                  <h2 className="text-3xl font-black mb-2">Welcome Back!</h2>
                  <p className="text-purple-100 mb-6">Ready to explore Perpway? Let's get moving!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all"
                  >
                    🏠 Go to Home Page
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">⚡</span> Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/delivery')}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-400"
                  >
                    <div className="text-5xl mb-3">📦</div>
                    <p className="font-bold text-gray-900 dark:text-white">Request Delivery</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/rides')}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-400"
                  >
                    <div className="text-5xl mb-3">🚗</div>
                    <p className="font-bold text-gray-900 dark:text-white">Find Ride</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/drivers')}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-400"
                  >
                    <div className="text-5xl mb-3">🚙</div>
                    <p className="font-bold text-gray-900 dark:text-white">Find Driver</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/services')}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-400"
                  >
                    <div className="text-5xl mb-3">🛍️</div>
                    <p className="font-bold text-gray-900 dark:text-white">Services</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/marketplace')}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-pink-400"
                  >
                    <div className="text-5xl mb-3">🏪</div>
                    <p className="font-bold text-gray-900 dark:text-white">Marketplace</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/shopping-request')}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-yellow-400"
                  >
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="font-bold text-gray-900 dark:text-white">Shopping Service</p>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Recent Activity */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">🔥</span> Recent Activity
                </h2>
                <div className="space-y-3">
                  {[...deliveries.slice(0, 3), ...createdRides.slice(0, 2)]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex items-center gap-4"
                      >
                        <div className="text-4xl">{item.pickupPoint ? '📦' : '🚗'}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {item.itemDescription || `${item.pickupLocation} → ${item.destination}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </motion.div>
                    ))}
                  {deliveries.length === 0 && createdRides.length === 0 && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-xl"
                    >
                      <motion.p
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4"
                      >
                        🎯
                      </motion.p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">No activity yet!</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Start your Perpway journey now!</p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Account Stats */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">📊</span> Account Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 md:p-8 shadow-xl text-white"
                  >
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-3xl font-black">{stats.deliveries.total}</p>
                    <p className="text-sm text-blue-100">Total Deliveries</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 md:p-8 shadow-xl text-white"
                  >
                    <div className="text-4xl mb-2">🚗</div>
                    <p className="text-3xl font-black">{stats.rides.created + stats.rides.joined}</p>
                    <p className="text-sm text-green-100">Total Rides</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 md:p-8 shadow-xl text-white"
                  >
                    <div className="text-4xl mb-2">💰</div>
                    <p className="text-3xl font-black">GH₵{stats.deliveries.totalSpent.toFixed(0)}</p>
                    <p className="text-sm text-orange-100">Total Spent</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 md:p-8 shadow-xl text-white"
                  >
                    <div className="text-4xl mb-2">⚡</div>
                    <p className="text-3xl font-black">{stats.rides.active}</p>
                    <p className="text-sm text-purple-100">Active Rides</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* My Deliveries Tab */}
          {activeTab === 'deliveries' && (
            <motion.div
              key="deliveries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'all', label: 'All', emoji: '📋', count: deliveries.length },
                  { id: 'active', label: 'Active', emoji: '⚡', count: deliveries.filter(d => ['pending', 'authorized', 'assigned', 'in-progress'].includes(d.status)).length },
                  { id: 'delivered', label: 'Done', emoji: '✅', count: stats.deliveries.delivered },
                  { id: 'pending', label: 'Pending', emoji: '⏳', count: stats.deliveries.pending },
                ].map(({ id, label, emoji, count }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(id)}
                    className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shadow-lg ${
                      filter === id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {emoji} {label} ({count})
                  </motion.button>
                ))}
              </div>

              {/* Deliveries List */}
              <div className="space-y-4">
                {filteredDeliveries.length === 0 ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl text-center"
                  >
                    <div className="text-7xl mb-4">📦</div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No deliveries here!</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Let's get your first package moving!</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/delivery')}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all"
                    >
                      📦 Request Delivery
                    </motion.button>
                  </motion.div>
                ) : (
                  filteredDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">📦</div>
                          <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{delivery.itemDescription}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <motion.span
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg ${getStatusColor(delivery.status)}`}
                        >
                          {delivery.status}
                        </motion.span>
                      </div>
                      <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-bold">📍 Pickup:</span> {delivery.pickupPoint}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-bold">📍 Dropoff:</span> {delivery.dropoffPoint}
                        </p>
                        {delivery.price && (
                          <p className="text-gray-900 dark:text-white font-black text-lg mt-2">
                            💰 GH₵ {delivery.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* My Rides Tab */}
          {activeTab === 'rides' && (
            <motion.div
              key="rides"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Create New Ride CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/rides')}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                    ➕
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black">Create New Ride</p>
                    <p className="text-sm text-green-100">Share your journey with others!</p>
                  </div>
                </div>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Rides You Created */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">🚗</span> Rides You Created
                </h2>

                {/* Active Created Rides */}
                {activeCreatedRides.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Active</p>
                    {activeCreatedRides.map((ride, index) => (
                      <motion.div
                        key={ride._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            <div className="text-4xl">🚗</div>
                            <div>
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                {ride.pickupLocation} → {ride.destination}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                📅 {new Date(ride.departureDate).toLocaleDateString()} at {ride.departureTime}
                              </p>
                            </div>
                          </div>
                          <motion.span
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg ${getStatusColor(ride.status)}`}
                          >
                            {ride.status}
                          </motion.span>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            👥 <span className="font-bold text-purple-600 dark:text-purple-400">{ride.passengersJoined || 0}</span> joined
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            💺 <span className="font-bold text-blue-600 dark:text-blue-400">{ride.availableSeats}</span> seats available
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* History Created Rides */}
                {historyCreatedRides.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">History</p>
                    {historyCreatedRides.map((ride, index) => (
                      <motion.div
                        key={ride._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 opacity-75"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <div className="text-2xl opacity-50">🚗</div>
                            <div>
                              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                {ride.pickupLocation} → {ride.destination}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(ride.departureDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(ride.status)}`}>
                            {ride.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {createdRides.length === 0 && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center"
                  >
                    <p className="text-5xl mb-3">🚗</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No rides created yet</p>
                  </motion.div>
                )}
              </div>

              {/* Rides You Joined */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">🎫</span> Rides You Joined
                </h2>

                {/* Active Joined Rides */}
                {activeJoinedRides.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Active</p>
                    {activeJoinedRides.map((ride, index) => (
                      <motion.div
                        key={ride._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-3">
                            <div className="text-4xl">🎫</div>
                            <div>
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                {ride.pickupLocation} → {ride.destination}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                📅 {new Date(ride.departureDate).toLocaleDateString()} at {ride.departureTime}
                              </p>
                            </div>
                          </div>
                          <motion.span
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg ${getStatusColor(ride.status)}`}
                          >
                            {ride.status}
                          </motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* History Joined Rides */}
                {historyJoinedRides.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">History</p>
                    {historyJoinedRides.map((ride, index) => (
                      <motion.div
                        key={ride._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 opacity-75"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <div className="text-2xl opacity-50">🎫</div>
                            <div>
                              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                {ride.pickupLocation} → {ride.destination}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(ride.departureDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(ride.status)}`}>
                            {ride.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {joinedRides.length === 0 && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center"
                  >
                    <p className="text-5xl mb-3">🎫</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No rides joined yet</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Shopping Requests Tab */}
          {activeTab === 'shopping' && (
            <motion.div
              key="shopping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Request Shopping Service CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/shopping-request')}
                className="w-full bg-gradient-to-r from-ashesi-primary via-ghana-red to-ghana-yellow text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                    🛒
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black">Request Shopping Service</p>
                    <p className="text-sm text-white/90">Get items from town delivered to you!</p>
                  </div>
                </div>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Shopping Requests */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">🛒</span> Your Shopping Requests
                </h2>

                <div className="space-y-4">
                  {!Array.isArray(shoppingRequests) || shoppingRequests.length === 0 ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl text-center"
                    >
                      <div className="text-7xl mb-4">🛒</div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No shopping requests yet!</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Need something from town? Let us get it for you!</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/shopping-request')}
                        className="px-8 py-4 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all"
                      >
                        🛒 Request Shopping Service
                      </motion.button>
                    </motion.div>
                  ) : (
                    Array.isArray(shoppingRequests) && shoppingRequests.map((request, index) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all"
                      >
                        <div className="flex gap-4 mb-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            {request.productImage ? (
                              <img
                                src={request.productImage.startsWith('http') ? request.productImage : `${API_URL}${request.productImage}`}
                                alt={request.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="text-4xl">📦</div>';
                                }}
                              />
                            ) : (
                              <div className="text-4xl">📦</div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{request.productName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{request.productDescription}</p>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg ${getStatusColor(request.status)}`}
                              >
                                {request.status}
                              </motion.span>
                            </div>

                            <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 mb-3">
                              <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-bold">🏪 Shop Location:</span> {request.shopLocations}
                              </p>
                              {request.estimatedPrice && (
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="font-bold">💵 Estimated Price:</span> GH₵ {request.estimatedPrice.toFixed(2)}
                                </p>
                              )}
                              {request.actualPrice && (
                                <p className="text-gray-900 dark:text-white font-black text-base">
                                  💰 Actual Price: GH₵ {request.actualPrice.toFixed(2)}
                                </p>
                              )}
                              {request.assignedTo && (
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="font-bold">👤 Assigned To:</span> {request.assignedTo.name}
                                </p>
                              )}
                            </div>

                            {request.adminNotes && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
                                <p className="text-sm text-blue-900 dark:text-blue-300">
                                  <span className="font-bold">📝 Admin Notes:</span> {request.adminNotes}
                                </p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Requested on {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Profile Header */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 shadow-2xl text-white text-center relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-5xl font-black shadow-2xl relative z-10"
                >
                  {userInfo.name?.charAt(0).toUpperCase()}
                </motion.div>
                <h2 className="text-3xl font-black mb-2 relative z-10">{userInfo.name || 'User'}</h2>
                <p className="text-purple-100 relative z-10">{userInfo.email}</p>
              </motion.div>

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className={`rounded-2xl p-4 shadow-lg ${
                      successMessage.includes('success')
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    } text-white font-bold text-center`}
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Details */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">👤</span> Personal Info
                  </h3>
                  {!isEditMode && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <span>✏️</span> Edit
                    </motion.button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full text-lg font-bold text-gray-900 dark:text-white mt-1 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{userInfo.name}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{userInfo.email}</p>
                    {isEditMode && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={editedInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full text-lg font-bold text-gray-900 dark:text-white mt-1 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{userInfo.phone || 'Not set'}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Address</label>
                    {isEditMode ? (
                      <textarea
                        value={editedInfo.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your address"
                        rows="2"
                        className="w-full text-lg font-bold text-gray-900 dark:text-white mt-1 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{userInfo.address || 'Not set'}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Account Type</label>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">Customer</p>
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saveLoading ? '💾 Saving...' : '✅ Save Changes'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelEdit}
                      disabled={saveLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ❌ Cancel
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Password Update Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🔒</span> Change Password
                  </h3>
                  {!isPasswordEditMode && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditPassword}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <span>✏️</span> Edit
                    </motion.button>
                  )}
                </div>

                {/* Password Success Message */}
                <AnimatePresence>
                  {passwordMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      className={`rounded-2xl p-4 shadow-lg mb-4 ${
                        passwordMessage.includes('success')
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-pink-500'
                      } text-white font-bold text-center`}
                    >
                      {passwordMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isPasswordEditMode ? (
                  <>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-700">
                        <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          value={editedInfo.newPassword || ''}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Enter new password"
                          className="w-full text-lg font-bold text-gray-900 dark:text-white mt-1 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 6 characters</p>
                      </div>
                      {editedInfo.newPassword && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-700">
                          <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Confirm New Password</label>
                          <input
                            type="password"
                            value={editedInfo.confirmPassword || ''}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Re-enter your new password"
                            className="w-full text-lg font-bold text-gray-900 dark:text-white mt-1 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Password Save/Cancel Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 mt-6"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSavePassword}
                        disabled={passwordLoading || !editedInfo.newPassword}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {passwordLoading ? '💾 Saving...' : '✅ Save Password'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelPassword}
                        disabled={passwordLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ❌ Cancel
                      </motion.button>
                    </motion.div>
                  </>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Click <span className="font-bold text-purple-600 dark:text-purple-400">Edit</span> to change your password
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quick Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl" data-section="quick-settings">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚙️</span> Quick Settings
                </h3>
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Email Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get updates via email</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSettingToggle('emailNotifications')}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        userSettings.emailNotifications ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: userSettings.emailNotifications ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                      />
                    </motion.button>
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">SMS Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive text messages</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSettingToggle('smsNotifications')}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        userSettings.smsNotifications ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: userSettings.smsNotifications ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                      />
                    </motion.button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔔</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Push Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">App notifications</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSettingToggle('pushNotifications')}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        userSettings.pushNotifications ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: userSettings.pushNotifications ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                      />
                    </motion.button>
                  </div>

                  {/* Marketing Emails */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📢</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Marketing Emails</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Promotions and offers</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSettingToggle('marketingEmails')}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        userSettings.marketingEmails ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: userSettings.marketingEmails ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* More Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl"
              >
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> More Options
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* About */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/about')}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all text-center"
                  >
                    <div className="text-5xl mb-3">ℹ️</div>
                    <p className="font-bold text-gray-900 dark:text-white">About</p>
                  </motion.div>

                  {/* Contact */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contact')}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all text-center"
                  >
                    <div className="text-5xl mb-3">📧</div>
                    <p className="font-bold text-gray-900 dark:text-white">Contact</p>
                  </motion.div>

                  {/* Help/FAQ */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/faq')}
                    className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all text-center"
                  >
                    <div className="text-5xl mb-3">❓</div>
                    <p className="font-bold text-gray-900 dark:text-white">Help</p>
                  </motion.div>

                  {/* Settings */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Scroll to Quick Settings section
                      document.querySelector('[data-section="quick-settings"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/30 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all text-center"
                  >
                    <div className="text-5xl mb-3">⚙️</div>
                    <p className="font-bold text-gray-900 dark:text-white">Settings</p>
                  </motion.div>
                </div>

                {/* App Version */}
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-semibold">Perpway v1.0.0</p>
                  <p className="text-xs">Personal Easy Rides & Packages</p>
                </div>
              </motion.div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🚪</span>
                Logout
              </motion.button>
            </motion.div>
          )}

          {/* More Tab */}
          {activeTab === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-3xl">⚡</span> More Options
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/about')}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="text-5xl mb-3">ℹ️</div>
                  <p className="font-bold text-gray-900 dark:text-white">About</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="text-5xl mb-3">📧</div>
                  <p className="font-bold text-gray-900 dark:text-white">Contact</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="text-5xl mb-3">❓</div>
                  <p className="font-bold text-gray-900 dark:text-white">Help</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="text-5xl mb-3">⚙️</div>
                  <p className="font-bold text-gray-900 dark:text-white">Settings</p>
                </motion.button>
              </div>

              {/* App Info */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl text-center mt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Perpway v1.0.0</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Personal Easy Rides & Packages</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - 6 Tabs */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t-2 border-purple-200 dark:border-gray-700 shadow-2xl"
        style={{ zIndex: 999 }}
      >
        <div className="max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <div className="flex justify-around items-center">
            {[
              { id: 'home', icon: '🧭', label: 'Explore' },
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'deliveries', icon: '📦', label: 'Deliveries' },
              { id: 'rides', icon: '🚗', label: 'Rides' },
              { id: 'shopping', icon: '🛒', label: 'Shopping' },
              { id: 'profile', icon: '👤', label: 'Profile' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <motion.span
                  animate={activeTab === tab.id ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-2xl"
                >
                  {tab.icon}
                </motion.span>
                <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-white' : ''}`}>
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
