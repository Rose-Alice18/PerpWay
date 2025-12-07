import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const UserDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, delivered, in-progress
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

    // Fetch user's deliveries
    fetchUserDeliveries(userEmail);
  }, [navigate]);

  const fetchUserDeliveries = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/delivery/user/${email}`);

      if (response.data.success) {
        setDeliveries(response.data.deliveries);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to load your delivery history. Please try again.');
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
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'assigned':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'authorized':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getDeliveryTypeIcon = (type) => {
    switch (type) {
      case 'instant':
        return '⚡';
      case 'next-day':
        return '📅';
      case 'weekly-station':
        return '📦';
      default:
        return '📦';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 dark:text-green-400';
      case 'unpaid':
        return 'text-orange-600 dark:text-orange-400';
      case 'refunded':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'authorized', 'assigned', 'in-progress'].includes(delivery.status);
    return delivery.status === filter;
  });

  // Calculate stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inProgress: deliveries.filter(d => ['assigned', 'in-progress'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    totalSpent: deliveries.reduce((sum, d) => sum + (d.price || 0), 0),
    unpaidAmount: deliveries.filter(d => d.paymentStatus === 'unpaid').reduce((sum, d) => sum + (d.price || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold mb-2"
              >
                Welcome back, {userInfo.name}! 👋
              </motion.h1>
              <p className="text-white/90">{userInfo.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">GH₵{stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/delivery')}
              className="px-6 py-3 bg-gradient-to-r from-ghana-red to-ghana-yellow text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              📦 New Delivery Request
            </button>
            <button
              onClick={() => setFilter('active')}
              className="px-6 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all"
            >
              🔍 View Active Deliveries
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'all', label: 'All', icon: '📋' },
              { id: 'active', label: 'Active', icon: '🔄' },
              { id: 'pending', label: 'Pending', icon: '⏳' },
              { id: 'delivered', label: 'Delivered', icon: '✅' },
              { id: 'cancelled', label: 'Cancelled', icon: '❌' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === id
                    ? 'bg-gradient-to-r from-ghana-red to-ghana-yellow text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Delivery History ({filteredDeliveries.length})
          </h2>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No deliveries yet' : `No ${filter} deliveries`}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'all'
                  ? "Start by requesting your first delivery!"
                  : "Try changing the filter to see other deliveries"}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/delivery')}
                  className="px-6 py-3 bg-gradient-to-r from-ghana-red to-ghana-yellow text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Request Delivery
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredDeliveries.map((delivery, index) => (
                  <motion.div
                    key={delivery._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Delivery Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{getDeliveryTypeIcon(delivery.deliveryType)}</span>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {delivery.itemDescription}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(delivery.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">📍 From:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{delivery.pickupPoint}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">📍 To:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{delivery.dropoffPoint}</span>
                          </div>
                        </div>

                        {delivery.assignedRiderName && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">🏍️ Rider:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{delivery.assignedRiderName}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Status & Payment */}
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(delivery.status)}`}>
                          {delivery.status.toUpperCase()}
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            GH₵{delivery.price.toFixed(2)}
                          </p>
                          <p className={`text-sm font-semibold ${getPaymentStatusColor(delivery.paymentStatus)}`}>
                            {delivery.paymentStatus === 'paid' ? '✓ Paid' :
                             delivery.paymentStatus === 'refunded' ? '↩ Refunded' :
                             '⏳ Unpaid'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {delivery.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Note:</span> {delivery.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
