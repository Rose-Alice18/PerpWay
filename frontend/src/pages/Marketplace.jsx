import React from 'react';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const businesses = [
    {
      id: 1,
      name: 'Lettered Petal',
      tagline: 'Reviving Vintage Handwritten Letters',
      description: 'An artist atelier dedicated to preserving the art of handwritten correspondence and vintage letters.',
      icon: '✉️',
      color: 'from-pink-500 to-rose-600',
      status: 'Coming Soon'
    },
    // You can add more businesses here in the future
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-ashesi-primary to-ghana-red bg-clip-text text-transparent">
              Perpway Marketplace
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our family of businesses - More amazing services coming your way!
          </p>
        </motion.div>

        {/* Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {businesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="relative group"
            >
              <div className="card p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)`,
                  }}></div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg">
                    {business.status}
                  </span>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-24 h-24 mb-6 rounded-full bg-gradient-to-br ${business.color} flex items-center justify-center shadow-2xl`}
                >
                  <span className="text-5xl">{business.icon}</span>
                </motion.div>

                {/* Content */}
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">
                  {business.name}
                </h2>

                <p className="text-lg font-semibold text-transparent bg-gradient-to-r from-ashesi-primary to-ghana-red bg-clip-text mb-4">
                  {business.tagline}
                </p>

                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  {business.description}
                </p>

                {/* Coming Soon Animation */}
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-center"
                >
                  <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${business.color} text-white font-bold text-lg shadow-lg`}>
                    <span className="flex items-center gap-2">
                      <span>✨</span>
                      <span>Launching Soon</span>
                      <span>✨</span>
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Placeholder for Future Business */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: businesses.length * 0.2 }}
            className="card p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <span className="text-5xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-3">
              More Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              We're always growing and adding new businesses to serve you better!
            </p>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 max-w-2xl mx-auto"
        >
          <div className="card p-8 text-center bg-gradient-to-r from-ashesi-primary to-ghana-red text-white">
            <h3 className="text-2xl font-bold mb-4">Stay Updated!</h3>
            <p className="mb-6">
              Be the first to know when Lettered Petal and our other businesses launch!
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-ashesi-primary rounded-xl font-bold hover:shadow-lg transition-all">
                Notify Me
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Marketplace;
