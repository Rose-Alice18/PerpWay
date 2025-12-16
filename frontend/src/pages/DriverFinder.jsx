import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DriverFinder = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Check if contacts were previously revealed (within last 24 hours)
  const getInitialRevealedState = () => {
    try {
      const stored = localStorage.getItem('perpway_contacts_revealed');
      if (stored) {
        const { revealed, timestamp } = JSON.parse(stored);
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const now = Date.now();

        // If revealed and within 24 hours, keep them revealed
        if (revealed && (now - timestamp) < twentyFourHours) {
          return new Set(['all']);
        }
      }
    } catch (error) {
      console.error('Error reading revealed contacts from localStorage:', error);
    }
    return new Set();
  };

  const [revealedContacts, setRevealedContacts] = useState(getInitialRevealedState)

  // Fetch drivers from backend
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/drivers`);
        // Normalize MongoDB _id to id for frontend compatibility
        const normalizedDrivers = response.data.map(driver => ({
          ...driver,
          id: driver._id || driver.id,
        }));
        setDrivers(normalizedDrivers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleViewContact = (driver) => {
    // If all contacts are already revealed, do nothing
    if (revealedContacts.has('all')) {
      return;
    }
    setSelectedDriver(driver);
    setShowPayment(true);
  };

  const saveRevealedToLocalStorage = () => {
    try {
      localStorage.setItem('perpway_contacts_revealed', JSON.stringify({
        revealed: true,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const handlePaymentSuccess = () => {
    // Reveal ALL contacts immediately when user tips
    setRevealedContacts(new Set(['all']));
    saveRevealedToLocalStorage();
    setShowPayment(false);
    setSelectedDriver(null);
  };

  const handlePaymentClose = () => {
    // When user closes without paying, reveal contacts after a delay (like OceanofPDF)
    setShowPayment(false);
    setSelectedDriver(null);

    // Reveal all contacts after 3 seconds
    setTimeout(() => {
      setRevealedContacts(new Set(['all']));
      saveRevealedToLocalStorage();
    }, 3000);
  };

  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'all') return true;
    return driver.availability === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              Find A Driver 🚗
            </h1>
            <motion.div
              className="inline-block text-6xl mb-4"
              animate={{
                rotate: [0, 10, -10, 10, 0],
                y: [0, -10, 0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🚗
            </motion.div>
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading drivers...</p>
          </motion.div>
          <LoadingSkeleton type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Find A Driver 🚗
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Connect with trusted local drivers for your transport needs.
            Small tip den you will see all drivers' number! 😄
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['all', 'available', 'busy', 'offline'].map((status) => (
              <motion.button
                key={status}
                onClick={() => setFilter(status)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  filter === status
                    ? 'bg-ashesi-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex justify-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 w-fit mx-auto shadow-md">
            <motion.button
              onClick={() => setViewMode('cards')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'cards'
                  ? 'bg-ashesi-primary text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>📁</span> Cards
            </motion.button>
            <motion.button
              onClick={() => setViewMode('table')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-ashesi-primary text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>📋</span> Table
            </motion.button>
          </div>
        </motion.div>

        {/* Cards View */}
        {viewMode === 'cards' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredDrivers.map((driver, index) => {
                const isRevealed = revealedContacts.has('all');

                return (
                  <motion.div
                    key={driver.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                      delay: index * 0.08
                    }}
                    whileHover={{
                      y: -12,
                      scale: 1.02,
                      rotate: [0, 1, -1, 0],
                      transition: { type: 'spring', stiffness: 300, damping: 20 }
                    }}
                    className="card relative overflow-hidden group"
                  >
                {/* Status Badge */}
                <motion.div
                  className="absolute top-4 right-4 z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.08 + 0.3, type: 'spring' }}
                >
                  <motion.span
                    animate={{
                      scale: driver.availability === 'available' ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: driver.availability === 'available' ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      driver.availability === 'available'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : driver.availability === 'busy'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {driver.availability.toUpperCase()}
                  </motion.span>
                </motion.div>

                {/* Driver Photo */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-ghana-red via-ghana-yellow to-ghana-green p-1"
                  whileHover={{
                    rotate: [0, -5, 5, -5, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-4xl overflow-hidden">
                    <motion.span
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {driver.photo || '👨‍✈️'}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Driver Info */}
                <h3 className="font-display text-xl font-bold text-center mb-2 dark:text-white">
                  {driver.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    <span className="font-semibold">Car:</span> {driver.carType}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    <span className="font-semibold">Location:</span> {driver.location}
                  </p>
                  {driver.rating && (
                    <p className="text-center text-yellow-500 font-semibold">
                      ⭐ {driver.rating}/5.0
                    </p>
                  )}
                </div>

                {/* Contact Button */}
                {isRevealed ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateX: -90 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-4 text-center"
                  >
                    <p className="text-green-800 dark:text-green-300 font-semibold mb-2">Contact Info:</p>
                    <motion.a
                      href={`tel:${driver.contact}`}
                      className="text-lg font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 block"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📞 {driver.contact}
                    </motion.a>
                    {driver.whatsapp && (
                      <motion.a
                        href={`https://wa.me/${driver.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        💬 WhatsApp
                      </motion.a>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => handleViewContact(driver)}
                    className="w-full btn-primary relative overflow-hidden"
                    disabled={driver.availability === 'offline'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">View Contact</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green opacity-0 group-hover:opacity-30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                      Small tip den you go fit see number! 💰
                    </div>
                  </motion.button>
                )}

                {/* Quick Info */}
                {driver.note && (
                  <p className="mt-3 text-sm text-gray-500 italic text-center">
                    "{driver.note}"
                  </p>
                )}
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Mobile: Card-like rows */}
            <div className="block md:hidden">
              {filteredDrivers.map((driver, index) => {
                const isRevealed = revealedContacts.has('all');
                return (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{driver.photo || '👨‍✈️'}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{driver.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{driver.carType}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          driver.availability === 'available'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : driver.availability === 'busy'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {driver.availability}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Location:</span> {driver.location}
                      </p>
                      {driver.rating && (
                        <p className="text-yellow-500 font-semibold">⭐ {driver.rating}/5.0</p>
                      )}
                    </div>
                    {isRevealed ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 rounded-lg p-3">
                        <p className="text-green-800 dark:text-green-300 font-semibold text-sm mb-1">Contact:</p>
                        <a href={`tel:${driver.contact}`} className="text-green-600 dark:text-green-400 font-bold block">
                          📞 {driver.contact}
                        </a>
                        {driver.whatsapp && (
                          <a
                            href={`https://wa.me/${driver.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 font-semibold text-sm mt-1 block"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleViewContact(driver)}
                        disabled={driver.availability === 'offline'}
                        className="w-full btn-primary text-sm py-2"
                      >
                        View Contact
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Car Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDrivers.map((driver, index) => {
                    const isRevealed = revealedContacts.has('all');
                    return (
                      <motion.tr
                        key={driver.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{driver.photo || '👨‍✈️'}</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{driver.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {driver.carType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {driver.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {driver.rating ? (
                            <span className="text-yellow-500 font-semibold">⭐ {driver.rating}/5.0</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              driver.availability === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : driver.availability === 'busy'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {driver.availability}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isRevealed ? (
                            <div className="space-y-1">
                              <a
                                href={`tel:${driver.contact}`}
                                className="text-green-600 dark:text-green-400 font-bold hover:underline block"
                              >
                                📞 {driver.contact}
                              </a>
                              {driver.whatsapp && (
                                <a
                                  href={`https://wa.me/${driver.whatsapp}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 dark:text-green-400 font-semibold text-sm hover:underline block"
                                >
                                  💬 WhatsApp
                                </a>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleViewContact(driver)}
                              disabled={driver.availability === 'offline'}
                              className="px-4 py-2 bg-ashesi-primary text-white rounded-lg font-semibold hover:bg-ashesi-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              View Contact
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {filteredDrivers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No drivers found
            </h3>
            <p className="text-gray-600">
              Try changing your filter or check back later!
            </p>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && selectedDriver && (
          <PaymentModal
            driver={selectedDriver}
            onClose={handlePaymentClose}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>

      {/* Floating Dashboard Button */}
    </div>
  );
};

export default DriverFinder;
