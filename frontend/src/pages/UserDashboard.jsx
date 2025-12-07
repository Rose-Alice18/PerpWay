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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-3xl font-bold mb-1"
              >
                👋 Welcome back, {userInfo.name}!
              </motion.h1>
              <p className="text-white/90 text-sm">{userInfo.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm text-sm md:text-base"
              >
                🏠 Home
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm text-sm md:text-base"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'deliveries', label: 'My Deliveries', icon: '📦', count: stats.deliveries.total },
              { id: 'rides', label: 'My Rides', icon: '🚗', count: stats.rides.created + stats.rides.joined },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-ashesi-primary to-ghana-red text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Deliveries</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.deliveries.total}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-purple-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">GH₵{stats.deliveries.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-green-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-2xl">
                    🚗
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Rides Created</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.rides.created}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-l-4 border-orange-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-2xl">
                    🎫
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Rides Joined</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.rides.joined}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/delivery')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <span className="text-2xl">📦</span>
                  <div className="text-left">
                    <p className="font-bold">Request Delivery</p>
                    <p className="text-xs text-white/80">Send packages & items</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/rides')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <span className="text-2xl">🚗</span>
                  <div className="text-left">
                    <p className="font-bold">Find or Post Ride</p>
                    <p className="text-xs text-white/80">Carpool & save money</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⏱️ Recent Activity</h2>
              <div className="space-y-3">
                {[...deliveries.slice(0, 3), ...createdRides.slice(0, 2)]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-2xl">{item.pickupPoint ? '📦' : '🚗'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.itemDescription || `Ride: ${item.pickupLocation} → ${item.destination}`}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                {deliveries.length === 0 && createdRides.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-4xl mb-2">🎯</p>
                    <p>No activity yet. Start by requesting a delivery or posting a ride!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All', icon: '📋' },
                  { id: 'active', label: 'Active', icon: '🔄' },
                  { id: 'delivered', label: 'Delivered', icon: '✅' },
                  { id: 'pending', label: 'Pending', icon: '⏳' },
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      filter === id
                        ? 'bg-gradient-to-r from-ashesi-primary to-ghana-red text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
              {filteredDeliveries.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No deliveries found
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start by requesting your first delivery!
                  </p>
                  <button
                    onClick={() => navigate('/delivery')}
                    className="px-6 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Request Delivery
                  </button>
                </div>
              ) : (
                filteredDeliveries.map((delivery, index) => (
                  <motion.div
                    key={delivery._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">
                            {delivery.deliveryType === 'instant' ? '⚡' : delivery.deliveryType === 'next-day' ? '📅' : '📦'}
                          </span>
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
                            <span>📍 From:</span>
                            <span className="font-medium">{delivery.pickupPoint}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📍 To:</span>
                            <span className="font-medium">{delivery.dropoffPoint}</span>
                          </div>
                        </div>

                        {delivery.assignedRiderName && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span>🏍️ Rider:</span>
                            <span className="font-medium">{delivery.assignedRiderName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(delivery.status)}`}>
                          {delivery.status.toUpperCase()}
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            GH₵{delivery.price.toFixed(2)}
                          </p>
                          <p className={`text-sm font-semibold ${
                            delivery.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {delivery.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Rides Tab */}
        {activeTab === 'rides' && (
          <div className="space-y-6">
            {/* Rides You Created */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚗 Rides You Created</h2>
              {createdRides.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-2">🚗</p>
                  <p className="mb-4">You haven't created any rides yet</p>
                  <button
                    onClick={() => navigate('/rides')}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Post a Ride
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {createdRides.map((ride, index) => (
                    <div
                      key={ride._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {ride.pickupLocation} → {ride.destination}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ride.departureDate} at {ride.departureTime}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>👥 {ride.joinedUsers.length} joined</span>
                        <span>💺 {ride.availableSeats} seats left</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rides You Joined */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎫 Rides You Joined</h2>
              {joinedRides.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-2">🎫</p>
                  <p className="mb-4">You haven't joined any rides yet</p>
                  <button
                    onClick={() => navigate('/rides')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Find a Ride
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinedRides.map((ride, index) => (
                    <div
                      key={ride._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {ride.pickupLocation} → {ride.destination}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ride.departureDate} at {ride.departureTime}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created by: {ride.name}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
