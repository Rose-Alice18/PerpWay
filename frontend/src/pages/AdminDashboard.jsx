import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

/* eslint-disable no-restricted-globals */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [motorRiders, setMotorRiders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter states
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userAuthenticated');
    const userRole = localStorage.getItem('userRole');
    const authTime = localStorage.getItem('authTime');

    const isSessionValid = isAuthenticated && userRole === 'admin' && authTime &&
      (Date.now() - parseInt(authTime)) < 24 * 60 * 60 * 1000;

    if (!isSessionValid) {
      navigate('/signin');
    }
  }, [navigate]);

  // Mock riders
  const riders = [
    'Kwame Mensah',
    'Kofi Asante',
    'Akosua Boateng',
    'Yaw Osei',
    'Ama Serwaa'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch deliveries
      const deliveriesRes = await axios.get('http://localhost:5000/api/delivery/admin/all');
      setDeliveries(deliveriesRes.data);

      // Fetch drivers
      const driversRes = await axios.get('http://localhost:5000/api/drivers');
      setDrivers(driversRes.data);

      // Fetch rides
      const ridesRes = await axios.get('http://localhost:5000/api/rides');
      setRides(ridesRes.data);

      // Fetch vendors
      const vendorsRes = await axios.get('http://localhost:5000/api/vendors');
      setVendors(vendorsRes.data);

      // Fetch motor riders
      const motorRidersRes = await axios.get('http://localhost:5000/api/motor-riders');
      setMotorRiders(motorRidersRes.data);

      // Fetch categories
      const categoriesRes = await axios.get('http://localhost:5000/api/categories');
      setCategories(categoriesRes.data);

      // Get users from localStorage (since we're using localStorage auth)
      const perpwayUsers = JSON.parse(localStorage.getItem('perpwayUsers') || '[]');
      setUsers(perpwayUsers);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authTime');
    navigate('/signin');
  };

  const exportToCSV = (data, filename, headers) => {
    const csvData = data.map(row => headers.map(h => row[h] || ''));
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOverviewStats = () => {
    return {
      totalDeliveries: deliveries.length,
      activeDeliveries: deliveries.filter(d => ['pending', 'authorized', 'assigned', 'in-progress'].includes(d.status)).length,
      completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
      totalDrivers: drivers.length,
      totalRides: rides.length,
      activeRides: rides.filter(r => r.availableSeats > 0).length,
      totalVendors: vendors.length,
      totalUsers: users.length + 1, // +1 for admin
    };
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: '📊', color: 'text-blue-600' },
    { id: 'deliveries', name: 'Deliveries', icon: '📦', color: 'text-indigo-600' },
    { id: 'drivers', name: 'Drivers', icon: '🚗', color: 'text-green-600' },
    { id: 'rides', name: 'Rides', icon: '🚙', color: 'text-purple-600' },
    { id: 'vendors', name: 'Vendors', icon: '🛍️', color: 'text-orange-600' },
    { id: 'motor-riders', name: 'Motor Riders', icon: '🏍️', color: 'text-red-600' },
    { id: 'categories', name: 'Categories', icon: '🏷️', color: 'text-teal-600' },
    { id: 'users', name: 'Users', icon: '👥', color: 'text-pink-600' },
  ];

  const stats = getOverviewStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-ashesi-primary border-t-transparent mb-4"></div>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 shadow-2xl flex flex-col border-r border-gray-200 dark:border-gray-700"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            {sidebarOpen ? (
              <h2 className="font-display text-xl font-bold bg-gradient-to-r from-ashesi-primary to-ghana-red bg-clip-text text-transparent">
                Perpway
              </h2>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ashesi-primary to-ghana-red flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200`}
              title="Home"
            >
              <span className="text-xl">🏠</span>
              {sidebarOpen && <span className="text-sm">Home</span>}
            </button>

            {/* Divider */}
            {sidebarOpen && (
              <div className="py-2">
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-2 font-semibold">ADMIN PANEL</p>
              </div>
            )}

            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: sidebarOpen ? 1.02 : 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-ashesi-primary to-ghana-red text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={item.name}
              >
                <span className={`text-xl ${activeTab === item.id ? '' : item.color}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                {activeTab === item.id && sidebarOpen && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl font-semibold bg-red-50 dark:bg-red-900/20 text-ghana-red hover:bg-red-100 dark:hover:bg-red-900/30 transition-all`}
            title="Logout"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {menuItems.find(m => m.id === activeTab)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ashesi-primary to-ghana-red flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">Roseline</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <OverviewTab stats={stats} deliveries={deliveries} drivers={drivers} rides={rides} vendors={vendors} />}
              {activeTab === 'deliveries' && <DeliveriesTab deliveries={deliveries} fetchData={fetchAllData} motorRiders={motorRiders} exportToCSV={exportToCSV} />}
              {activeTab === 'drivers' && <DriversTab drivers={drivers} fetchData={fetchAllData} exportToCSV={exportToCSV} />}
              {activeTab === 'rides' && <RidesTab rides={rides} fetchData={fetchAllData} exportToCSV={exportToCSV} />}
              {activeTab === 'vendors' && <VendorsTab vendors={vendors} fetchData={fetchAllData} exportToCSV={exportToCSV} />}
              {activeTab === 'motor-riders' && <MotorRidersTab motorRiders={motorRiders} fetchData={fetchAllData} exportToCSV={exportToCSV} />}
              {activeTab === 'categories' && <CategoriesTab categories={categories} vendors={vendors} fetchData={fetchAllData} exportToCSV={exportToCSV} />}
              {activeTab === 'users' && <UsersTab users={users} fetchData={fetchAllData} exportToCSV={exportToCSV} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component with Analytics
const OverviewTab = ({ stats, deliveries, drivers, rides, vendors }) => {
  // Prepare data for charts
  const deliveryStatusData = [
    { name: 'Pending', value: deliveries.filter(d => d.status === 'pending').length, color: '#FCD116' },
    { name: 'Authorized', value: deliveries.filter(d => d.status === 'authorized').length, color: '#F59E0B' },
    { name: 'Assigned', value: deliveries.filter(d => d.status === 'assigned').length, color: '#3B82F6' },
    { name: 'In Progress', value: deliveries.filter(d => d.status === 'in-progress').length, color: '#8B5CF6' },
    { name: 'Delivered', value: deliveries.filter(d => d.status === 'delivered').length, color: '#006B3F' },
    { name: 'Cancelled', value: deliveries.filter(d => d.status === 'cancelled').length, color: '#CE1126' },
  ].filter(item => item.value > 0);

  // Mock weekly data for trend chart
  const weeklyData = [
    { day: 'Mon', deliveries: 12, rides: 8, revenue: 450 },
    { day: 'Tue', deliveries: 19, rides: 12, revenue: 680 },
    { day: 'Wed', deliveries: 15, rides: 10, revenue: 520 },
    { day: 'Thu', deliveries: 22, rides: 15, revenue: 890 },
    { day: 'Fri', deliveries: 28, rides: 20, revenue: 1200 },
    { day: 'Sat', deliveries: 35, rides: 25, revenue: 1450 },
    { day: 'Sun', deliveries: 18, rides: 14, revenue: 780 },
  ];

  // Platform metrics
  const platformMetrics = [
    { name: 'Deliveries', value: stats.totalDeliveries },
    { name: 'Rides', value: stats.totalRides },
    { name: 'Drivers', value: stats.totalDrivers },
    { name: 'Vendors', value: stats.totalVendors },
  ];

  const statCards = [
    {
      label: 'Total Deliveries',
      value: stats.totalDeliveries,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
      changeType: 'increase'
    },
    {
      label: 'Active Rides',
      value: stats.activeRides,
      icon: '🚙',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: '+8%',
      changeType: 'increase'
    },
    {
      label: 'Total Drivers',
      value: stats.totalDrivers,
      icon: '🚗',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      change: '+5%',
      changeType: 'increase'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400',
      change: '+15%',
      changeType: 'increase'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center text-3xl`}>
                {stat.icon}
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                stat.changeType === 'increase'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Activity</h3>
            <select className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="deliveries" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDeliveries)" />
              <Area type="monotone" dataKey="rides" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRides)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Delivery Status Pie Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Delivery Status Distribution</h3>
          {deliveryStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p className="text-lg font-semibold">No delivery data available</p>
                <p className="text-sm mt-2">Deliveries will appear here once created</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Platform Metrics Bar Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Platform Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                color: '#fff'
              }}
            />
            <Bar dataKey="value" fill="#CE1126" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {deliveries.slice(0, 5).map((delivery, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{delivery.name || 'Anonymous'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{delivery.itemDescription}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                delivery.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                delivery.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
              }`}>
                {delivery.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Deliveries Tab Component
const DeliveriesTab = ({ deliveries, fetchData, motorRiders, exportToCSV }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // Bulk send modal state
  const [showBulkSendModal, setShowBulkSendModal] = useState(false);
  const [availableRidersForBulk, setAvailableRidersForBulk] = useState([]);

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesType = typeFilter === 'all' || delivery.deliveryType === typeFilter;
    const matchesSearch = !searchTerm ||
      delivery.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.itemDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.contact?.includes(searchTerm);

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== 'all' && delivery.createdAt) {
      const deliveryDate = new Date(delivery.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch(dateFilter) {
        case 'today':
          matchesDate = deliveryDate >= today;
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = deliveryDate >= yesterday && deliveryDate < today;
          break;
        case 'last7days':
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          matchesDate = deliveryDate >= sevenDaysAgo;
          break;
        case 'last30days':
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchesDate = deliveryDate >= thirtyDaysAgo;
          break;
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = deliveryDate >= start && deliveryDate <= end;
          }
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesStatus && matchesType && matchesSearch && matchesDate;
  });

  const statusColors = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-400', border: 'border-yellow-300' },
    authorized: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-400', border: 'border-blue-300' },
    assigned: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-400', border: 'border-purple-300' },
    'in-progress': { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-800 dark:text-indigo-400', border: 'border-indigo-300' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-400', border: 'border-green-300' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-400', border: 'border-red-300' },
  };

  const handleAuthorize = async (deliveryId) => {
    const delivery = deliveries.find(d => d._id === deliveryId);
    if (!delivery) return;

    const confirmMessage = `Authorize delivery for ${delivery.name}?\n\nItem: ${delivery.itemDescription}\nType: ${delivery.deliveryType}`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await axios.put(`http://localhost:5000/api/delivery/admin/${deliveryId}/authorize`, {
        authorizedBy: 'Admin Roseline'
      });
      alert('✅ Delivery authorized successfully!');
      fetchData();
    } catch (error) {
      console.error('Error authorizing delivery:', error);
      alert('❌ Failed to authorize delivery: ' + (error.response?.data?.error || error.message));
    }
  };

  const sendDeliveryToRider = (delivery) => {
    const rider = motorRiders.find(r => r._id === delivery.assignedRider?._id || r._id === delivery.assignedRider);
    if (!rider) {
      alert('❌ No rider assigned to this delivery');
      return;
    }

    // Create delivery document
    const deliveryDoc = `
═══════════════════════════════════════
         PERPWAY DELIVERY DOCUMENT
═══════════════════════════════════════

📋 DELIVERY ID: ${delivery._id?.slice(-8).toUpperCase() || 'N/A'}
📅 DATE: ${new Date(delivery.createdAt).toLocaleDateString()}
⏰ TIME: ${new Date(delivery.createdAt).toLocaleTimeString()}

───────────────────────────────────────
         CUSTOMER INFORMATION
───────────────────────────────────────
👤 Name: ${delivery.name}
📞 Phone: ${delivery.contact}

───────────────────────────────────────
         DELIVERY DETAILS
───────────────────────────────────────
📦 Item: ${delivery.itemDescription}
📍 Pickup: ${delivery.pickupPoint || 'N/A'}
📍 Dropoff: ${delivery.dropoffPoint || 'N/A'}
🚚 Type: ${delivery.deliveryType}
${delivery.notes ? `📝 Notes: ${delivery.notes}` : ''}

───────────────────────────────────────
         RIDER INFORMATION
───────────────────────────────────────
🏍️ Name: ${rider.name}
📞 Phone: ${rider.phone}
${rider.whatsapp ? `💬 WhatsApp: ${rider.whatsapp}` : ''}
🏍️ Motorcycle: ${rider.motorcycleType || 'N/A'}
🔢 Plate: ${rider.plateNumber || 'N/A'}

───────────────────────────────────────
          STATUS & TIMELINE
───────────────────────────────────────
Status: ${delivery.status.toUpperCase()}
Authorized: ${delivery.authorizedAt ? new Date(delivery.authorizedAt).toLocaleString() : 'N/A'}
Assigned: ${delivery.assignedAt ? new Date(delivery.assignedAt).toLocaleString() : 'N/A'}

═══════════════════════════════════════
    © ${new Date().getFullYear()} Perpway - Personal Easy Rides & Packages
═══════════════════════════════════════
    `;

    // Copy to clipboard and show popup
    navigator.clipboard.writeText(deliveryDoc).then(() => {
      alert(`✅ Delivery document copied to clipboard!\n\nYou can now send this to ${rider.name} via:\n📱 WhatsApp: ${rider.whatsapp || rider.phone}\n📧 Email\n💬 SMS\n\nThe document has been copied and is ready to paste.`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      // Fallback: show the document in an alert
      alert(deliveryDoc);
    });
  };

  const handleAssignRider = async () => {
    if (!selectedRiderId || !selectedDelivery) return;

    const rider = motorRiders.find(r => r._id === selectedRiderId);
    const confirmMsg = `Assign delivery to ${rider?.name}?\n\n📦 Item: ${selectedDelivery.itemDescription}\n🏍️ Rider: ${rider?.name} (${rider?.phone})\n📱 Motorcycle: ${rider?.motorcycleType || 'N/A'}`;

    if (!confirm(confirmMsg)) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/delivery/admin/${selectedDelivery._id}/assign`, {
        riderId: selectedRiderId
      });

      setShowAssignModal(false);
      setSelectedDelivery(null);
      setSelectedRiderId('');
      await fetchData();

      // Ask if they want to send document using native confirm
      if (confirm(`✅ Delivery assigned to ${rider.name}!\n\nWould you like to send the delivery document to the rider?`)) {
        sendBulkDeliveriesToRider(selectedRiderId);
      }
    } catch (error) {
      console.error('Error assigning rider:', error);
      alert(`❌ ${error.response?.data?.error || 'Failed to assign rider'}`);
    }
  };

  const handleQuickAssignDefault = async (deliveryId) => {
    const delivery = deliveries.find(d => d._id === deliveryId);
    const defaultRider = motorRiders.find(r => r.isDefaultDeliveryRider);

    if (!defaultRider) {
      alert('❌ No default rider set!\n\nPlease set a default delivery rider in the Motor Riders tab first.');
      return;
    }

    const confirmMsg = `Quick Assign to Default Rider?\n\n📦 Item: ${delivery?.itemDescription}\n🏍️ Rider: ${defaultRider.name} ⭐\n📱 Phone: ${defaultRider.phone}`;

    if (!confirm(confirmMsg)) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/delivery/admin/${deliveryId}/assign-default`);
      await fetchData();

      // Ask if they want to send document
      if (confirm(`✅ Assigned to default rider ${defaultRider.name}!\n\nWould you like to send the delivery document to the rider?`)) {
        sendBulkDeliveriesToRider(defaultRider._id);
      }
    } catch (error) {
      console.error('Error quick-assigning to default rider:', error);
      alert(`❌ ${error.response?.data?.error || 'Failed to assign to default rider'}`);
    }
  };

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    const delivery = deliveries.find(d => d._id === deliveryId);
    const statusMessages = {
      'in-progress': `Start delivery?\n\n📦 ${delivery?.itemDescription}`,
      'delivered': `Mark as delivered?\n\n📦 ${delivery?.itemDescription}\n✅ Confirm customer received the item?`,
      'cancelled': `Cancel this delivery?\n\n📦 ${delivery?.itemDescription}\n⚠️ This action cannot be undone.`
    };

    const confirmMsg = statusMessages[newStatus] || `Update status to ${newStatus}?`;

    if (!confirm(confirmMsg)) return;

    try {
      await axios.put(`http://localhost:5000/api/delivery/admin/${deliveryId}/status`, { status: newStatus });
      alert(`✅ Status updated to ${newStatus}!`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`❌ Failed to update status: ${error.response?.data?.error || error.message}`);
    }
  };

  // Bulk send deliveries to a specific rider
  const sendBulkDeliveriesToRider = (riderId) => {
    const riderDeliveries = filteredDeliveries.filter(d =>
      (d.assignedRider?._id === riderId || d.assignedRider === riderId) &&
      ['assigned', 'in-progress'].includes(d.status)
    );

    if (riderDeliveries.length === 0) {
      alert('❌ No active deliveries found for this rider');
      return;
    }

    const rider = motorRiders.find(r => r._id === riderId) || riderDeliveries[0].assignedRider;
    if (!rider) {
      alert('❌ Rider information not found');
      return;
    }

    // Get rider code for update link
    const riderCode = rider.riderCode || 'N/A';
    const updateLink = riderCode !== 'N/A'
      ? `http://localhost:2000/rider-update/${riderCode}`
      : 'Contact admin for update link';

    // Create bulk delivery document
    const bulkDoc = `
═══════════════════════════════════════
      PERPWAY BULK DELIVERY DOCUMENT
═══════════════════════════════════════

🏍️ RIDER: ${rider.name || riderDeliveries[0].assignedRiderName}
📞 PHONE: ${rider.phone || 'N/A'}
${rider.whatsapp ? `💬 WHATSAPP: ${rider.whatsapp}` : ''}
📅 DATE: ${new Date().toLocaleDateString()}
⏰ TIME: ${new Date().toLocaleTimeString()}

📦 TOTAL DELIVERIES: ${riderDeliveries.length}

═══════════════════════════════════════
           DELIVERY DETAILS
═══════════════════════════════════════

${riderDeliveries.map((delivery, index) => `
───────────────────────────────────────
DELIVERY #${index + 1} - ID: ${delivery._id?.slice(-6).toUpperCase()}
───────────────────────────────────────
👤 Customer: ${delivery.name}
📞 Contact: ${delivery.contact}
📦 Item: ${delivery.itemDescription}
📍 Pickup: ${delivery.pickupPoint || 'N/A'}
📍 Dropoff: ${delivery.dropoffPoint || 'N/A'}
🚚 Type: ${delivery.deliveryType?.replace('-', ' ')}
📝 Notes: ${delivery.notes || 'None'}
⏰ Status: ${delivery.status.toUpperCase()}
`).join('\n')}

═══════════════════════════════════════
           DELIVERY SUMMARY
═══════════════════════════════════════
Total Packages: ${riderDeliveries.length}
Assigned: ${riderDeliveries.filter(d => d.status === 'assigned').length}
In Progress: ${riderDeliveries.filter(d => d.status === 'in-progress').length}

═══════════════════════════════════════
        📱 UPDATE DELIVERY STATUS
═══════════════════════════════════════

Tap this link to update delivery status:
${updateLink}

Use the link to mark deliveries as:
✅ DELIVERED - Successfully completed
❌ COULD NOT DELIVER - Add reason why

═══════════════════════════════════════
   © ${new Date().getFullYear()} Perpway - Personal Easy Rides & Packages
═══════════════════════════════════════
    `;

    // Copy to clipboard
    navigator.clipboard.writeText(bulkDoc).then(() => {
      alert(`✅ Bulk delivery document copied!\n\n${riderDeliveries.length} deliveries for ${rider.name || riderDeliveries[0].assignedRiderName}\n\nYou can now send this to:\n📱 WhatsApp: ${rider.whatsapp || rider.phone || 'N/A'}\n📧 Email\n💬 SMS`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert(bulkDoc);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Deliveries Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredDeliveries.length} / {deliveries.length} deliveries</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Refresh Button */}
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'card' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-300'}`}
              >
                🎴 Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-300'}`}
              >
                📋 Table
              </button>
            </div>
            <button
              onClick={() => {
                const riders = [...new Set(filteredDeliveries
                  .filter(d => d.assignedRider && ['assigned', 'in-progress'].includes(d.status))
                  .map(d => JSON.stringify({ id: d.assignedRider?._id || d.assignedRider, name: d.assignedRiderName || d.assignedRider?.name }))
                )].map(r => JSON.parse(r));

                if (riders.length === 0) {
                  alert('❌ No riders with active deliveries found');
                  return;
                }

                setAvailableRidersForBulk(riders);
                setShowBulkSendModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📤</span>
              Send Bulk to Rider
            </button>
            <button
              onClick={() => exportToCSV(filteredDeliveries, 'deliveries', ['name', 'contact', 'itemDescription', 'pickupPoint', 'dropoffPoint', 'status', 'deliveryType'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, item, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="authorized">Authorized</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="instant">Instant Delivery</option>
                <option value="next-day">Next Day Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No deliveries found matching your filters</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredDeliveries.map((delivery) => (
            <motion.div
              key={delivery._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Delivery Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{delivery.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.contact}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${statusColors[delivery.status]?.bg} ${statusColors[delivery.status]?.text} ${statusColors[delivery.status]?.border}`}>
                      {delivery.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">📦 Item:</span> <span className="text-gray-900 dark:text-white">{delivery.itemDescription}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">📍 Pickup:</span> <span className="text-gray-900 dark:text-white">{delivery.pickupPoint || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">📍 Dropoff:</span> <span className="text-gray-900 dark:text-white">{delivery.dropoffPoint || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">🚚 Type:</span> <span className="capitalize text-gray-900 dark:text-white">{delivery.deliveryType?.replace('-', ' ')}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">⏰ Requested:</span> <span className="text-gray-900 dark:text-white">{new Date(delivery.createdAt).toLocaleDateString()} {new Date(delivery.createdAt).toLocaleTimeString()}</span></p>
                    {delivery.authorizedBy && (
                      <p><span className="font-semibold text-gray-700 dark:text-gray-300">✅ Authorized by:</span> <span className="text-gray-900 dark:text-white">{delivery.authorizedBy}</span></p>
                    )}
                    {delivery.notes && (
                      <p><span className="font-semibold text-gray-700 dark:text-gray-300">📝 Notes:</span> <span className="text-gray-900 dark:text-white">{delivery.notes}</span></p>
                    )}
                  </div>
                </div>

                {/* Rider Info */}
                <div className="lg:col-span-1">
                  {delivery.assignedRider ? (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                        <span>🏍️</span>
                        Assigned Rider
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{delivery.assignedRiderName || delivery.assignedRider?.name || 'Unknown'}</p>
                      {delivery.assignedRider?.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">📞 {delivery.assignedRider.phone}</p>
                      )}
                      {delivery.assignedRider?.isDefaultDeliveryRider && (
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold rounded-lg border border-yellow-300 dark:border-yellow-700">
                          ⭐ Default Rider
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">No rider assigned</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:col-span-1 flex flex-col gap-2">
                  {delivery.status === 'pending' && (
                    <button
                      onClick={() => handleAuthorize(delivery._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                    >
                      ✅ Authorize
                    </button>
                  )}
                  {delivery.status === 'authorized' && (
                    <>
                      <button
                        onClick={() => handleQuickAssignDefault(delivery._id)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <span>⭐</span>
                        <span>Quick Assign</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowAssignModal(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm"
                      >
                        🏍️ Choose Rider
                      </button>
                    </>
                  )}
                  {delivery.status === 'assigned' && (
                    <>
                      <button
                        onClick={() => sendDeliveryToRider(delivery)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <span>📄</span>
                        <span>Send to Rider</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(delivery._id, 'in-progress')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm"
                      >
                        🚚 Start Delivery
                      </button>
                    </>
                  )}
                  {delivery.status === 'in-progress' && (
                    <>
                      <button
                        onClick={() => sendDeliveryToRider(delivery)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <span>📄</span>
                        <span>Send to Rider</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                        className="px-4 py-2 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all text-sm"
                      >
                        ✅ Mark Delivered
                      </button>
                    </>
                  )}
                  {['pending', 'authorized', 'assigned'].includes(delivery.status) && (
                    <button
                      onClick={() => handleUpdateStatus(delivery._id, 'cancelled')}
                      className="px-4 py-2 bg-ghana-red text-white rounded-xl font-semibold hover:bg-ghana-red/90 transition-all text-sm"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pickup</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dropoff</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rider</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{delivery.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.contact}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{delivery.itemDescription}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{delivery.pickupPoint || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{delivery.dropoffPoint || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-sm capitalize text-gray-900 dark:text-white">{delivery.deliveryType?.replace('-', ' ')}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(delivery.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-4 py-4">
                    {delivery.assignedRider ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{delivery.assignedRiderName || delivery.assignedRider?.name}</p>
                        {delivery.assignedRider?.phone && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">{delivery.assignedRider.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Not assigned</p>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[delivery.status]?.bg} ${statusColors[delivery.status]?.text}`}>
                      {delivery.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {delivery.status === 'pending' && (
                        <button
                          onClick={() => handleAuthorize(delivery._id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                        >
                          ✅ Authorize
                        </button>
                      )}
                      {delivery.status === 'authorized' && (
                        <>
                          <button
                            onClick={() => handleQuickAssignDefault(delivery._id)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-xs"
                          >
                            ⭐ Quick
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowAssignModal(true);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all text-xs"
                          >
                            🏍️ Choose
                          </button>
                        </>
                      )}
                      {delivery.status === 'assigned' && (
                        <>
                          <button
                            onClick={() => sendDeliveryToRider(delivery)}
                            className="px-3 py-1 bg-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-xs"
                          >
                            📄 Send
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(delivery._id, 'in-progress')}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all text-xs"
                          >
                            🚚 Start
                          </button>
                        </>
                      )}
                      {delivery.status === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                          className="px-3 py-1 bg-ghana-green text-white rounded-lg font-semibold hover:bg-ghana-green/90 transition-all text-xs"
                        >
                          ✅ Complete
                        </button>
                      )}
                      {['pending', 'authorized', 'assigned'].includes(delivery.status) && (
                        <button
                          onClick={() => handleUpdateStatus(delivery._id, 'cancelled')}
                          className="px-3 py-1 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Rider Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🏍️</span>
              Assign Motor Rider
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a motor rider for delivery: <span className="font-semibold text-gray-900 dark:text-white">{selectedDelivery?.itemDescription}</span>
            </p>

            {motorRiders.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
                <p className="text-yellow-800 dark:text-yellow-400 text-sm font-semibold">
                  ⚠️ No motor riders available. Please add motor riders from the Motor Riders tab first.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select Motor Rider</label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                >
                  <option value="">-- Choose a motor rider --</option>
                  {motorRiders
                    .filter(rider => rider.status === 'active')
                    .map((rider) => (
                      <option key={rider._id} value={rider._id}>
                        {rider.name} - {rider.phone} {rider.isDefaultDeliveryRider ? '⭐ (Default)' : ''} - {rider.motorcycleType || 'N/A'}
                      </option>
                    ))}
                </select>

                {motorRiders.filter(r => r.status === 'active').length === 0 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    ⚠️ No active riders available. All riders are currently busy or inactive.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAssignRider}
                disabled={!selectedRiderId || motorRiders.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                ✅ Assign Rider
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDelivery(null);
                  setSelectedRiderId('');
                }}
                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Send Rider Selection Modal */}
      {showBulkSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBulkSendModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Rider for Bulk Send
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a rider to send all their assigned deliveries
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
              {availableRidersForBulk.map((rider) => {
                const riderDeliveryCount = filteredDeliveries.filter(d =>
                  (d.assignedRider?._id === rider.id || d.assignedRider === rider.id) &&
                  ['assigned', 'in-progress'].includes(d.status)
                ).length;

                return (
                  <button
                    key={rider.id}
                    onClick={() => {
                      sendBulkDeliveriesToRider(rider.id);
                      setShowBulkSendModal(false);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-lg">
                          🏍️ {rider.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {riderDeliveryCount} active {riderDeliveryCount === 1 ? 'delivery' : 'deliveries'}
                        </div>
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 text-2xl">
                        →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowBulkSendModal(false)}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Drivers Tab Component
const DriversTab = ({ drivers, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    carType: '',
    location: ''
  });

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = !searchTerm ||
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contact?.includes(searchTerm) ||
      driver.carType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || driver.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const locations = [...new Set(drivers.map(d => d.location))].filter(Boolean);

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:5000/api/drivers', formData);
      setShowAddModal(false);
      setFormData({ name: '', contact: '', carType: '', location: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Failed to add driver: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/drivers/${selectedDriver._id}`, formData);
      setShowEditModal(false);
      setSelectedDriver(null);
      setFormData({ name: '', contact: '', carType: '', location: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Failed to update driver: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/drivers/${driverId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      contact: driver.contact,
      carType: driver.carType,
      location: driver.location
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Drivers Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredDrivers.length} / {drivers.length} drivers</p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🗂️ Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                📋 Table
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>➕</span>
              Add Driver
            </button>
            <button
              onClick={() => exportToCSV(filteredDrivers, 'drivers', ['name', 'contact', 'carType', 'location'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, contact, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No drivers found matching your filters</p>
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <motion.div
                key={driver._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-3">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-xl text-xs font-bold border-2 border-green-300 dark:border-green-700">
                    ACTIVE
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{driver.name}</h3>

                <div className="space-y-2 text-sm mb-4">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">📱</span>
                    <span className="text-gray-700 dark:text-gray-300">{driver.contact}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">🚙</span>
                    <span className="text-gray-700 dark:text-gray-300">{driver.carType}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">📍</span>
                    <span className="text-gray-700 dark:text-gray-300">{driver.location}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(driver)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver._id)}
                    className="flex-1 px-3 py-2 bg-ghana-red text-white rounded-xl font-semibold hover:bg-ghana-red/90 transition-all text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Car Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No drivers found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <motion.tr
                      key={driver._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <span className="text-lg">🚗</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{driver.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{driver.contact}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{driver.carType}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{driver.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(driver)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(driver._id)}
                            className="px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modals - Keep existing modal code */}
      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Driver</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Driver Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter driver name"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Phone number"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Car Type</label>
                <input
                  type="text"
                  value={formData.carType}
                  onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                  placeholder="e.g. Toyota Camry, Honda Civic"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Current location"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all"
              >
                Add Driver
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', contact: '', carType: '', location: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Driver</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Driver Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Car Type</label>
                <input
                  type="text"
                  value={formData.carType}
                  onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDriver(null);
                  setFormData({ name: '', contact: '', carType: '', location: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================
// RIDES TAB - Card & Table Views
// ============================================
const RidesTab = ({ rides, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const filteredRides = rides.filter(ride => {
    const matchesSearch = !searchTerm ||
      ride.pickup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.creatorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = ride.date ? (new Date(ride.date) >= new Date()) : false;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'completed' && !isActive);

    return matchesSearch && matchesStatus;
  });

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to delete this ride?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/rides/${rideId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting ride:', error);
      alert('Failed to delete ride');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isRideActive = (ride) => {
    if (!ride.date) return false;
    const rideDate = new Date(ride.date);
    if (isNaN(rideDate.getTime())) return false;
    return rideDate >= new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Rides Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredRides.length} / {rides.length} rides</p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'card' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🗂️ Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                📋 Table
              </button>
            </div>
            <button
              onClick={() => exportToCSV(filteredRides, 'rides', ['pickup', 'destination', 'date', 'time', 'availableSeats', 'creatorName'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by pickup, destination, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Rides</option>
              <option value="active">Active (Upcoming)</option>
              <option value="completed">Completed (Past)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRides.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No rides found matching your filters</p>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl p-3">
                    <span className="text-2xl">🚙</span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${
                    isRideActive(ride)
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}>
                    {isRideActive(ride) ? 'ACTIVE' : 'COMPLETED'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">📍</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-lg">🎯</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">To</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">👤</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created by</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white ml-6">{ride.creatorName || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(ride.date)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ride.time || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ride.availableSeats || 'N/A'}</p>
                  </div>
                </div>

                {!isRideActive(ride) && (
                  <div className="mb-3 p-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg">
                    <p className="text-xs text-orange-800 dark:text-orange-400 text-center font-semibold">
                      ⚠️ This ride has expired
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedRide(ride); setShowDetailsModal(true); }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => {
                      if (!isRideActive(ride)) {
                        if (window.confirm('⚠️ This ride has expired. Do you want to delete it?')) {
                          handleDeleteRide(ride._id);
                        }
                      } else {
                        handleDeleteRide(ride._id);
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-xl font-semibold transition-all text-sm ${
                      !isRideActive(ride)
                        ? 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse'
                        : 'bg-ghana-red hover:bg-ghana-red/90 text-white'
                    }`}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Route</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Seats</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Creator</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRides.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No rides found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredRides.map((ride) => (
                    <motion.tr
                      key={ride._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <span className="text-green-600">📍</span> {ride.pickup}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span className="text-red-600">🎯</span> {ride.destination}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">{formatDate(ride.date)}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{ride.time || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-semibold">
                          {ride.availableSeats} seats
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{ride.creatorName || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold inline-block w-fit ${
                            isRideActive(ride)
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
                          }`}>
                            {isRideActive(ride) ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                          {!isRideActive(ride) && (
                            <span className="text-xs text-orange-600 dark:text-orange-400">⚠️ Ready to delete</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedRide(ride); setShowDetailsModal(true); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => {
                              if (!isRideActive(ride)) {
                                if (window.confirm('⚠️ This ride has expired. Do you want to delete it?')) {
                                  handleDeleteRide(ride._id);
                                }
                              } else {
                                handleDeleteRide(ride._id);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs ${
                              !isRideActive(ride)
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-ghana-red hover:bg-ghana-red/90 text-white'
                            }`}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ride Details</h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                isRideActive(selectedRide)
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                  : 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
              }`}>
                {isRideActive(selectedRide) ? 'ACTIVE' : 'EXPIRED'}
              </span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Route</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.pickup || 'N/A'} → {selectedRide.destination || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created By</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>👤</span> {selectedRide.creatorName || 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedRide.date)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.time || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Seats</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.availableSeats || 'N/A'}</p>
              </div>
              {selectedRide.joinedUsers && selectedRide.joinedUsers.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Joined Passengers ({selectedRide.joinedUsers.length})</p>
                  <div className="space-y-2">
                    {selectedRide.joinedUsers.map((user, index) => (
                      <div key={user._id || index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">👤</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{user.name || 'N/A'}</span>
                        </div>
                        <div className="ml-7 space-y-1 text-sm">
                          {user.phone && (
                            <p className="text-gray-600 dark:text-gray-400">📞 {user.phone}</p>
                          )}
                          {user.email && (
                            <p className="text-gray-600 dark:text-gray-400">✉️ {user.email}</p>
                          )}
                          {user.seatsNeeded && (
                            <p className="text-gray-600 dark:text-gray-400">💺 {user.seatsNeeded} seat(s) needed</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => { setShowDetailsModal(false); setSelectedRide(null); }}
              className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================
// VENDORS TAB - Card & Table Views
// ============================================
const VendorsTab = ({ vendors, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editForm, setEditForm] = useState({
    businessName: '',
    category: '',
    contact: '',
    location: '',
    hours: ''
  });
  const [newVendorForm, setNewVendorForm] = useState({
    businessName: '',
    category: '',
    contact: '',
    location: '',
    hours: '',
    rating: 5,
    recommendations: 0
  });

  const filteredVendors = vendors.filter(vendor => {
    return !searchTerm ||
      vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/vendors/${vendorId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const handleEditClick = (vendor) => {
    setSelectedVendor(vendor);
    setEditForm({
      businessName: vendor.businessName || '',
      category: vendor.category || '',
      contact: vendor.contact || '',
      location: vendor.location || '',
      hours: vendor.hours || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/vendors/${selectedVendor._id}`, editForm);
      fetchData();
      setShowEditModal(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert('Failed to update vendor');
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vendors', newVendorForm);
      fetchData();
      setShowAddModal(false);
      setNewVendorForm({
        businessName: '',
        category: '',
        contact: '',
        location: '',
        hours: '',
        rating: 5,
        recommendations: 0
      });
    } catch (error) {
      console.error('Error creating vendor:', error);
      alert('Failed to create vendor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vendors Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredVendors.length} / {vendors.length} vendors</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Add Vendor Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>➕</span> Add Vendor
            </button>

            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'card' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🗂️ Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                📋 Table
              </button>
            </div>
            <button
              onClick={() => exportToCSV(filteredVendors, 'vendors', ['businessName', 'category', 'contact', 'location', 'hours'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by business name, category, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No vendors found matching your search</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-100 dark:bg-orange-900/20 rounded-xl p-3">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded-xl text-xs font-bold border-2 border-orange-300 dark:border-orange-700">
                    {vendor.category || 'VENDOR'}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{vendor.businessName}</h3>

                <div className="space-y-2 text-sm mb-4">
                  {vendor.contact && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">📱</span>
                      <span className="text-gray-700 dark:text-gray-300">{vendor.contact}</span>
                    </p>
                  )}
                  {vendor.location && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">📍</span>
                      <span className="text-gray-700 dark:text-gray-300">{vendor.location}</span>
                    </p>
                  )}
                  {vendor.hours && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">🕒</span>
                      <span className="text-gray-700 dark:text-gray-300">{vendor.hours}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(vendor)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor._id)}
                    className="flex-1 px-3 py-2 bg-ghana-red text-white rounded-xl font-semibold hover:bg-ghana-red/90 transition-all text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Business Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No vendors found matching your search
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <motion.tr
                      key={vendor._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <span className="text-lg">🛍️</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{vendor.businessName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded-lg text-xs font-semibold">
                          {vendor.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{vendor.contact || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{vendor.location || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(vendor)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor._id)}
                            className="px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Vendor</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contact
                </label>
                <input
                  type="text"
                  value={editForm.contact}
                  onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hours
                </label>
                <input
                  type="text"
                  value={editForm.hours}
                  onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 9AM - 5PM"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedVendor(null); }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Vendor</h3>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={newVendorForm.businessName}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={newVendorForm.category}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Restaurant, Salon, Pharmacy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contact
                </label>
                <input
                  type="text"
                  value={newVendorForm.contact}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, contact: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newVendorForm.location}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Physical address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={newVendorForm.hours}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, hours: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 9AM - 5PM"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Add Vendor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewVendorForm({
                      businessName: '',
                      category: '',
                      contact: '',
                      location: '',
                      hours: '',
                      rating: 5,
                      recommendations: 0
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================
// USERS TAB - Simple List View
// ============================================
const UsersTab = ({ users, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => {
    return !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const allUsers = [
    { _id: 'admin', name: 'Admin Roseline', email: 'admin@perpway.com', role: 'admin', date: 'System' },
    ...filteredUsers
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Users Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {allUsers.length} total users</p>
          </div>
          <button
            onClick={() => exportToCSV(allUsers, 'users', ['name', 'email', 'role', 'date'])}
            className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                allUsers.map((user, index) => (
                  <motion.tr
                    key={user._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          user.role === 'admin'
                            ? 'bg-gradient-to-br from-ashesi-primary to-ghana-red'
                            : 'bg-gradient-to-br from-blue-500 to-purple-500'
                        }`}>
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                      }`}>
                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {user.date === 'System' ? 'System User' : new Date(user.date).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MOTOR RIDERS TAB - Card & Table Views with Default Rider
// ============================================
const MotorRidersTab = ({ motorRiders, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [newRiderForm, setNewRiderForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    motorcycleType: '',
    plateNumber: '',
    location: '',
    status: 'active'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    motorcycleType: '',
    plateNumber: '',
    location: '',
    status: 'active'
  });

  const filteredRiders = motorRiders.filter(rider => {
    return !searchTerm ||
      rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.location?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddRider = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/motor-riders', newRiderForm);
      fetchData();
      setShowAddModal(false);
      setNewRiderForm({
        name: '',
        phone: '',
        whatsapp: '',
        motorcycleType: '',
        plateNumber: '',
        location: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating motor rider:', error);
      alert('Failed to create motor rider');
    }
  };

  const handleEditClick = (rider) => {
    setSelectedRider(rider);
    setEditForm({
      name: rider.name || '',
      phone: rider.phone || '',
      whatsapp: rider.whatsapp || '',
      motorcycleType: rider.motorcycleType || '',
      plateNumber: rider.plateNumber || '',
      location: rider.location || '',
      status: rider.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/motor-riders/${selectedRider._id}`, editForm);
      fetchData();
      setShowEditModal(false);
      setSelectedRider(null);
    } catch (error) {
      console.error('Error updating motor rider:', error);
      alert('Failed to update motor rider');
    }
  };

  const handleSetDefaultRider = async (riderId) => {
    if (!window.confirm('Set this rider as the default delivery rider?')) return;
    try {
      await axios.put(`http://localhost:5000/api/motor-riders/${riderId}/set-default`);
      fetchData();
    } catch (error) {
      console.error('Error setting default rider:', error);
      alert('Failed to set default rider');
    }
  };

  const handleDeleteRider = async (riderId) => {
    if (!window.confirm('Are you sure you want to delete this motor rider?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/motor-riders/${riderId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting motor rider:', error);
      alert('Failed to delete motor rider');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Motor Riders Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredRiders.length} / {motorRiders.length} motor riders</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>➕</span> Add Motor Rider
            </button>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'card' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🗂️ Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                📋 Table
              </button>
            </div>
            <button
              onClick={() => exportToCSV(filteredRiders, 'motor-riders', ['name', 'phone', 'motorcycleType', 'plateNumber', 'location', 'status'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by name, phone, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRiders.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No motor riders found</p>
            </div>
          ) : (
            filteredRiders.map((rider) => (
              <motion.div
                key={rider._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-red-100 dark:bg-red-900/20 rounded-xl p-3">
                    <span className="text-2xl">🏍️</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${
                      rider.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700'
                        : rider.status === 'busy'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                    }`}>
                      {rider.status?.toUpperCase()}
                    </span>
                    {rider.isDefaultDeliveryRider && (
                      <span className="text-2xl" title="Default Delivery Rider">⭐</span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{rider.name}</h3>

                <div className="space-y-2 text-sm mb-4">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">📱</span>
                    <span className="text-gray-700 dark:text-gray-300">{rider.phone}</span>
                  </p>
                  {rider.motorcycleType && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">🏍️</span>
                      <span className="text-gray-700 dark:text-gray-300">{rider.motorcycleType}</span>
                    </p>
                  )}
                  {rider.plateNumber && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">🔢</span>
                      <span className="text-gray-700 dark:text-gray-300">{rider.plateNumber}</span>
                    </p>
                  )}
                  {rider.location && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">📍</span>
                      <span className="text-gray-700 dark:text-gray-300">{rider.location}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">✅</span>
                    <span className="text-gray-700 dark:text-gray-300">{rider.completedDeliveries || 0} deliveries</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  {!rider.isDefaultDeliveryRider && (
                    <button
                      onClick={() => handleSetDefaultRider(rider._id)}
                      className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-all text-sm"
                      title="Set as default delivery rider"
                    >
                      ⭐ Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(rider)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRider(rider._id)}
                    className="flex-1 px-3 py-2 bg-ghana-red text-white rounded-xl font-semibold hover:bg-ghana-red/90 transition-all text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Rider</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Motorcycle</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No motor riders found
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((rider) => (
                    <motion.tr
                      key={rider._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <span className="text-lg">🏍️</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {rider.name}
                              {rider.isDefaultDeliveryRider && <span className="text-lg" title="Default Delivery Rider">⭐</span>}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{rider.completedDeliveries || 0} deliveries</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{rider.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-700 dark:text-gray-300">{rider.motorcycleType || 'N/A'}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{rider.plateNumber || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{rider.location || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          rider.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : rider.status === 'busy'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {rider.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {!rider.isDefaultDeliveryRider && (
                            <button
                              onClick={() => handleSetDefaultRider(rider._id)}
                              className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all text-xs"
                              title="Set as default delivery rider"
                            >
                              ⭐
                            </button>
                          )}
                          <button
                            onClick={() => handleEditClick(rider)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRider(rider._id)}
                            className="px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Motor Rider</h3>
            <form onSubmit={handleAddRider} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={newRiderForm.name}
                  onChange={(e) => setNewRiderForm({ ...newRiderForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={newRiderForm.phone}
                  onChange={(e) => setNewRiderForm({ ...newRiderForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={newRiderForm.whatsapp}
                  onChange={(e) => setNewRiderForm({ ...newRiderForm, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Motorcycle Type</label>
                <input
                  type="text"
                  value={newRiderForm.motorcycleType}
                  onChange={(e) => setNewRiderForm({ ...newRiderForm, motorcycleType: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Honda, Yamaha"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plate Number</label>
                <input
                  type="text"
                  value={newRiderForm.plateNumber}
                  onChange={(e) => setNewRiderForm({ ...newRiderForm, plateNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newRiderForm.location}
                  onChange={(e) => setNewRiderForm({ ...newRiderForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Base location"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Add Rider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRiderForm({
                      name: '',
                      phone: '',
                      whatsapp: '',
                      motorcycleType: '',
                      plateNumber: '',
                      location: '',
                      status: 'active'
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Motor Rider</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedRider(null); }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================
// CATEGORIES TAB - List View with Vendor Counts
// ============================================
const CategoriesTab = ({ categories, vendors, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    icon: '🏷️',
    color: '#f97316'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    icon: '🏷️',
    color: '#f97316'
  });

  const filteredCategories = categories.filter(category => {
    return !searchTerm ||
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate vendor counts for each category
  const categoriesWithCounts = filteredCategories.map(category => ({
    ...category,
    vendorCount: vendors.filter(v => v.category === category.name).length
  }));

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/categories', newCategoryForm);
      fetchData();
      setShowAddModal(false);
      setNewCategoryForm({
        name: '',
        description: '',
        icon: '🏷️',
        color: '#f97316'
      });
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '🏷️',
      color: category.color || '#f97316'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/categories/${selectedCategory._id}`, editForm);
      fetchData();
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Categories Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredCategories.length} / {categories.length} categories</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>➕</span> Add Category
            </button>
            <button
              onClick={() => exportToCSV(categoriesWithCounts, 'categories', ['name', 'description', 'vendorCount'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesWithCounts.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No categories found</p>
          </div>
        ) : (
          categoriesWithCounts.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div className="px-3 py-1 bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400 rounded-xl text-xs font-bold">
                  {category.vendorCount} vendors
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(category)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="flex-1 px-3 py-2 bg-ghana-red text-white rounded-xl font-semibold hover:bg-ghana-red/90 transition-all text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Restaurant, Pharmacy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newCategoryForm.description}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                <input
                  type="text"
                  value={newCategoryForm.icon}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Emoji icon"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <input
                  type="color"
                  value={newCategoryForm.color}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
                  className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCategoryForm({
                      name: '',
                      description: '',
                      icon: '🏷️',
                      color: '#f97316'
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Category</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                <input
                  type="text"
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <input
                  type="color"
                  value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedCategory(null); }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
