import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SignIn = () => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check for admin credentials
    if (email === 'admin@perpway.com' && password === 'perpway2025') {
      localStorage.setItem('userAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authTime', Date.now().toString());
      navigate('/admin/dashboard');
      return;
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('perpwayUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('userAuthenticated', 'true');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('authTime', Date.now().toString());
      setSuccess('Welcome back! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('perpwayUsers') || '[]');

    // Check if user already exists
    if (users.some(u => u.email === email)) {
      setError('An account with this email already exists.');
      return;
    }

    // Add new user
    users.push({ name, email, password, createdAt: new Date().toISOString() });
    localStorage.setItem('perpwayUsers', JSON.stringify(users));

    // Auto sign in
    localStorage.setItem('userAuthenticated', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    localStorage.setItem('authTime', Date.now().toString());

    setSuccess('Account created successfully! Redirecting...');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-red/10 via-ghana-yellow/20 to-ghana-green/10 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="flex flex-col items-center gap-2">
            <img
              src="/geesh.png"
              alt="Perpway Logo"
              className="w-20 h-20 object-contain rounded-xl shadow-lg"
            />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green bg-clip-text text-transparent">
              Perpway
            </span>
          </div>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex bg-gray-100 rounded-xl p-1 mb-6"
        >
          <button
            onClick={() => {
              setActiveTab('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-ashesi-primary shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-ghana-red shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-gray-600 text-sm">
            {activeTab === 'signin'
              ? 'Sign in to track your activities and orders'
              : 'Join Perpway to get started'}
          </p>
        </motion.div>

        {/* Forms */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {activeTab === 'signin' ? (
            // Sign In Form
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2"
                >
                  <span className="text-xl">⚠️</span>
                  <p className="text-red-800 text-sm font-semibold">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2"
                >
                  <span className="text-xl">✅</span>
                  <p className="text-green-800 text-sm font-semibold">{success}</p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Sign In 🚀
              </motion.button>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2"
                >
                  <span className="text-xl">⚠️</span>
                  <p className="text-red-800 text-sm font-semibold">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2"
                >
                  <span className="text-xl">✅</span>
                  <p className="text-green-800 text-sm font-semibold">{success}</p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Create Account 🎉
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            By continuing, you agree to Perpway's Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignIn;
