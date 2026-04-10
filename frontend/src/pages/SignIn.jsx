import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const SignIn = () => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [view, setView] = useState('main'); // 'main' | 'forgot' | 'forgot-sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const endpoint = email === 'admin@perpway.com'
        ? `${apiUrl}/api/auth/admin/login`
        : `${apiUrl}/api/auth/signin`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userAuthenticated', 'true');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('authTime', Date.now().toString());

        setSuccess(data.user.role === 'admin' ? 'Admin login successful! Redirecting...' : 'Welcome back! Redirecting to your dashboard...');

        setTimeout(() => {
          navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }, 1000);
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to connect to server. Please try again.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userAuthenticated', 'true');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('authTime', Date.now().toString());

        setSuccess('Account created successfully! Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to connect to server. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setView('forgot-sent');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setView('main');
    setError('');
    setSuccess('');
  };

  const GoogleButton = ({ label }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg hover:border-gray-400 transition-all flex items-center justify-center gap-3"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </motion.button>
  );

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

        <AnimatePresence mode="wait">

          {/* ── Forgot Password: enter email ── */}
          {view === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔐</div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                    required
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <p className="text-red-800 text-sm font-semibold">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link 📧'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setView('main'); setError(''); }}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
                >
                  ← Back to Sign In
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Forgot Password: link sent ── */}
          {view === 'forgot-sent' && (
            <motion.div
              key="forgot-sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <div className="text-6xl mb-4">📧</div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
              <p className="text-gray-600 mb-2">
                If <strong>{forgotEmail}</strong> has an account, we've sent a password reset link.
              </p>
              <p className="text-gray-500 text-sm mb-8">The link expires in 1 hour. Check your spam folder if you don't see it.</p>
              <button
                onClick={() => { setView('main'); setForgotEmail(''); }}
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Back to Sign In
              </button>
            </motion.div>
          )}

          {/* ── Main Sign In / Sign Up ── */}
          {view === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Tab Selector */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => switchTab('signin')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === 'signin' ? 'bg-white text-ashesi-primary shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('signup')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === 'signup' ? 'bg-white text-ghana-red shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  {activeTab === 'signin' ? 'Welcome Back!' : 'Create Account'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'signin'
                    ? 'Sign in to track your activities and orders'
                    : 'Join Perpway to get started'}
                </p>
              </div>

              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setForgotEmail(email); setError(''); }}
                        className="text-xs text-ghana-red hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <p className="text-red-800 text-sm font-semibold">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2">
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

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                  </div>

                  <GoogleButton label="Sign in with Google" />
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ghana-green transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                        aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showSignUpPassword} />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <p className="text-red-800 text-sm font-semibold">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2">
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

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                  </div>

                  <GoogleButton label="Sign up with Google" />
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Terms */}
        {view === 'main' && (
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
        )}
      </motion.div>
    </div>
  );
};

export default SignIn;
