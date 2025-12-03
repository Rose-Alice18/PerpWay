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
  const [revealedContacts, setRevealedContacts] = useState(new Set());
  const [filter, setFilter] = useState('all');

  // Fetch drivers from backend
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/drivers');
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
    const driverId = driver._id || driver.id;
    if (revealedContacts.has(driverId)) {
      // Already paid, show contact
      return;
    }
    setSelectedDriver(driver);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (driverId) => {
    setRevealedContacts(new Set([...revealedContacts, driverId]));
    setShowPayment(false);
    setSelectedDriver(null);
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
              Find Your Driver 🚗
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
            Find Your Driver 🚗
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Connect with trusted local drivers for your transport needs.
            Small tip den you go fit see their number! 😄
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
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
        </motion.div>

        {/* Drivers Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredDrivers.map((driver, index) => {
              const isRevealed = revealedContacts.has(driver.id);

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
            onClose={() => {
              setShowPayment(false);
              setSelectedDriver(null);
            }}
            onSuccess={() => handlePaymentSuccess(selectedDriver.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverFinder;
