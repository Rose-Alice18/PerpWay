import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// API configuration - defined at module level so all components can access
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth headers - defined at module level
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();
  const { confirmState, showConfirm, hideConfirm } = useConfirm();

  // Debug: Log confirmState changes
  React.useEffect(() => {
    console.log('📊 confirmState updated:', confirmState);
  }, [confirmState]);

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

  // Data states
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [motorRiders, setMotorRiders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [shoppingRequests, setShoppingRequests] = useState([]);

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

  // Individual fetch functions for optimized updates
  const fetchDrivers = async () => {
    try {
      const driversRes = await axios.get(`${API_URL}/api/drivers`);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const deliveriesRes = await axios.get(`${API_URL}/api/delivery/admin/all`, getAuthHeaders());
      setDeliveries(deliveriesRes.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const fetchRides = async () => {
    try {
      const ridesRes = await axios.get(`${API_URL}/api/rides?all=true`);
      setRides(ridesRes.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const vendorsRes = await axios.get(`${API_URL}/api/vendors`);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchMotorRiders = async () => {
    try {
      const motorRidersRes = await axios.get(`${API_URL}/api/motor-riders`);
      setMotorRiders(motorRidersRes.data);
    } catch (error) {
      console.error('Error fetching motor riders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRes = await axios.get(`${API_URL}/api/categories`);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShoppingRequests = async () => {
    try {
      const shoppingRes = await axios.get(`${API_URL}/api/shopping/admin/all`, getAuthHeaders());
      setShoppingRequests(shoppingRes.data);
    } catch (error) {
      console.error('Error fetching shopping requests:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRes = await axios.get(`${API_URL}/api/auth/users`);
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      await Promise.all([
        fetchDeliveries(),
        fetchDrivers(),
        fetchRides(),
        fetchVendors(),
        fetchMotorRiders(),
        fetchCategories(),
        fetchShoppingRequests(),
        fetchUsers()
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          showError('Session expired. Please login again.');
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert('Session expired. Please login again.');
        }
        setTimeout(() => navigate('/signin'), 2000);
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { id: 'home', name: 'Home', icon: '🏠', color: 'text-gray-600', isLink: true, path: '/' },
    { id: 'overview', name: 'Overview', icon: '📊', color: 'text-blue-600' },
    { id: 'deliveries', name: 'Deliveries', icon: '📦', color: 'text-indigo-600' },
    { id: 'shopping', name: 'Shopping Requests', icon: '🛒', color: 'text-yellow-600' },
    { id: 'revenue', name: 'Revenue', icon: '💰', color: 'text-emerald-600' },
    { id: 'drivers', name: 'Drivers', icon: '🚗', color: 'text-green-600' },
    { id: 'rides', name: 'Rides', icon: '🚙', color: 'text-purple-600' },
    { id: 'vendors', name: 'Vendors', icon: '🛍️', color: 'text-orange-600' },
    { id: 'motor-riders', name: 'Motor Riders', icon: '🏍️', color: 'text-red-600' },
    { id: 'categories', name: 'Categories', icon: '🏷️', color: 'text-teal-600' },
    { id: 'users', name: 'Users', icon: '👥', color: 'text-pink-600' },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: 'text-gray-600' },
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
      {/* Mobile Sidebar Overlay - Only show when expanded */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Expandable design */}
      <aside className={`bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800 flex flex-col py-4 fixed h-full z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}>
        {/* Logo/Brand */}
        <div className="px-2 mb-4">
          <div className={`w-full rounded-2xl bg-gradient-to-br from-ashesi-primary to-ghana-red flex items-center justify-center text-white font-bold shadow-lg transition-all ${
              sidebarOpen ? 'h-12 gap-2 px-3' : 'h-12 md:h-14'
            }`}>
            <span className={sidebarOpen ? 'text-lg' : 'text-xl'}>P</span>
            {sidebarOpen && <span className="text-sm font-semibold">Perpway</span>}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-2 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                if (item.isLink) {
                  navigate(item.path);
                } else {
                  setActiveTab(item.id);
                }
                if (window.innerWidth < 768) {
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }
              }}
              whileHover={{ scale: sidebarOpen ? 1.02 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full rounded-xl flex items-center transition-all duration-200 relative ${
                sidebarOpen ? 'h-12 gap-3 px-3' : 'h-12 md:h-14 justify-center'
              } ${
                activeTab === item.id && !item.isLink
                  ? 'bg-ashesi-primary shadow-lg shadow-ashesi-primary/50 text-white'
                  : 'bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
              title={item.name}
            >
              {activeTab === item.id && !sidebarOpen && !item.isLink && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className={sidebarOpen ? 'text-xl' : 'text-lg md:text-2xl'}>{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{item.name}</span>}
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <div className="px-2 mt-auto">
          <button
            onClick={handleLogout}
            className={`w-full rounded-xl bg-red-500/20 hover:bg-red-500/30 flex items-center text-red-400 hover:text-red-300 transition-all ${
              sidebarOpen ? 'h-12 gap-3 px-3' : 'h-12 md:h-14 justify-center'
            }`}
            title="Logout"
          >
            <span className={sidebarOpen ? 'text-xl' : 'text-lg md:text-2xl'}>🚪</span>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'ml-56' : 'ml-16'
      }`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Hamburger Menu (All devices) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex-1">
              {menuItems.find(m => m.id === activeTab)?.name || 'Dashboard'}
            </h1>

            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ashesi-primary to-ghana-red flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">Admin Roseline</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <OverviewTab stats={stats} deliveries={deliveries} drivers={drivers} rides={rides} vendors={vendors} />}
              {activeTab === 'deliveries' && <DeliveriesTab deliveries={deliveries} fetchData={fetchDeliveries} motorRiders={motorRiders} exportToCSV={exportToCSV} />}
              {activeTab === 'shopping' && <ShoppingTab shoppingRequests={shoppingRequests} fetchData={fetchShoppingRequests} motorRiders={motorRiders} exportToCSV={exportToCSV} showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'revenue' && <RevenueTab deliveries={deliveries} motorRiders={motorRiders} exportToCSV={exportToCSV} />}
              {activeTab === 'drivers' && <DriversTab drivers={drivers} fetchData={fetchDrivers} exportToCSV={exportToCSV} showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'rides' && <RidesTab rides={rides} fetchData={fetchRides} exportToCSV={exportToCSV} showConfirm={showConfirm} showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'vendors' && <VendorsTab vendors={vendors} fetchData={fetchVendors} exportToCSV={exportToCSV} />}
              {activeTab === 'motor-riders' && <MotorRidersTab motorRiders={motorRiders} fetchData={fetchMotorRiders} exportToCSV={exportToCSV} />}
              {activeTab === 'categories' && <CategoriesTab categories={categories} vendors={vendors} fetchData={fetchCategories} exportToCSV={exportToCSV} />}
              {activeTab === 'users' && <UsersTab users={users} fetchData={fetchUsers} exportToCSV={exportToCSV} />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component with Analytics
const OverviewTab = ({ stats, deliveries, drivers, rides, vendors }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [financialMetrics, setFinancialMetrics] = useState(null);
  const [growthMetrics, setGrowthMetrics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Fetch real analytics data
  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoadingAnalytics(true);

      // Fetch financial overview for this week
      const financialRes = await axios.get(`${API_URL}/api/financials/overview?period=week`, getAuthHeaders());
      setFinancialMetrics(financialRes.data);

      // Fetch 7-day trends for weekly chart
      const trendsRes = await axios.get(`${API_URL}/api/financials/trends?days=7`, getAuthHeaders());

      // Transform trends data to weekly chart format
      const trends = trendsRes.data.trends || [];
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyChartData = trends.map(trend => {
        const date = new Date(trend.date);
        return {
          day: daysOfWeek[date.getDay()],
          deliveries: trend.deliveryCount,
          rides: 0, // TODO: Add rides data when available
          revenue: trend.totalRevenue
        };
      });
      setWeeklyData(weeklyChartData);

      // Calculate growth metrics (compare this week vs last week)
      const lastWeekRes = await axios.get(`${API_URL}/api/financials/overview?period=week`, getAuthHeaders());
      const twoWeeksAgoRes = await axios.get(`${API_URL}/api/financials/trends?days=14`, getAuthHeaders());

      // Calculate growth percentages
      const thisWeekDeliveries = financialRes.data.deliveryStats?.total || 0;
      const lastWeekDeliveries = twoWeeksAgoRes.data.trends.slice(0, 7).reduce((sum, d) => sum + d.deliveryCount, 0);
      const deliveryGrowth = lastWeekDeliveries > 0
        ? (((thisWeekDeliveries - lastWeekDeliveries) / lastWeekDeliveries) * 100).toFixed(1)
        : 0;

      setGrowthMetrics({
        deliveryGrowth: deliveryGrowth,
        ridesGrowth: '+0', // TODO: Calculate when rides data available
        driversGrowth: '+0', // TODO: Calculate from user registration trends
        usersGrowth: '+0' // TODO: Calculate from user registration trends
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default empty data
      setWeeklyData([
        { day: 'Mon', deliveries: 0, rides: 0, revenue: 0 },
        { day: 'Tue', deliveries: 0, rides: 0, revenue: 0 },
        { day: 'Wed', deliveries: 0, rides: 0, revenue: 0 },
        { day: 'Thu', deliveries: 0, rides: 0, revenue: 0 },
        { day: 'Fri', deliveries: 0, rides: 0, revenue: 0 },
        { day: 'Sat', deliveries: 0, rides: 0, revenue: 0 },
        { day: 'Sun', deliveries: 0, rides: 0, revenue: 0 },
      ]);
      setGrowthMetrics({
        deliveryGrowth: '+0',
        ridesGrowth: '+0',
        driversGrowth: '+0',
        usersGrowth: '+0'
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Prepare data for charts
  const deliveryStatusData = [
    { name: 'Pending', value: deliveries.filter(d => d.status === 'pending').length, color: '#FCD116' },
    { name: 'Authorized', value: deliveries.filter(d => d.status === 'authorized').length, color: '#F59E0B' },
    { name: 'Assigned', value: deliveries.filter(d => d.status === 'assigned').length, color: '#3B82F6' },
    { name: 'In Progress', value: deliveries.filter(d => d.status === 'in-progress').length, color: '#8B5CF6' },
    { name: 'Delivered', value: deliveries.filter(d => d.status === 'delivered').length, color: '#006B3F' },
    { name: 'Cancelled', value: deliveries.filter(d => d.status === 'cancelled').length, color: '#CE1126' },
  ].filter(item => item.value > 0);

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
      change: growthMetrics ? `${growthMetrics.deliveryGrowth >= 0 ? '+' : ''}${growthMetrics.deliveryGrowth}%` : '...',
      changeType: growthMetrics && growthMetrics.deliveryGrowth >= 0 ? 'increase' : 'decrease'
    },
    {
      label: 'Total Revenue',
      value: financialMetrics ? `GH₵${financialMetrics.totalRevenue.toFixed(2)}` : 'GH₵0.00',
      icon: '💰',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      change: financialMetrics ? `${financialMetrics.deliveryStats?.total || 0} deliveries` : '...',
      changeType: 'neutral'
    },
    {
      label: 'Total Drivers',
      value: stats.totalDrivers,
      icon: '🚗',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      change: growthMetrics ? growthMetrics.driversGrowth : '...',
      changeType: 'neutral'
    },
    {
      label: 'Platform Share',
      value: financialMetrics ? `GH₵${financialMetrics.platformRevenue.toFixed(2)}` : 'GH₵0.00',
      icon: '🏦',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: financialMetrics ? `${financialMetrics.profitMargin}% margin` : '...',
      changeType: 'neutral'
    },
  ];

  if (loadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
                  : stat.changeType === 'decrease'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Activity (Last 7 Days)</h3>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="deliveries" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDeliveries)" name="Deliveries" />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (GH₵)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p className="text-lg font-semibold">No activity data yet</p>
                <p className="text-sm mt-2">Data will appear as deliveries are created</p>
              </div>
            </div>
          )}
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
          {(() => {
            // Combine all activities with timestamps
            const allActivities = [
              ...deliveries.map(d => ({
                type: 'delivery',
                icon: '📦',
                color: 'blue',
                name: d.name || 'Anonymous',
                description: d.itemDescription,
                status: d.status,
                timestamp: new Date(d.createdAt || d.requestDate || Date.now())
              })),
              ...rides.map(r => ({
                type: 'ride',
                icon: '🚗',
                color: 'purple',
                name: r.name || 'Anonymous',
                description: `${r.pickupLocation} → ${r.destination}`,
                status: r.status,
                timestamp: new Date(r.createdAt || Date.now())
              })),
              ...drivers.map(d => ({
                type: 'driver',
                icon: '🚗',
                color: 'green',
                name: d.name,
                description: 'New driver registered',
                status: 'active',
                timestamp: new Date(d.createdAt || Date.now())
              })),
              ...vendors.slice(0, 3).map(v => ({
                type: 'vendor',
                icon: '🏪',
                color: 'orange',
                name: v.name,
                description: `${v.category} vendor`,
                status: 'active',
                timestamp: new Date(v.createdAt || Date.now())
              }))
            ];

            // Sort by timestamp (most recent first) and take top 8
            const recentActivities = allActivities
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 8);

            if (recentActivities.length === 0) {
              return (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">No recent activity yet</p>
                </div>
              );
            }

            return recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/20 flex items-center justify-center`}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{activity.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    activity.status === 'delivered' || activity.status === 'completed' || activity.status === 'active' ?
                      'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    activity.status === 'in-progress' || activity.status === 'assigned' ?
                      'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {activity.status}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ));
          })()}
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
  const [viewMode, setViewMode] = useState('table'); // 'card' or 'table'

  // Bulk operations state
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkRiderId, setBulkRiderId] = useState('');

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

    showConfirm({
      title: 'Authorize Delivery?',
      message: `Authorize delivery for ${delivery.name}?\n\nItem: ${delivery.itemDescription}\nType: ${delivery.deliveryType}`,
      confirmText: 'Yes, authorize it!',
      cancelText: 'Nah, cancel',
      type: 'success',
      onConfirm: async () => {
        try {
          await axios.put(`${API_URL}/api/delivery/admin/${deliveryId}/authorize`, {
            authorizedBy: 'Admin Roseline'
          }, getAuthHeaders());
          showSuccess('Delivery authorized successfully! 🚀');
          fetchData();
        } catch (error) {
          console.error('Error authorizing delivery:', error);
          showError('Failed to authorize delivery: ' + (error.response?.data?.error || error.message));
        }
      }
    });
  };

  const sendDeliveryToRider = (delivery) => {
    const rider = motorRiders.find(r => r._id === delivery.assignedRider?._id || r._id === delivery.assignedRider);
    if (!rider) {
      showError('No rider assigned to this delivery');
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
      showSuccess(`Delivery document copied to clipboard!\n\nYou can now send this to ${rider.name} via:\n📱 WhatsApp: ${rider.whatsapp || rider.phone}\n📧 Email\n💬 SMS\n\nThe document has been copied and is ready to paste.`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      // Fallback: show the document in an info toast
      showInfo(deliveryDoc);
    });
  };

  const handleAssignRider = async () => {
    if (!selectedRiderId || !selectedDelivery) return;

    const rider = motorRiders.find(r => r._id === selectedRiderId);

    showConfirm({
      title: 'Assign Delivery to Rider?',
      message: `Assign delivery to ${rider?.name}?\n\n📦 Item: ${selectedDelivery.itemDescription}\n🏍️ Rider: ${rider?.name} (${rider?.phone})\n📱 Motorcycle: ${rider?.motorcycleType || 'N/A'}`,
      confirmText: 'Yes, assign it!',
      cancelText: 'Nah, cancel',
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await axios.put(`${API_URL}/api/delivery/admin/${selectedDelivery._id}/assign`, {
            riderId: selectedRiderId
          }, getAuthHeaders());

          setShowAssignModal(false);
          setSelectedDelivery(null);
          setSelectedRiderId('');
          await fetchData();

          // Ask if they want to send document
          showConfirm({
            title: 'Send Delivery Document?',
            message: `Delivery assigned to ${rider.name}!\n\nWould you like to send the delivery document to the rider?`,
            confirmText: 'Yes, send it!',
            cancelText: 'Not now',
            type: 'success',
            onConfirm: () => {
              sendBulkDeliveriesToRider(selectedRiderId);
            }
          });
        } catch (error) {
          console.error('Error assigning rider:', error);
          showError(error.response?.data?.error || 'Failed to assign rider');
        }
      }
    });
  };

  const handleQuickAssignDefault = async (deliveryId) => {
    const delivery = deliveries.find(d => d._id === deliveryId);
    const defaultRider = motorRiders.find(r => r.isDefaultDeliveryRider);

    if (!defaultRider) {
      showError('No default rider set!\n\nPlease set a default delivery rider in the Motor Riders tab first.');
      return;
    }

    showConfirm({
      title: 'Quick Assign to Default Rider?',
      message: `Quick Assign to Default Rider?\n\n📦 Item: ${delivery?.itemDescription}\n🏍️ Rider: ${defaultRider.name} ⭐\n📱 Phone: ${defaultRider.phone}`,
      confirmText: 'Yes, assign it!',
      cancelText: 'Nah, cancel',
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await axios.put(`${API_URL}/api/delivery/admin/${deliveryId}/assign-default`, {}, getAuthHeaders());
          await fetchData();

          // Ask if they want to send document
          showConfirm({
            title: 'Send Delivery Document?',
            message: `Assigned to default rider ${defaultRider.name}!\n\nWould you like to send the delivery document to the rider?`,
            confirmText: 'Yes, send it!',
            cancelText: 'Not now',
            type: 'success',
            onConfirm: () => {
              sendBulkDeliveriesToRider(defaultRider._id);
            }
          });
        } catch (error) {
          console.error('Error quick-assigning to default rider:', error);
          showError(error.response?.data?.error || 'Failed to assign to default rider');
        }
      }
    });
  };

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    const delivery = deliveries.find(d => d._id === deliveryId);
    const statusMessages = {
      'in-progress': { msg: `Start delivery?\n\n📦 ${delivery?.itemDescription}`, type: 'info' },
      'delivered': { msg: `Mark as delivered?\n\n📦 ${delivery?.itemDescription}\n✅ Confirm customer received the item?`, type: 'success' },
      'cancelled': { msg: `Cancel this delivery?\n\n📦 ${delivery?.itemDescription}\n⚠️ This action cannot be undone.`, type: 'danger' }
    };

    const { msg, type } = statusMessages[newStatus] || { msg: `Update status to ${newStatus}?`, type: 'info' };

    showConfirm({
      title: 'Update Status?',
      message: msg,
      confirmText: 'Yes, do it!',
      cancelText: 'Nah, cancel',
      type: type,
      onConfirm: async () => {
        try {
          await axios.put(`${API_URL}/api/delivery/admin/${deliveryId}/status`, { status: newStatus }, getAuthHeaders());
          showSuccess(`Status updated to ${newStatus}! 🎉`);
          fetchData();
        } catch (error) {
          console.error('Error updating status:', error);
          showError(`Failed to update status: ${error.response?.data?.error || error.message}`);
        }
      }
    });
  };

  // Bulk send deliveries to a specific rider
  const sendBulkDeliveriesToRider = (riderId) => {
    const riderDeliveries = filteredDeliveries.filter(d =>
      (d.assignedRider?._id === riderId || d.assignedRider === riderId) &&
      ['assigned', 'in-progress'].includes(d.status)
    );

    if (riderDeliveries.length === 0) {
      showError('No active deliveries found for this rider');
      return;
    }

    const rider = motorRiders.find(r => r._id === riderId) || riderDeliveries[0].assignedRider;
    if (!rider) {
      showError('Rider information not found');
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
      showSuccess(`Bulk delivery document copied!\n\n${riderDeliveries.length} deliveries for ${rider.name || riderDeliveries[0].assignedRiderName}\n\nYou can now send this to:\n📱 WhatsApp: ${rider.whatsapp || rider.phone || 'N/A'}\n📧 Email\n💬 SMS`);
    }).catch(err => {
      console.error('Failed to copy:', err);
      showInfo(bulkDoc);
    });
  };

  // ============================================
  // BULK OPERATIONS FUNCTIONS
  // ============================================

  // Toggle delivery selection
  const toggleDeliverySelection = (deliveryId) => {
    setSelectedDeliveries(prev =>
      prev.includes(deliveryId)
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  // Select all filtered deliveries
  const selectAllDeliveries = () => {
    setSelectedDeliveries(filteredDeliveries.map(d => d._id));
  };

  // Deselect all deliveries
  const deselectAllDeliveries = () => {
    setSelectedDeliveries([]);
  };

  // Bulk Authorize
  const handleBulkAuthorize = async () => {
    if (selectedDeliveries.length === 0) {
      showWarning('Please select deliveries to authorize');
      return;
    }

    showConfirm({
      title: 'Bulk Authorize Deliveries?',
      message: `Authorize ${selectedDeliveries.length} deliveries?`,
      confirmText: 'Yes, authorize them!',
      cancelText: 'Nah, cancel',
      type: 'success',
      onConfirm: async () => {
        try {
          const response = await axios.post(
            `${API_URL}/api/delivery/admin/bulk/authorize`,
            { deliveryIds: selectedDeliveries, authorizedBy: 'Admin Roseline' },
            getAuthHeaders()
          );
          showSuccess(response.data.message);
          setSelectedDeliveries([]);
          fetchData();
        } catch (error) {
          console.error('Bulk authorize error:', error);
          showError('Failed to bulk authorize: ' + (error.response?.data?.error || error.message));
        }
      }
    });
  };

  // Bulk Assign
  const handleBulkAssign = async () => {
    if (selectedDeliveries.length === 0) {
      showWarning('Please select deliveries to assign');
      return;
    }

    if (!bulkRiderId) {
      showWarning('Please select a rider');
      return;
    }

    const rider = motorRiders.find(r => r._id === bulkRiderId);

    showConfirm({
      title: 'Bulk Assign to Rider?',
      message: `Assign ${selectedDeliveries.length} deliveries to ${rider?.name}?`,
      confirmText: 'Yes, assign them!',
      cancelText: 'Nah, cancel',
      type: 'info',
      onConfirm: async () => {
        try {
          const response = await axios.post(
            `${API_URL}/api/delivery/admin/bulk/assign`,
            { deliveryIds: selectedDeliveries, riderId: bulkRiderId },
            getAuthHeaders()
          );
          showSuccess(response.data.message);
          setSelectedDeliveries([]);
          setBulkRiderId('');
          setShowBulkAssignModal(false);
          fetchData();
        } catch (error) {
          console.error('Bulk assign error:', error);
          showError('Failed to bulk assign: ' + (error.response?.data?.error || error.message));
        }
      }
    });
  };

  // Bulk Mark as Delivered
  const handleBulkMarkDelivered = async () => {
    if (selectedDeliveries.length === 0) {
      showWarning('Please select deliveries to mark as delivered');
      return;
    }

    showConfirm({
      title: 'Mark as Delivered?',
      message: `Mark ${selectedDeliveries.length} deliveries as DELIVERED?`,
      confirmText: 'Yes, mark them!',
      cancelText: 'Nah, cancel',
      type: 'success',
      onConfirm: async () => {
        try {
          const response = await axios.post(
            `${API_URL}/api/delivery/admin/bulk/status`,
            { deliveryIds: selectedDeliveries, status: 'delivered' },
            getAuthHeaders()
          );
          showSuccess(response.data.message);
          setSelectedDeliveries([]);
          fetchData();
        } catch (error) {
          console.error('Bulk mark delivered error:', error);
          showError('Failed to bulk mark as delivered: ' + (error.response?.data?.error || error.message));
        }
      }
    });
  };

  // Bulk Cancel
  const handleBulkCancel = async () => {
    if (selectedDeliveries.length === 0) {
      showWarning('Please select deliveries to cancel');
      return;
    }

    showConfirm({
      title: 'Cancel Deliveries?',
      message: `⚠️ Cancel ${selectedDeliveries.length} deliveries?\n\nThis action cannot be undone.`,
      confirmText: 'Yes, cancel them!',
      cancelText: 'Nah, keep them',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await axios.post(
            `${API_URL}/api/delivery/admin/bulk/cancel`,
            { deliveryIds: selectedDeliveries },
            getAuthHeaders()
          );
          showSuccess(response.data.message);
          setSelectedDeliveries([]);
          fetchData();
        } catch (error) {
          console.error('Bulk cancel error:', error);
          showError('Failed to bulk cancel: ' + (error.response?.data?.error || error.message));
        }
      }
    });
  };

  // Bulk Export Selected
  const handleBulkExport = () => {
    if (selectedDeliveries.length === 0) {
      showWarning('Please select deliveries to export');
      return;
    }

    const selectedDeliveriesData = deliveries.filter(d => selectedDeliveries.includes(d._id));
    exportToCSV(selectedDeliveriesData, 'selected-deliveries', [
      'name', 'contact', 'itemDescription', 'pickupPoint', 'dropoffPoint', 'deliveryType', 'status', 'assignedRiderName'
    ]);
    showSuccess(`Exported ${selectedDeliveries.length} deliveries to CSV! 📊`);
  };

  return (
    <div className="space-y-6">
      {/* Bulk Action Toolbar */}
      {selectedDeliveries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-2xl sticky top-4 z-20"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 px-4 py-2 rounded-xl font-bold text-lg">
                {selectedDeliveries.length} Selected
              </span>
              <button
                onClick={deselectAllDeliveries}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all"
              >
                Clear Selection
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkAuthorize}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-all text-sm"
              >
                ✓ Authorize
              </button>
              <button
                onClick={() => setShowBulkAssignModal(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold transition-all text-sm"
              >
                👤 Assign
              </button>
              <button
                onClick={handleBulkMarkDelivered}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-all text-sm"
              >
                ✅ Mark Delivered
              </button>
              <button
                onClick={handleBulkCancel}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all text-sm"
              >
                ✕ Cancel
              </button>
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all text-sm"
              >
                📥 Export
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
                  showError('No riders with active deliveries found');
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
              onClick={selectedDeliveries.length === filteredDeliveries.length ? deselectAllDeliveries : selectAllDeliveries}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <span>{selectedDeliveries.length === filteredDeliveries.length ? '☐' : '☑'}</span>
              {selectedDeliveries.length === filteredDeliveries.length ? 'Deselect All' : 'Select All'}
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
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={selectedDeliveries.includes(delivery._id)}
                    onChange={() => toggleDeliverySelection(delivery._id)}
                    className="w-5 h-5 rounded border-2 border-purple-400 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                  />
                </label>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
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
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedDeliveries.length === filteredDeliveries.length && filteredDeliveries.length > 0}
                    onChange={() => selectedDeliveries.length === filteredDeliveries.length ? deselectAllDeliveries() : selectAllDeliveries()}
                    className="w-5 h-5 rounded border-2 border-purple-400 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                  />
                </th>
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
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDeliveries.includes(delivery._id)}
                      onChange={() => toggleDeliverySelection(delivery._id)}
                      className="w-5 h-5 rounded border-2 border-purple-400 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                    />
                  </td>
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

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBulkAssignModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏍️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bulk Assign to Rider
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Assign {selectedDeliveries.length} {selectedDeliveries.length === 1 ? 'delivery' : 'deliveries'} to a rider
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Rider
              </label>
              <select
                value={bulkRiderId}
                onChange={(e) => setBulkRiderId(e.target.value)}
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

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleBulkAssign();
                  setShowBulkAssignModal(false);
                  setBulkRiderId('');
                }}
                disabled={!bulkRiderId || motorRiders.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                ✅ Assign to Rider
              </button>
              <button
                onClick={() => {
                  setShowBulkAssignModal(false);
                  setBulkRiderId('');
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
const DriversTab = ({ drivers, fetchData, exportToCSV, showSuccess, showError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'card' or 'table'
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    carType: '',
    location: '',
    availability: 'available',
    workingTime: {
      start: '06:00',
      end: '20:00'
    }
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
    // Validate only essential required fields (name, contact, location)
    // Car type is optional
    if (!formData.name || !formData.contact || !formData.location) {
      showError('Please fill in name, contact, and location');
      return;
    }

    try {
      console.log('Adding driver with data:', formData);
      const response = await axios.post(`${API_URL}/api/drivers`, formData);
      console.log('Driver added successfully:', response.data);
      setShowAddModal(false);
      setFormData({ name: '', contact: '', carType: '', location: '', availability: 'available', workingTime: { start: '06:00', end: '20:00' } });
      fetchData();
      showSuccess('Driver added successfully! 🚗');
    } catch (error) {
      console.error('Error adding driver:', error);
      console.error('Error response:', error.response?.data);
      showError('Failed to add driver: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`${API_URL}/api/drivers/${selectedDriver._id}`, formData);
      setShowEditModal(false);
      setSelectedDriver(null);
      setFormData({ name: '', contact: '', carType: '', location: '', availability: 'available', workingTime: { start: '06:00', end: '20:00' } });
      fetchData();
      showSuccess('Driver updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating driver:', error);
      showError('Failed to update driver: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (driverId) => {
    showConfirm({
      title: 'Delete Driver?',
      message: 'Are you sure you want to delete this driver?\n\nThis action cannot be undone.',
      confirmText: 'Yes, delete it!',
      cancelText: 'Nah, keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/api/drivers/${driverId}`);
          fetchData();
          showSuccess('Driver deleted successfully! 🗑️');
        } catch (error) {
          console.error('Error deleting driver:', error);
          showError('Failed to delete driver: ' + (error.response?.data?.message || error.message));
        }
      }
    });
  };

  const openEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      contact: driver.contact,
      carType: driver.carType,
      location: driver.location,
      availability: driver.availability || 'available'
    });
    setShowEditModal(true);
  };

  const handleQuickStatusChange = async (driverId, newStatus) => {
    try {
      // Optimistically update the UI immediately
      const updatedDrivers = drivers.map(d =>
        d._id === driverId ? { ...d, availability: newStatus } : d
      );

      // Update the database
      await axios.put(`${API_URL}/api/drivers/${driverId}`, { availability: newStatus });

      // Silently refresh in the background (no loading spinner)
      fetchData();
      showSuccess(`Driver status updated to ${newStatus}! ✨`);
    } catch (error) {
      console.error('Error updating driver status:', error);
      showError('Failed to update driver status: ' + (error.response?.data?.message || error.message));
      // Revert optimistic update on error
      fetchData();
    }
  };

  const getAvailabilityBadge = (availability) => {
    const statusConfig = {
      'available': { label: 'AVAILABLE', bg: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-800 dark:text-green-400', border: 'border-green-300 dark:border-green-700' },
      'busy': { label: 'BUSY', bg: 'bg-orange-100 dark:bg-orange-900/20', textColor: 'text-orange-800 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' },
      'offline': { label: 'OFFLINE', bg: 'bg-gray-100 dark:bg-gray-900/20', textColor: 'text-gray-800 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' }
    };
    const config = statusConfig[availability] || statusConfig['available'];
    return (
      <span className={`px-3 py-1 ${config.bg} ${config.textColor} rounded-xl text-xs font-bold border-2 ${config.border}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Drivers Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Showing {filteredDrivers.length} / {drivers.length} drivers</p>
            </div>
            {/* View Toggle - Mobile & Desktop */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('card')}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-semibold transition-all text-xs ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🗂️ Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-semibold transition-all text-xs ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                📋 Table
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="text-lg">➕</span>
              <span>Add Driver</span>
            </button>
            <button
              onClick={() => exportToCSV(filteredDrivers, 'drivers', ['name', 'contact', 'carType', 'location', 'availability'])}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="text-lg">📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, contact, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
                  {getAvailabilityBadge(driver.availability || 'available')}
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

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                    <select
                      value={driver.availability || 'available'}
                      onChange={(e) => handleQuickStatusChange(driver._id, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold"
                    >
                      <option value="available">✅ Available</option>
                      <option value="busy">⏳ Busy</option>
                      <option value="offline">⛔ Offline</option>
                    </select>
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
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Car Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Working Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">🕐</span>
                          <span className="text-sm font-medium">{driver.workingTime?.start || '06:00'} - {driver.workingTime?.end || '20:00'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={driver.availability || 'available'}
                          onChange={(e) => handleQuickStatusChange(driver._id, e.target.value)}
                          className="px-3 py-1.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold"
                        >
                          <option value="available">✅ Available</option>
                          <option value="busy">⏳ Busy</option>
                          <option value="offline">⛔ Offline</option>
                        </select>
                      </td>
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

          {/* Mobile Table View - Compact List */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDrivers.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                No drivers found matching your filters
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <motion.div
                  key={driver._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                        <span className="text-lg">🚗</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{driver.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{driver.contact}</p>
                      </div>
                    </div>
                    {getAvailabilityBadge(driver.availability || 'available')}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Car Type</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{driver.carType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Location</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{driver.location}</span>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                    <select
                      value={driver.availability || 'available'}
                      onChange={(e) => handleQuickStatusChange(driver._id, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold"
                    >
                      <option value="available">✅ Available</option>
                      <option value="busy">⏳ Busy</option>
                      <option value="offline">⛔ Offline</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driver._id)}
                      className="flex-1 px-3 py-2 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modals - Keep existing modal code */}
      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Availability Status</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                >
                  <option value="available">✅ Available</option>
                  <option value="busy">⏳ Busy</option>
                  <option value="offline">⛔ Offline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Working Time</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.workingTime.start}
                      onChange={(e) => setFormData({ ...formData, workingTime: { ...formData.workingTime, start: e.target.value } })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.workingTime.end}
                      onChange={(e) => setFormData({ ...formData, workingTime: { ...formData.workingTime, end: e.target.value } })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
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
                  setFormData({ name: '', contact: '', carType: '', location: '', availability: 'available', workingTime: { start: '06:00', end: '20:00' } });
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Availability Status</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                >
                  <option value="available">✅ Available</option>
                  <option value="busy">⏳ Busy</option>
                  <option value="offline">⛔ Offline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Working Time</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.workingTime?.start || '06:00'}
                      onChange={(e) => setFormData({ ...formData, workingTime: { ...formData.workingTime, start: e.target.value } })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.workingTime?.end || '20:00'}
                      onChange={(e) => setFormData({ ...formData, workingTime: { ...formData.workingTime, end: e.target.value } })}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
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
                  setFormData({ name: '', contact: '', carType: '', location: '', availability: 'available', workingTime: { start: '06:00', end: '20:00' } });
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
const RidesTab = ({ rides, fetchData, exportToCSV, showConfirm, showSuccess, showError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  // Check if ride time has passed (same day but time expired)
  const isRideTimePassed = (ride) => {
    if (!ride.departureDate || !ride.departureTime) return false;
    const now = new Date();
    const rideDateTime = new Date(`${ride.departureDate}T${ride.departureTime}`);

    if (rideDateTime < now) {
      const rideDate = new Date(ride.departureDate);
      rideDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return rideDate.getTime() === today.getTime(); // Same day
    }
    return false;
  };

  // Check if a ride has expired (after 24 hours - full day has passed)
  const isRideExpired = (ride) => {
    if (!ride.departureDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const rideDate = new Date(ride.departureDate);
    rideDate.setHours(0, 0, 0, 0);
    return rideDate < now;
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = !searchTerm ||
      ride.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = !isRideExpired(ride);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'completed' && !isActive);

    return matchesSearch && matchesStatus;
  });

  const handleDeleteRide = async (rideId) => {
    console.log('🗑️ Delete button clicked for ride:', rideId);
    try {
      console.log('🔄 Sending delete request to:', `${API_URL}/api/rides/${rideId}`);
      await axios.delete(`${API_URL}/api/rides/${rideId}`);
      console.log('✅ Ride deleted successfully');
      await fetchData(); // Refresh rides list
      console.log('🔄 Refreshed ride list');
      showSuccess('Ride deleted successfully! 🗑️');
    } catch (error) {
      console.error('❌ Error deleting ride:', error);
      showError('Failed to delete ride. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isRideActive = (ride) => {
    return !isRideExpired(ride);
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
              onClick={() => exportToCSV(filteredRides, 'rides', ['pickupLocation', 'destination', 'departureDate', 'departureTime', 'availableSeats', 'name'])}
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
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.pickupLocation}</p>
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
                  <p className="font-semibold text-gray-900 dark:text-white ml-6">{ride.name || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(ride.departureDate)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ride.departureTime || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ride.availableSeats || 'N/A'}</p>
                  </div>
                </div>

                {/* Time passed banner (same day) */}
                {isRideTimePassed(ride) && !isRideExpired(ride) && (
                  <motion.div
                    animate={{
                      scale: [1, 1.01, 1],
                      opacity: [0.85, 1, 0.85],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-3 p-2.5 rounded-lg border border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20"
                  >
                    <p className="text-xs font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-300">
                      <motion.span animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        🕐
                      </motion.span>
                      <span>Scheduled time of {ride.departureTime} has passed</span>
                    </p>
                  </motion.div>
                )}

                {/* Full day expired banner */}
                {isRideExpired(ride) && (
                  <motion.div
                    animate={{
                      scale: [1, 1.02, 1],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-3 p-3 rounded-lg border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                  >
                    <p className="text-xs font-bold flex items-center gap-2 text-red-700 dark:text-red-300">
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        ⚠️
                      </motion.span>
                      <span>This ride has expired and will be deleted soon</span>
                    </p>
                  </motion.div>
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
                      showConfirm({
                        title: !isRideActive(ride) ? 'Delete Expired Ride?' : 'Delete Ride?',
                        message: !isRideActive(ride)
                          ? '⚠️ This ride has expired. Do you want to delete it?'
                          : 'Are you sure you want to delete this ride?\n\nThis action cannot be undone.',
                        confirmText: 'Yes, delete it!',
                        cancelText: 'Nah, keep it',
                        type: !isRideActive(ride) ? 'warning' : 'danger',
                        onConfirm: () => handleDeleteRide(ride._id)
                      });
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
                            <span className="text-green-600">📍</span> {ride.pickupLocation}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span className="text-red-600">🎯</span> {ride.destination}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">{formatDate(ride.departureDate)}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{ride.departureTime || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-semibold">
                          {ride.availableSeats} seats
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{ride.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {isRideExpired(ride) ? (
                            <>
                              <span className="px-3 py-1 rounded-lg text-xs font-bold inline-block w-fit bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                                EXPIRED
                              </span>
                              <span className="text-xs text-red-600 dark:text-red-400">⚠️ Day has passed</span>
                            </>
                          ) : isRideTimePassed(ride) ? (
                            <>
                              <span className="px-3 py-1 rounded-lg text-xs font-bold inline-block w-fit bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400">
                                TIME PASSED
                              </span>
                              <span className="text-xs text-orange-600 dark:text-orange-400">🕐 Same day</span>
                            </>
                          ) : (
                            <span className="px-3 py-1 rounded-lg text-xs font-bold inline-block w-fit bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                              ACTIVE
                            </span>
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
                              console.log('🔘 Delete button clicked, showing confirm dialog');
                              console.log('📝 Ride ID:', ride._id);
                              console.log('🔍 showConfirm function:', showConfirm);
                              showConfirm({
                                title: !isRideActive(ride) ? 'Delete Expired Ride?' : 'Delete Ride?',
                                message: !isRideActive(ride)
                                  ? '⚠️ This ride has expired. Do you want to delete it?'
                                  : 'Are you sure you want to delete this ride?\n\nThis action cannot be undone.',
                                confirmText: 'Yes, delete it!',
                                cancelText: 'Nah, keep it',
                                type: !isRideActive(ride) ? 'warning' : 'danger',
                                onConfirm: () => handleDeleteRide(ride._id)
                              });
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
                <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.pickupLocation || 'N/A'} → {selectedRide.destination || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created By</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>👤</span> {selectedRide.name || 'N/A'}
                </p>
                {selectedRide.contact && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    📞 {selectedRide.contact}
                  </p>
                )}
                {selectedRide.userEmail && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ✉️ {selectedRide.userEmail}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedRide.departureDate)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.departureTime || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Seats</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.availableSeats || 'N/A'}</p>
              </div>
              {selectedRide.notes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRide.notes}</p>
                </div>
              )}
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
  const [viewMode, setViewMode] = useState('table');
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
    showConfirm({
      title: 'Delete Vendor?',
      message: 'Are you sure you want to delete this vendor?\n\nThis action cannot be undone.',
      confirmText: 'Yes, delete it!',
      cancelText: 'Nah, keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/api/vendors/${vendorId}`);
          fetchData();
          showSuccess('Vendor deleted successfully! 🗑️');
        } catch (error) {
          console.error('Error deleting vendor:', error);
          showError('Failed to delete vendor');
        }
      }
    });
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
      await axios.put(`${API_URL}/api/vendors/${selectedVendor._id}`, editForm);
      fetchData();
      setShowEditModal(false);
      setSelectedVendor(null);
      showSuccess('Vendor updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating vendor:', error);
      showError('Failed to update vendor');
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/vendors`, newVendorForm);
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
      showSuccess('Vendor added successfully! 🏪');
    } catch (error) {
      console.error('Error creating vendor:', error);
      showError('Failed to create vendor');
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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const filteredUsers = users.filter(user => {
    return !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const allUsers = [
    { _id: 'admin', name: 'Admin Roseline', email: 'admin@perpway.com', role: 'admin', createdAt: 'System' },
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
          <div className="flex flex-wrap gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-ashesi-primary'
                }`}
              >
                <span>📊</span> Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-ashesi-primary'
                }`}
              >
                <span>📇</span> Cards
              </button>
            </div>
            <button
              onClick={() => exportToCSV(allUsers, 'users', ['name', 'email', 'role', 'createdAt'])}
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
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
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
                        {user.createdAt === 'System' ? 'System User' : new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allUsers.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No users found</p>
            </div>
          ) : (
            allUsers.map((user, index) => (
              <motion.div
                key={user._id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl ${
                    user.role === 'admin'
                      ? 'bg-gradient-to-br from-ashesi-primary to-ghana-red'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold mt-1 ${
                      user.role === 'admin'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                    }`}>
                      {user.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>📧</span>
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>📅</span>
                    <span>{user.createdAt === 'System' ? 'System User' : new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MOTOR RIDERS TAB - Card & Table Views with Default Rider
// ============================================
const MotorRidersTab = ({ motorRiders, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
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
      await axios.post(`${API_URL}/api/motor-riders`, newRiderForm);
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
      showSuccess('Motor rider added successfully! 🏍️');
    } catch (error) {
      console.error('Error creating motor rider:', error);
      showError('Failed to create motor rider');
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
      await axios.put(`${API_URL}/api/motor-riders/${selectedRider._id}`, editForm);
      fetchData();
      setShowEditModal(false);
      setSelectedRider(null);
      showSuccess('Motor rider updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating motor rider:', error);
      showError('Failed to update motor rider');
    }
  };

  const handleSetDefaultRider = async (riderId) => {
    showConfirm({
      title: 'Set Default Delivery Rider?',
      message: 'Set this rider as the default delivery rider?\n\nThis will be used for quick-assign deliveries.',
      confirmText: 'Yes, set as default!',
      cancelText: 'Nah, cancel',
      type: 'info',
      onConfirm: async () => {
        try {
          await axios.put(`${API_URL}/api/motor-riders/${riderId}/set-default`);
          fetchData();
          showSuccess('Default rider set successfully! ⭐');
        } catch (error) {
          console.error('Error setting default rider:', error);
          showError('Failed to set default rider');
        }
      }
    });
  };

  const handleDeleteRider = async (riderId) => {
    showConfirm({
      title: 'Delete Motor Rider?',
      message: 'Are you sure you want to delete this motor rider?\n\nThis action cannot be undone.',
      confirmText: 'Yes, delete it!',
      cancelText: 'Nah, keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/api/motor-riders/${riderId}`);
          fetchData();
          showSuccess('Motor rider deleted successfully! 🗑️');
        } catch (error) {
          console.error('Error deleting motor rider:', error);
          showError('Failed to delete motor rider');
        }
      }
    });
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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
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
      await axios.post(`${API_URL}/api/categories`, newCategoryForm);
      fetchData();
      setShowAddModal(false);
      setNewCategoryForm({
        name: '',
        description: '',
        icon: '🏷️',
        color: '#f97316'
      });
      showSuccess('Category added successfully! 🏷️');
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Failed to create category');
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
      await axios.put(`${API_URL}/api/categories/${selectedCategory._id}`, editForm);
      fetchData();
      setShowEditModal(false);
      setSelectedCategory(null);
      showSuccess('Category updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Failed to update category');
    }
  };

  const handleToggleCategoryVisibility = async (category) => {
    try {
      const response = await axios.patch(`${API_URL}/api/categories/${category._id}/toggle-visibility`);
      fetchData();
      const newStatus = response.data.category.isVisible;
      showSuccess(`Category ${newStatus ? 'shown' : 'hidden'} successfully! ${newStatus ? '👁️' : '🙈'}`);
    } catch (error) {
      console.error('Error toggling category visibility:', error);
      showError('Failed to toggle category visibility');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    showConfirm({
      title: 'Delete Category?',
      message: 'Are you sure you want to delete this category?\n\nThis action cannot be undone.',
      confirmText: 'Yes, delete it!',
      cancelText: 'Nah, keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/api/categories/${categoryId}`);
          fetchData();
          showSuccess('Category deleted successfully! 🗑️');
        } catch (error) {
          console.error('Error deleting category:', error);
          showError('Failed to delete category');
        }
      }
    });
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
            {/* View Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-ashesi-primary'
                }`}
              >
                <span>📊</span> Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-ashesi-primary'
                }`}
              >
                <span>📇</span> Cards
              </button>
            </div>
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

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {categoriesWithCounts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No categories found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Icon</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vendors</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categoriesWithCounts.map((category) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <span className="text-xl">{category.icon}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 dark:text-white">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{category.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400 rounded-xl text-xs font-bold">
                          {category.vendorCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleCategoryVisibility(category)}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs ${
                              category.isVisible
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                            title={category.isVisible ? 'Click to hide from customers' : 'Click to show to customers'}
                          >
                            {category.isVisible ? '👁️ Visible' : '🙈 Hidden'}
                          </button>
                          <button
                            onClick={() => handleEditClick(category)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
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

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleCategoryVisibility(category)}
                    className={`w-full px-3 py-2 rounded-xl font-semibold transition-all text-sm ${
                      category.isVisible
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                    title={category.isVisible ? 'Click to hide from customers' : 'Click to show to customers'}
                  >
                    {category.isVisible ? '👁️ Visible to Customers' : '🙈 Hidden from Customers'}
                  </button>
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
                </div>
              </motion.div>
            ))
          )}
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

// ============================================
// REVENUE TAB - Financial Tracking & Analytics
// ============================================
const RevenueTab = ({ deliveries, motorRiders, exportToCSV }) => {
  const [period, setPeriod] = useState('month');
  const [viewMode, setViewMode] = useState('table');
  const [financialData, setFinancialData] = useState(null);
  const [riderStats, setRiderStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancialData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview
      const overviewRes = await axios.get(`${API_URL}/api/financials/overview?period=${period}`, getAuthHeaders());

      // Fetch rider stats
      const riderRes = await axios.get(`${API_URL}/api/financials/riders?period=${period}`, getAuthHeaders());

      setFinancialData(overviewRes.data);
      setRiderStats(riderRes.data.riders || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load financial data');
      // Set default empty data to avoid infinite loading
      setFinancialData({
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0,
        platformRevenue: 0,
        profitMargin: 0,
        deliveryStats: { total: 0 }
      });
      setRiderStats([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Financial Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchFinancialData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Revenue & Financial Tracking</h2>
            <p className="text-gray-600 dark:text-gray-400">Monitor earnings, commissions, and payment status</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={() => exportToCSV(riderStats, 'rider-financials', ['riderName', 'totalDeliveries', 'totalRevenue', 'totalCommission'])}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
            >
              📥 Export
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100">Total Revenue</span>
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-3xl font-bold">GH₵{financialData.totalRevenue.toFixed(2)}</div>
          <div className="text-emerald-100 text-sm mt-2">
            {financialData.deliveryStats.total} deliveries
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Paid Revenue</span>
            <span className="text-3xl">✅</span>
          </div>
          <div className="text-3xl font-bold">GH₵{financialData.paidRevenue.toFixed(2)}</div>
          <div className="text-green-100 text-sm mt-2">
            {((financialData.paidRevenue / financialData.totalRevenue) * 100).toFixed(1)}% collected
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Unpaid Revenue</span>
            <span className="text-3xl">⏳</span>
          </div>
          <div className="text-3xl font-bold">GH₵{financialData.unpaidRevenue.toFixed(2)}</div>
          <div className="text-orange-100 text-sm mt-2">
            Pending collection
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Platform Share</span>
            <span className="text-3xl">🏢</span>
          </div>
          <div className="text-3xl font-bold">GH₵{financialData.platformRevenue.toFixed(2)}</div>
          <div className="text-blue-100 text-sm mt-2">
            {financialData.profitMargin}% margin
          </div>
        </div>
      </div>

      {/* Rider Earnings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rider Earnings</h3>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-emerald-600 shadow-md'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                📊 Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-emerald-600 shadow-md'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                📇 Cards
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Rider</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Deliveries</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Commission</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Unpaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {riderStats.map((rider) => (
                  <tr key={rider.riderId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{rider.riderName}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {rider.totalDeliveries} ({rider.completionRate}%)
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      GH₵{rider.totalRevenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                      GH₵{rider.totalCommission.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400">
                      GH₵{rider.paidRevenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-orange-600 dark:text-orange-400">
                      GH₵{rider.unpaidRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {riderStats.map((rider) => (
              <div key={rider.riderId} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">{rider.riderName}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deliveries:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{rider.totalDeliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="font-semibold text-emerald-600">GH₵{rider.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Commission:</span>
                    <span className="font-semibold text-blue-600">GH₵{rider.totalCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Completion:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{rider.completionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// SETTINGS TAB - Configuration Management
// ============================================
const SettingsTab = () => {
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { confirmState, showConfirm, hideConfirm } = useConfirm();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('pricing');
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info',
    active: true,
    targetAudience: 'all',
    endDate: ''
  });

  const [holidayForm, setHolidayForm] = useState({
    date: '',
    name: '',
    description: ''
  });

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/settings`, getAuthHeaders());
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Failed to load settings. Please refresh the page.');
      // Set default settings to prevent blank page
      setSettings({
        pricing: { instant: 10, nextDay: 7, weeklyStation: 5 },
        autoAssignment: { enabled: false },
        notificationTemplates: {},
        businessHours: { schedule: {}, holidays: [] },
        announcements: [],
        sla: {},
        general: { platformName: 'Perpway', currency: 'GH₵' }
      });
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updatedFields) => {
    try {
      setSaving(true);
      const response = await axios.put(`${API_URL}/api/settings`, updatedFields, getAuthHeaders());
      setSettings(response.data.settings);
      showSuccess('Settings updated successfully! Your changes are live now 🚀');
    } catch (error) {
      console.error('Error updating settings:', error);
      showError('Failed to update settings. Please try again!');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAnnouncement = async () => {
    try {
      await axios.post(`${API_URL}/api/settings/announcements`, announcementForm, getAuthHeaders());
      setShowAddAnnouncementModal(false);
      setAnnouncementForm({ title: '', message: '', type: 'info', active: true, targetAudience: 'all', endDate: '' });
      fetchSettings();
      showSuccess('Announcement created! Everyone will see this now 📢');
    } catch (error) {
      console.error('Error creating announcement:', error);
      showError('Couldn\'t create announcement. Maybe try again?');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    showConfirm({
      title: 'Delete Announcement?',
      message: 'Are you sure you want to delete this announcement?\n\nThis action cannot be undone.',
      confirmText: 'Yes, delete it!',
      cancelText: 'Nah, keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/api/settings/announcements/${announcementId}`, getAuthHeaders());
          fetchSettings();
          showSuccess('Announcement deleted! It\'s gone forever now 🗑️');
        } catch (error) {
          console.error('Error deleting announcement:', error);
          showError('Couldn\'t delete announcement. Something went wrong!');
        }
      }
    });
  };

  const handleAddHoliday = async () => {
    try {
      await axios.post(`${API_URL}/api/settings/holidays`, holidayForm, getAuthHeaders());
      setShowAddHolidayModal(false);
      setHolidayForm({ date: '', name: '', description: '' });
      fetchSettings();
      showSuccess('Holiday added! Time to celebrate 🎉');
    } catch (error) {
      console.error('Error adding holiday:', error);
      showError('Failed to add holiday. Try again maybe?');
    }
  };

  const handleDeleteHoliday = async (date) => {
    showConfirm({
      title: 'Delete Holiday?',
      message: 'Are you sure you want to delete this holiday?\n\nThis action cannot be undone.',
      confirmText: 'Yes, delete it!',
      cancelText: 'Nah, keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/api/settings/holidays/${date}`, getAuthHeaders());
          fetchSettings();
          showSuccess('Holiday deleted! Back to work we go 💼');
        } catch (error) {
          console.error('Error deleting holiday:', error);
          showError('Failed to delete holiday. Something broke!');
        }
      }
    });
  };

  const sections = [
    { id: 'pricing', name: 'Pricing', icon: '💰' },
    { id: 'auto-assignment', name: 'Auto-Assignment', icon: '🤖' },
    { id: 'notifications', name: 'Notifications', icon: '📬' },
    { id: 'business-hours', name: 'Business Hours', icon: '🕐' },
    { id: 'announcements', name: 'Announcements', icon: '📢' },
    { id: 'sla', name: 'SLA Thresholds', icon: '⏱️' },
    { id: 'general', name: 'General', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-5xl mb-4"
          >
            ⚙️
          </motion.div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashesi-primary mb-3"></div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading settings...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This won't take long</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 dark:text-gray-400">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings & Configuration</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage platform settings, pricing, automation rules, and more</p>
      </div>

      {/* Section Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-ashesi-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{section.icon}</span>
              <span className="hidden sm:inline">{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      {activeSection === 'pricing' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>💰</span> Delivery Pricing Configuration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Set default pricing for different delivery types</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Instant Delivery
              </label>
              <input
                type="text"
                value={settings.pricing?.instant || ''}
                onChange={(e) => setSettings({ ...settings, pricing: { ...settings.pricing, instant: e.target.value } })}
                placeholder="e.g., 70 or Tentative"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter price (GH₵) or text like "Tentative"</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Next-Day Delivery (GH₵)
              </label>
              <input
                type="number"
                value={settings.pricing?.nextDay || 0}
                onChange={(e) => setSettings({ ...settings, pricing: { ...settings.pricing, nextDay: parseFloat(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Delivered within 24 hours</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Weekly Station (GH₵)
              </label>
              <input
                type="number"
                value={settings.pricing?.weeklyStation || 0}
                onChange={(e) => setSettings({ ...settings, pricing: { ...settings.pricing, weeklyStation: parseFloat(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Weekly collection points</p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ pricing: settings.pricing })}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Pricing'}
          </button>
        </div>
      )}

      {/* Auto-Assignment Section */}
      {activeSection === 'auto-assignment' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🤖</span> Auto-Assignment Rules
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Configure automatic delivery assignment behavior</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Enable Auto-Assignment</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically assign deliveries to riders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAssignment?.enabled || false}
                  onChange={(e) => setSettings({ ...settings, autoAssignment: { ...settings.autoAssignment, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ashesi-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Assign to Default Rider</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Use default rider when auto-assigning</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAssignment?.assignToDefaultRider || false}
                  onChange={(e) => setSettings({ ...settings, autoAssignment: { ...settings.autoAssignment, assignToDefaultRider: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ashesi-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Balance Workload</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assign to the least busy rider</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAssignment?.balanceWorkload || false}
                  onChange={(e) => setSettings({ ...settings, autoAssignment: { ...settings.autoAssignment, balanceWorkload: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ashesi-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Max Deliveries Per Rider
              </label>
              <input
                type="number"
                value={settings.autoAssignment?.maxDeliveriesPerRider || 10}
                onChange={(e) => setSettings({ ...settings, autoAssignment: { ...settings.autoAssignment, maxDeliveriesPerRider: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum concurrent deliveries per rider</p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ autoAssignment: settings.autoAssignment })}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Auto-Assignment Rules'}
          </button>
        </div>
      )}

      {/* Notification Templates Section */}
      {activeSection === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📬</span> Notification Templates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Customize message templates for different events</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Delivery Assigned Template
              </label>
              <textarea
                value={settings.notificationTemplates?.deliveryAssigned || ''}
                onChange={(e) => setSettings({ ...settings, notificationTemplates: { ...settings.notificationTemplates, deliveryAssigned: e.target.value } })}
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Use placeholders: {riderName}, {customerName}, {customerContact}, {itemDescription}, {pickupPoint}, {dropoffPoint}, {deliveryType}"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available variables: {'{riderName}'}, {'{customerName}'}, {'{customerContact}'}, {'{itemDescription}'}, {'{pickupPoint}'}, {'{dropoffPoint}'}, {'{deliveryType}'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Delivery Completed Template
              </label>
              <textarea
                value={settings.notificationTemplates?.deliveryCompleted || ''}
                onChange={(e) => setSettings({ ...settings, notificationTemplates: { ...settings.notificationTemplates, deliveryCompleted: e.target.value } })}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Delivery Reminder Template
              </label>
              <textarea
                value={settings.notificationTemplates?.deliveryReminder || ''}
                onChange={(e) => setSettings({ ...settings, notificationTemplates: { ...settings.notificationTemplates, deliveryReminder: e.target.value } })}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => updateSettings({ notificationTemplates: settings.notificationTemplates })}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Templates'}
          </button>
        </div>
      )}

      {/* Business Hours Section */}
      {activeSection === 'business-hours' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🕐</span> Business Hours & Holidays
          </h3>

          <div className="space-y-6">
            {/* Business Hours Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Enable Business Hours</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Restrict operations to business hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.businessHours?.enabled || false}
                  onChange={(e) => setSettings({ ...settings, businessHours: { ...settings.businessHours, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ashesi-primary"></div>
              </label>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Weekly Schedule</h4>
              <div className="space-y-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-24">
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{day}</p>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!settings.businessHours?.schedule?.[day]?.closed}
                        onChange={(e) => setSettings({
                          ...settings,
                          businessHours: {
                            ...settings.businessHours,
                            schedule: {
                              ...settings.businessHours?.schedule,
                              [day]: { ...settings.businessHours?.schedule?.[day], closed: !e.target.checked }
                            }
                          }
                        })}
                        className="rounded text-ashesi-primary focus:ring-ashesi-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Open</span>
                    </label>
                    {!settings.businessHours?.schedule?.[day]?.closed && (
                      <>
                        <input
                          type="time"
                          value={settings.businessHours?.schedule?.[day]?.open || '08:00'}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              schedule: {
                                ...settings.businessHours?.schedule,
                                [day]: { ...settings.businessHours?.schedule?.[day], open: e.target.value }
                              }
                            }
                          })}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <span className="text-gray-600 dark:text-gray-400">to</span>
                        <input
                          type="time"
                          value={settings.businessHours?.schedule?.[day]?.close || '18:00'}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              schedule: {
                                ...settings.businessHours?.schedule,
                                [day]: { ...settings.businessHours?.schedule?.[day], close: e.target.value }
                              }
                            }
                          })}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Holidays */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Holidays</h4>
                <button
                  onClick={() => setShowAddHolidayModal(true)}
                  className="px-4 py-2 bg-ashesi-primary text-white rounded-lg font-semibold hover:bg-ashesi-primary/90 transition-all text-sm"
                >
                  + Add Holiday
                </button>
              </div>
              <div className="space-y-2">
                {settings.businessHours?.holidays?.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    No holidays configured
                  </p>
                ) : (
                  settings.businessHours?.holidays?.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{holiday.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{holiday.date} {holiday.description && `- ${holiday.description}`}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.date)}
                        className="px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ businessHours: settings.businessHours })}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Business Hours'}
          </button>
        </div>
      )}

      {/* Announcements Section */}
      {activeSection === 'announcements' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📢</span> Platform Announcements
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display important messages to users</p>
            </div>
            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="px-4 py-2 bg-ashesi-primary text-white rounded-xl font-semibold hover:bg-ashesi-primary/90 transition-all"
            >
              + Create Announcement
            </button>
          </div>

          <div className="space-y-3">
            {settings.announcements?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                No announcements created yet
              </p>
            ) : (
              settings.announcements?.map((announcement) => (
                <div
                  key={announcement._id}
                  className={`p-4 rounded-xl border-2 ${
                    announcement.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' :
                    announcement.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
                    announcement.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">{announcement.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          announcement.active
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                        }`}>
                          {announcement.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900/20 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {announcement.targetAudience}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{announcement.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {announcement.endDate ? `Expires: ${new Date(announcement.endDate).toLocaleDateString()}` : 'No expiration'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className="ml-4 px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SLA Thresholds Section */}
      {activeSection === 'sla' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⏱️</span> SLA (Service Level Agreement) Thresholds
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Set maximum time limits for delivery status transitions</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pending → Authorized (minutes)
              </label>
              <input
                type="number"
                value={settings.sla?.pendingToAuthorized || 60}
                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, pendingToAuthorized: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Authorized → Assigned (minutes)
              </label>
              <input
                type="number"
                value={settings.sla?.authorizedToAssigned || 30}
                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, authorizedToAssigned: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Assigned → In Progress (minutes)
              </label>
              <input
                type="number"
                value={settings.sla?.assignedToInProgress || 30}
                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, assignedToInProgress: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                In Progress → Delivered (minutes)
              </label>
              <input
                type="number"
                value={settings.sla?.inProgressToDelivered || 120}
                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, inProgressToDelivered: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Instant Delivery Max (minutes)
              </label>
              <input
                type="number"
                value={settings.sla?.instantDeliveryMax || 60}
                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, instantDeliveryMax: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Next-Day Delivery Max (minutes)
              </label>
              <input
                type="number"
                value={settings.sla?.nextDayDeliveryMax || 1440}
                onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, nextDayDeliveryMax: parseInt(e.target.value) } })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Math.floor((settings.sla?.nextDayDeliveryMax || 1440) / 60)} hours</p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ sla: settings.sla })}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save SLA Thresholds'}
          </button>
        </div>
      )}

      {/* General Settings Section */}
      {activeSection === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚙️</span> General Settings
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.general?.platformName || 'Perpway'}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, platformName: e.target.value } })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <input
                  type="text"
                  value={settings.general?.currency || 'GH₵'}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, currency: e.target.value } })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.general?.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={settings.general?.supportPhone || ''}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportPhone: e.target.value } })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable the platform for maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general?.maintenanceMode || false}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, maintenanceMode: e.target.checked } })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ghana-red"></div>
                </label>
              </div>

              {settings.general?.maintenanceMode && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.general?.maintenanceMessage || ''}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, maintenanceMessage: e.target.value } })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Message to display to users during maintenance"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => updateSettings({ general: settings.general })}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save General Settings'}
          </button>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Announcement</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Announcement message"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                <select
                  value={announcementForm.targetAudience}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Users</option>
                  <option value="users">Users Only</option>
                  <option value="riders">Riders Only</option>
                  <option value="drivers">Drivers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={announcementForm.endDate}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, endDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddAnnouncement}
                className="flex-1 px-4 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowAddAnnouncementModal(false);
                  setAnnouncementForm({ title: '', message: '', type: 'info', active: true, targetAudience: 'all', endDate: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Holiday</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Holiday Name</label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Independence Day"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional details"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddHoliday}
                className="flex-1 px-4 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all"
              >
                Add Holiday
              </button>
              <button
                onClick={() => {
                  setShowAddHolidayModal(false);
                  setHolidayForm({ date: '', name: '', description: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={hideConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
    </div>
  );
};

// Shopping Tab Component
const ShoppingTab = ({ shoppingRequests, fetchData, motorRiders, exportToCSV, showSuccess, showError }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const filteredRequests = shoppingRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = !searchTerm ||
      request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.shopLocations?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusColors = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-400', border: 'border-yellow-300' },
    authorized: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-400', border: 'border-blue-300' },
    assigned: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-400', border: 'border-purple-300' },
    purchased: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-800 dark:text-indigo-400', border: 'border-indigo-300' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-400', border: 'border-green-300' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-400', border: 'border-red-300' },
  };

  const handleAuthorizeRequest = async () => {
    if (!selectedRequest || !actualPrice) {
      showError('Please enter the actual price');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/shopping/${selectedRequest._id}/status`, {
        status: 'authorized',
        actualPrice: parseFloat(actualPrice),
        adminNotes: adminNotes
      }, getAuthHeaders());

      showSuccess('Shopping request authorized successfully!');
      setShowAuthorizeModal(false);
      setSelectedRequest(null);
      setActualPrice('');
      setAdminNotes('');
      fetchData();
    } catch (error) {
      console.error('Error authorizing request:', error);
      showError('Failed to authorize request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAssignRider = async () => {
    if (!selectedRiderId || !selectedRequest) {
      showError('Please select a rider');
      return;
    }

    const rider = motorRiders.find(r => r._id === selectedRiderId);

    try {
      await axios.put(`${API_URL}/api/shopping/${selectedRequest._id}/status`, {
        status: 'assigned',
        assignedTo: {
          id: rider._id,
          name: rider.name,
          contact: rider.phone
        }
      }, getAuthHeaders());

      showSuccess(`Shopping request assigned to ${rider.name}!`);
      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedRiderId('');
      fetchData();
    } catch (error) {
      console.error('Error assigning request:', error);
      showError('Failed to assign request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/shopping/${requestId}/status`, {
        status: newStatus
      }, getAuthHeaders());

      showSuccess(`Status updated to ${newStatus}!`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.delete(`${API_URL}/api/shopping/${requestId}`, getAuthHeaders());
      showSuccess('Shopping request deleted!');
      fetchData();
    } catch (error) {
      console.error('Error deleting request:', error);
      showError('Failed to delete request: ' + (error.response?.data?.error || error.message));
    }
  };

  const stats = {
    total: shoppingRequests.length,
    pending: shoppingRequests.filter(r => r.status === 'pending').length,
    authorized: shoppingRequests.filter(r => r.status === 'authorized').length,
    assigned: shoppingRequests.filter(r => r.status === 'assigned').length,
    purchased: shoppingRequests.filter(r => r.status === 'purchased').length,
    delivered: shoppingRequests.filter(r => r.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-gray-500 to-gray-600', icon: '🛒' },
          { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
          { label: 'Authorized', value: stats.authorized, color: 'from-blue-500 to-blue-600', icon: '✅' },
          { label: 'Assigned', value: stats.assigned, color: 'from-purple-500 to-purple-600', icon: '👤' },
          { label: 'Purchased', value: stats.purchased, color: 'from-indigo-500 to-indigo-600', icon: '🛍️' },
          { label: 'Delivered', value: stats.delivered, color: 'from-green-500 to-green-600', icon: '✨' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-lg`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-sm text-white/80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by product, customer, or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="authorized">Authorized</option>
            <option value="assigned">Assigned</option>
            <option value="purchased">Purchased</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              🗂️ Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              📋 Table
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={() => exportToCSV(filteredRequests, 'shopping_requests', ['productName', 'userName', 'userContact', 'shopLocations', 'status', 'actualPrice'])}
            className="px-6 py-3 bg-ghana-green text-white rounded-xl font-semibold hover:bg-ghana-green/90 transition-all shadow-lg whitespace-nowrap"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Requests List/Table */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
            >
              {/* Product Image */}
              <div className="mb-4">
                <img
                  src={request.productImage.startsWith('http') ? request.productImage : `${API_URL}/${request.productImage}`}
                  alt={request.productName}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>

              {/* Product Info */}
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{request.productName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{request.productDescription}</p>

              {/* Status Badge */}
              <div className="mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[request.status]?.bg} ${statusColors[request.status]?.text}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 text-sm mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold">👤 Customer:</span> {request.userName}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold">📞 Contact:</span> {request.userContact}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold">🏪 Shop:</span> {request.shopLocations}
                </p>
                {request.estimatedPrice && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">💵 Est. Price:</span> GH₵{request.estimatedPrice.toFixed(2)}
                  </p>
                )}
                {request.actualPrice && (
                  <p className="text-gray-900 dark:text-white font-bold">
                    💰 Actual: GH₵{request.actualPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {request.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAuthorizeModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
                  >
                    ✅ Authorize
                  </button>
                )}
                {request.status === 'authorized' && (
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAssignModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition-all"
                  >
                    👤 Assign
                  </button>
                )}
                {request.status === 'assigned' && (
                  <button
                    onClick={() => handleUpdateStatus(request._id, 'purchased')}
                    className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-all"
                  >
                    🛍️ Purchased
                  </button>
                )}
                {request.status === 'purchased' && (
                  <button
                    onClick={() => handleUpdateStatus(request._id, 'delivered')}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all"
                  >
                    ✨ Delivered
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRequest(request._id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Shop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <img
                        src={request.productImage.startsWith('http') ? request.productImage : `${API_URL}/${request.productImage}`}
                        alt={request.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{request.productName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{request.productDescription}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{request.userName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{request.userContact}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{request.shopLocations}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {request.estimatedPrice && `Est: GH₵${request.estimatedPrice.toFixed(2)}`}
                      </div>
                      {request.actualPrice && (
                        <div className="font-bold text-gray-900 dark:text-white">
                          GH₵{request.actualPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[request.status]?.bg} ${statusColors[request.status]?.text}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowAuthorizeModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600"
                          >
                            ✅ Authorize
                          </button>
                        )}
                        {request.status === 'authorized' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowAssignModal(true);
                            }}
                            className="px-3 py-1 bg-purple-500 text-white rounded text-xs font-semibold hover:bg-purple-600"
                          >
                            👤 Assign
                          </button>
                        )}
                        {request.status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateStatus(request._id, 'purchased')}
                            className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-semibold hover:bg-indigo-600"
                          >
                            🛍️ Purchased
                          </button>
                        )}
                        {request.status === 'purchased' && (
                          <button
                            onClick={() => handleUpdateStatus(request._id, 'delivered')}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                          >
                            ✨ Delivered
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(request._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No shopping requests found</h3>
          <p className="text-gray-600 dark:text-gray-400">Requests will appear here when customers submit them</p>
        </div>
      )}

      {/* Authorize Modal */}
      <AnimatePresence>
        {showAuthorizeModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authorize Shopping Request</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product</label>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.productName}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Actual Price (GH₵) *</label>
                  <input
                    type="number"
                    value={actualPrice}
                    onChange={(e) => setActualPrice(e.target.value)}
                    placeholder="Enter actual price"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Admin Notes (Optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes for the customer..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAuthorizeRequest}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
                >
                  ✅ Authorize
                </button>
                <button
                  onClick={() => {
                    setShowAuthorizeModal(false);
                    setSelectedRequest(null);
                    setActualPrice('');
                    setAdminNotes('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Rider Modal */}
      <AnimatePresence>
        {showAssignModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assign Rider</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product</label>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.productName}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Rider *</label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a rider...</option>
                    {motorRiders.map((rider) => (
                      <option key={rider._id} value={rider._id}>
                        {rider.name} - {rider.phone} ({rider.motorcycleType || 'No bike info'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAssignRider}
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all"
                >
                  👤 Assign
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRequest(null);
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
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
