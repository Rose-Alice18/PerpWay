import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple password check - you can change this password
    const ADMIN_PASSWORD = 'ashway2025'; // Change this to your desired password

    if (password === ADMIN_PASSWORD) {
      // Store authentication in localStorage
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminAuthTime', Date.now().toString());
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-red/20 via-ghana-yellow/20 to-ghana-green/20 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full border-4 border-ghana-green"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src="/geesh.png"
                alt="Perpway Logo"
                className="w-20 h-20 object-contain rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-ghana-red to-ghana-yellow rounded-full flex items-center justify-center shadow-md">
                <span className="text-lg">🔒</span>
              </div>
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green bg-clip-text text-transparent">
              Perpway Admin
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Admin Access
          </h1>
          <p className="text-gray-600">
            Enter password to access the admin dashboard
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
              required
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2"
            >
              <span className="text-2xl">⚠️</span>
              <p className="text-red-800 text-sm font-semibold">{error}</p>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-ghana-green to-ghana-green/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Access Dashboard 🚀
          </motion.button>
        </motion.form>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            This area is restricted to authorized administrators only.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
