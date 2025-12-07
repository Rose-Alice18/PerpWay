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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-ashesi-primary border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* User Profile Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ashesi-primary to-ghana-red flex items-center justify-center text-white text-xl font-bold shadow-md">
              {userInfo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {userInfo.name || 'User'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.deliveries.total}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">GH₵ {stats.deliveries.totalSpent.toFixed(2)} spent</p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xl">🚗</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Rides</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rides.created + stats.rides.joined}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">{stats.rides.created} created, {stats.rides.joined} joined</p>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/delivery')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">📦</div>
                  <p className="font-semibold text-sm">Request Delivery</p>
                </button>
                <button
                  onClick={() => navigate('/rides')}
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">🚗</div>
                  <p className="font-semibold text-sm">Find Ride</p>
                </button>
                <button
                  onClick={() => navigate('/drivers')}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">🚙</div>
                  <p className="font-semibold text-sm">Find Driver</p>
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">🛍️</div>
                  <p className="font-semibold text-sm">Services</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                {[...deliveries.slice(0, 3), ...createdRides.slice(0, 2)]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="p-4 flex items-center gap-3">
                      <div className="text-2xl">{item.pickupPoint ? '📦' : '🚗'}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {item.itemDescription || `${item.pickupLocation} → ${item.destination}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                {deliveries.length === 0 && createdRides.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-3xl mb-2">🎯</p>
                    <p className="text-sm">No activity yet. Start using Perpway services!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'All', count: deliveries.length },
                { id: 'active', label: 'Active', count: deliveries.filter(d => ['pending', 'authorized', 'assigned', 'in-progress'].includes(d.status)).length },
                { id: 'delivered', label: 'Delivered', count: stats.deliveries.delivered },
                { id: 'pending', label: 'Pending', count: stats.deliveries.pending },
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    filter === id
                      ? 'bg-ashesi-primary text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
              {filteredDeliveries.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm text-center">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No deliveries found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Start by requesting your first delivery!</p>
                  <button
                    onClick={() => navigate('/delivery')}
                    className="px-6 py-3 bg-ashesi-primary text-white rounded-xl font-medium hover:shadow-md transition-all"
                  >
                    Request Delivery
                  </button>
                </div>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <div key={delivery._id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{delivery.itemDescription}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Pickup:</span> {delivery.pickupPoint}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Dropoff:</span> {delivery.dropoffPoint}
                      </p>
                      {delivery.price && (
                        <p className="text-gray-900 dark:text-white font-semibold">
                          GH₵ {delivery.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* My Rides Tab */}
        {activeTab === 'rides' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rides You Created</h2>
              {createdRides.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
                  <p className="text-3xl mb-2">🚗</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No rides created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {createdRides.map((ride) => (
                    <div key={ride._id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {ride.pickupLocation} → {ride.destination}
                        </p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(ride.departureDate).toLocaleDateString()} at {ride.departureTime}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {ride.passengersJoined || 0} joined • {ride.availableSeats} seats available
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rides You Joined</h2>
              {joinedRides.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
                  <p className="text-3xl mb-2">🎫</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No rides joined yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinedRides.map((ride) => (
                    <div key={ride._id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {ride.pickupLocation} → {ride.destination}
                        </p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(ride.departureDate).toLocaleDateString()} at {ride.departureTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{userInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white font-medium">{userInfo.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-all shadow-sm"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-2xl mx-auto px-2 py-2">
          <div className="flex justify-around items-center">
            {[
              { id: 'overview', icon: '🏠', label: 'Home' },
              { id: 'deliveries', icon: '📦', label: 'Deliveries' },
              { id: 'rides', icon: '🚗', label: 'Rides' },
              { id: 'profile', icon: '👤', label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'text-ashesi-primary font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
