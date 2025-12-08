import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ServiceHub = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [revealedContacts, setRevealedContacts] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All Services', icon: '🛍️' },
    { id: 'fruit', name: 'Fruit Vendors', icon: '🍎' },
    { id: 'tailor', name: 'Tailors', icon: '👗' },
    { id: 'barber', name: 'Barbers', icon: '💈' },
    { id: 'food', name: 'Food Vendors', icon: '🍲' },
  ];

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/vendors`);
        setVendors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleViewContact = (vendor) => {
    if (revealedContacts.has(vendor.id)) {
      return;
    }
    setSelectedVendor(vendor);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (vendorId) => {
    setRevealedContacts(new Set([...revealedContacts, vendorId]));
    setShowPayment(false);
    setSelectedVendor(null);
  };

  const filteredVendors = vendors.filter((vendor) => {
    if (selectedCategory === 'all') return true;
    return vendor.category === selectedCategory;
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
              Local Service Hub 🛍️
            </h1>
            <motion.div
              className="inline-block text-6xl mb-4"
              animate={{
                rotate: [0, -15, 15, -15, 0],
                scale: [1, 1.1, 1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🛍️
            </motion.div>
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading services...</p>
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
            Local Service Hub 🛍️
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Find the best local service providers around Berekuso.
            Barbers, tailors, food vendors - we get all of them here! 💯
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-ashesi-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Shopping Service Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => navigate('/shopping-request')}
            className="relative overflow-hidden cursor-pointer bg-gradient-to-br from-ashesi-primary via-ghana-red to-ghana-yellow rounded-3xl p-8 shadow-2xl"
          >
            {/* Decorative Background Elements */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"
            />
            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full"
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-7xl md:text-8xl"
              >
                🛒
              </motion.div>
              <div className="flex-1 text-white text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black mb-3">Shopping Service</h2>
                <p className="text-lg md:text-xl text-white/90 mb-4">
                  Need something from town but don't want to go yourself? We'll get it for you!
                </p>
                <p className="text-sm md:text-base text-white/80 mb-6">
                  Chargers, body lotion, perfume, slippers, and more - just send us an image and tell us where to find it!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-ashesi-primary px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
                >
                  <span>📦</span> Request Shopping Service
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Vendors Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredVendors.map((vendor, index) => {
              const isRevealed = revealedContacts.has(vendor.id);

              return (
                <motion.div
                  key={vendor.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9, rotateY: -15 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                    delay: index * 0.08
                  }}
                  whileHover={{
                    y: -15,
                    scale: 1.03,
                    rotateZ: [0, 1, -1, 0],
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                  }}
                  className="card relative overflow-hidden group cursor-pointer"
                >
                {/* Category Badge */}
                <motion.div
                  className="absolute top-4 right-4 z-10"
                  initial={{ scale: 0, x: 50 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: index * 0.08 + 0.2, type: 'spring', stiffness: 200 }}
                >
                  <motion.span
                    className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white shadow-lg"
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  >
                    {categories.find((c) => c.id === vendor.category)?.icon}{' '}
                    {vendor.category.toUpperCase()}
                  </motion.span>
                </motion.div>

                {/* Vendor Image/Icon */}
                <motion.div
                  className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative group/img"
                  whileHover={{ scale: 1.02 }}
                >
                  {vendor.image ? (
                    <motion.img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                    />
                  ) : (
                    <motion.div
                      className="text-6xl"
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    >
                      {categories.find((c) => c.id === vendor.category)?.icon || '🏪'}
                    </motion.div>
                  )}
                </motion.div>

                {/* Vendor Info */}
                <h3 className="font-display text-xl font-bold mb-2 dark:text-white">
                  {vendor.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 dark:text-gray-300 flex items-center">
                    <span className="mr-2">📍</span>
                    <span className="font-semibold">{vendor.location}</span>
                  </p>

                  {vendor.hours && (
                    <p className="text-gray-600 dark:text-gray-300 flex items-center">
                      <span className="mr-2">🕒</span>
                      <span>{vendor.hours}</span>
                    </p>
                  )}

                  {vendor.speciality && (
                    <p className="text-gray-600 dark:text-gray-300 flex items-center">
                      <span className="mr-2">⭐</span>
                      <span className="italic">"{vendor.speciality}"</span>
                    </p>
                  )}

                  {vendor.priceRange && (
                    <p className="text-gray-600 dark:text-gray-300 flex items-center">
                      <span className="mr-2">💰</span>
                      <span className="font-semibold">{vendor.priceRange}</span>
                    </p>
                  )}

                  {vendor.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-2">
                        {'⭐'.repeat(Math.floor(vendor.rating))}
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {vendor.rating}/5.0
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {vendor.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {vendor.description}
                  </p>
                )}

                {/* Contact Button */}
                {isRevealed ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-50 border-2 border-green-500 rounded-lg p-4"
                  >
                    <p className="text-green-800 font-semibold mb-2 text-center">
                      Contact Info:
                    </p>
                    <a
                      href={`tel:${vendor.contact}`}
                      className="block text-center text-green-600 hover:text-green-700 font-bold mb-2"
                    >
                      📞 {vendor.contact}
                    </a>
                    {vendor.whatsapp && (
                      <a
                        href={`https://wa.me/${vendor.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-green-600 hover:text-green-700 font-semibold"
                      >
                        💬 WhatsApp Chat
                      </a>
                    )}
                  </motion.div>
                ) : (
                  <button
                    onClick={() => handleViewContact(vendor)}
                    className="w-full btn-primary relative group"
                  >
                    <span>View Contact</span>
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                      Tip small to unlock! 💰
                    </div>
                  </button>
                )}

                {/* Recommend Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-3 py-2 border-2 border-ghana-yellow text-ghana-yellow dark:text-ghana-yellow font-semibold rounded-lg hover:bg-ghana-yellow hover:text-white dark:hover:text-gray-900 transition-all duration-300"
                >
                  👍 Recommend ({vendor.recommendations || 0})
                </motion.button>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredVendors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              No vendors found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try changing your category or check back later!
            </p>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && selectedVendor && (
          <PaymentModal
            driver={selectedVendor}
            onClose={() => {
              setShowPayment(false);
              setSelectedVendor(null);
            }}
            onSuccess={() => handlePaymentSuccess(selectedVendor.id)}
          />
        )}
      </AnimatePresence>

      {/* Floating Dashboard Button */}
    </div>
  );
};

export default ServiceHub;
