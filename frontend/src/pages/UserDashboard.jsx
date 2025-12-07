import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [deliveries, setDeliveries] = useState([]);
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('userAuthenticated');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated || userRole === 'admin') {
      navigate('/signin');
      return;
    }

    // Get user info
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    setUserInfo({ name: userName, email: userEmail });

    // Fetch user's data
    fetchUserData(userEmail);
  }, [navigate]);

  const fetchUserData = async (email) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch deliveries
      const deliveryResponse = await axios.get(`${API_URL}/api/delivery/user/${email}`);
      if (deliveryResponse.data.success) {
        setDeliveries(deliveryResponse.data.deliveries);
      }

      // Fetch rides
      const ridesResponse = await axios.get(`${API_URL}/api/rides/user/${email}`);
      if (ridesResponse.data.success) {
        setCreatedRides(ridesResponse.data.createdRides);
        setJoinedRides(ridesResponse.data.joinedRides);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'assigned':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'authorized':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'pending':
      case 'active':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  // Calculate stats
  const stats = {
    deliveries: {
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      totalSpent: deliveries.reduce((sum, d) => sum + (d.price || 0), 0),
    },
    rides: {
      created: createdRides.length,
      joined: joinedRides.length,
      active: [...createdRides, ...joinedRides].filter(r => r.status === 'active').length,
      completed: [...createdRides, ...joinedRides].filter(r => r.status === 'completed').length,
    },
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'authorized', 'assigned', 'in-progress'].includes(delivery.status);
    return delivery.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* User Profile Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ashesi-primary to-ghana-red flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userInfo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {userInfo.name || 'User'} 🔥
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions Button */}
        <button
          onClick={() => navigate('/delivery')}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all"
        >
          Request New Delivery
        </button>

        {/* Activity Summary */}
        <div className="bg-teal-600 dark:bg-teal-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Activity Summary</h3>
              <button
                onClick={() => setActiveTab('deliveries')}
                className="text-sm underline opacity-90 hover:opacity-100"
              >
                See details
              </button>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">GH₵ {stats.deliveries.totalSpent.toFixed(2)}</p>
              <p className="text-sm opacity-90">spent</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Services</h2>
            <button
              onClick={() => setActiveTab('deliveries')}
              className="text-sm text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              See all &gt;&gt;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Deliveries Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setActiveTab('deliveries')}
              className="bg-teal-600 dark:bg-teal-700 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Total Deliveries</h3>
              <p className="text-3xl font-bold">₵ {stats.deliveries.total}.00</p>
              <p className="text-sm opacity-90 mt-1">/ {stats.deliveries.delivered} delivered</p>
            </motion.div>

            {/* Rides Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 }}
              onClick={() => setActiveTab('rides')}
              className="bg-teal-600 dark:bg-teal-700 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Active Rides</h3>
              <p className="text-3xl font-bold">₵ {(stats.rides.created + stats.rides.joined)}.00</p>
              <p className="text-sm opacity-90 mt-1">/ {stats.rides.active} active</p>
            </motion.div>

            {/* Carpooling Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/rides')}
              className="bg-teal-600 dark:bg-teal-700 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Carpooling</h3>
              <p className="text-3xl font-bold">₵ {stats.rides.created}.00</p>
              <p className="text-sm opacity-90 mt-1">/ {stats.rides.created} created</p>
            </motion.div>

            {/* Quick Services Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => navigate('/services')}
              className="bg-teal-600 dark:bg-teal-700 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Quick Services</h3>
              <p className="text-3xl font-bold">₵ 0.00</p>
              <p className="text-sm opacity-90 mt-1">/ browse vendors</p>
            </motion.div>
          </div>
        </div>

        {/* Health News/Footer Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📰 Updates</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Stay tuned for latest updates on deliveries, rides, and services.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-teal-600 dark:text-teal-400 font-semibold text-sm hover:underline"
            >
              Return to Home →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around items-center">
          {[
            { icon: '🏠', label: 'Home', action: () => navigate('/') },
            { icon: '📦', label: 'Deliveries', action: () => setActiveTab('deliveries') },
            { icon: '📋', label: 'Orders', action: () => setActiveTab('deliveries') },
            { icon: '🏪', label: 'Services', action: () => navigate('/services') },
            { icon: '⋯', label: 'More', action: () => navigate('/') },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
