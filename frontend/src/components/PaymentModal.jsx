import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { PaystackButton } from 'react-paystack';

const PaymentModal = ({ driver, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDisappointed, setShowDisappointed] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [tipAmount, setTipAmount] = useState(2); // Minimum GHS 2 tip
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Get user email (you might want to get this from your auth context)
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  // Paystack configuration
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: tipAmount * 100, // Amount in pesewas
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    currency: 'GHS',
    metadata: {
      custom_fields: [
        {
          display_name: "Service",
          variable_name: "service",
          value: "Perpway - Driver Contact Unlock"
        },
        {
          display_name: "Driver",
          variable_name: "driver_name",
          value: driver.name
        }
      ]
    },
    channels: paymentMethod === 'momo' ? ['mobile_money'] : ['card'],
    label: 'Perpway',
  };

  const handlePaystackSuccess = async (reference) => {
    setProcessing(true);

    try {
      // Verify payment on backend
      const response = await axios.get(
        `${apiUrl}/api/payments/verify/${reference.reference}`
      );

      if (response.data.success && response.data.data.status === 'success') {
        console.log('✅ Payment verified successfully');
        setProcessing(false);
        setShowSuccess(true);

        // Show success animation then close
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      setProcessing(false);
      alert('Payment verification failed. Please contact support with reference: ' + reference.reference);
    }
  };

  const handlePaystackClose = () => {
    console.log('Payment popup closed');
    setProcessing(false);
  };

  const handleMaybeLater = () => {
    setShowDisappointed(true);
    setCountdown(5);
  };

  const handleReallyClose = () => {
    // Start the countdown modal
    setShowDisappointed(false);
    setShowCountdown(true);
    setCountdown(5);
  };

  const handleGoBack = () => {
    setShowDisappointed(false);
    setCountdown(5);
  };

  // Countdown timer - only starts when user confirms skip
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      // Auto close and show contact after 5 seconds
      onSuccess();
    }
  }, [showCountdown, countdown, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Don't allow closing when showing disappointed or countdown modals
        if (!showDisappointed && !showCountdown) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-7xl mb-4"
            >
              ✅
            </motion.div>
            <h3 className="font-display text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Chale, you fit see the contact now! 🎉
            </p>
          </motion.div>
        ) : showCountdown ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            {/* Animated countdown circle */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute inset-0 rounded-full border-8 border-transparent border-t-ashesi-primary border-r-ghana-red border-b-ghana-yellow border-l-ghana-green"
              />

              {/* Inner pulsing circle */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-4 rounded-full bg-gradient-to-br from-ashesi-primary/20 to-ghana-red/20 flex items-center justify-center"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl font-bold bg-gradient-to-r from-ashesi-primary to-ghana-red bg-clip-text text-transparent"
                >
                  {countdown}
                </motion.div>
              </motion.div>
            </div>

            <motion.h3
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Revealing contact info... ⏱️
            </motion.h3>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Thanks for using Perpway! 🚗
            </p>

            {/* Animated dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 rounded-full bg-ashesi-primary"
                />
              ))}
            </div>
          </motion.div>
        ) : showDisappointed ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            {/* Disappointed emoji */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
              className="text-7xl mb-3"
            >
              😭
            </motion.div>

            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ei, Really? 😅
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
              We totally get it! No pressure at all. But just so you know, even GHS 2 keeps the lights on and helps us serve you better. 💡
            </p>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic">
              (You'll still see the contacts in 5 secs if you skip)
            </p>

            {/* Funny disappointed images using emojis */}
            <div className="flex justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                className="text-4xl"
              >
                🥺
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                className="text-4xl"
              >
                💔
              </motion.div>
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                className="text-4xl"
              >
                😔
              </motion.div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoBack}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
              >
                Ohk, I will tip 💛
              </button>
              <button
                type="button"
                onClick={handleReallyClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300"
              >
                No thanks, skip
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-4xl mb-2"
              >
                ✨
              </motion.div>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">
                Help Keep Perpway Running! 🚀
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Our team works hard to keep this platform <span className="font-semibold">free and accessible</span> for everyone. Please consider tipping to unlock <span className="font-semibold text-ashesi-primary dark:text-ghana-yellow">{driver.name}'s</span> contact.
              </p>
            </div>

            {/* Amount */}
            <div className="bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green p-0.5 rounded-xl mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tip Amount (Min. GHS 2)</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTipAmount(Math.max(2, tipAmount - 1))}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-lg transition-all"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="font-display text-3xl font-bold text-ashesi-primary dark:text-ghana-yellow">
                      GHS {tipAmount}.00
                    </span>
                    <span className="text-xl">💛</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTipAmount(tipAmount + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-lg transition-all"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Every cedi counts! 🍬
                </p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-2.5 rounded-lg border-2 font-medium transition-all text-sm ${
                    paymentMethod === 'momo'
                      ? 'border-ghana-yellow bg-ghana-yellow/10 text-ghana-yellow dark:border-ghana-yellow'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  📱 Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border-2 font-medium transition-all text-sm ${
                    paymentMethod === 'card'
                      ? 'border-ashesi-primary bg-ashesi-primary/10 text-ashesi-primary dark:border-ashesi-primary'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  💳 Card
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">
                {paymentMethod === 'momo'
                  ? '👉 Click "Pay Now" then enter your Mobile Money number'
                  : '👉 Click "Pay Now" then enter your card details'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMaybeLater}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300"
                disabled={processing}
              >
                Maybe Later
              </button>
              <PaystackButton
                {...paystackConfig}
                text={processing ? 'Processing...' : 'Pay Now'}
                onSuccess={handlePaystackSuccess}
                onClose={handlePaystackClose}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ashesi-primary to-ghana-red text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={processing}
              />
            </div>

            {/* Support Note */}
            <div className="mt-4 p-3 bg-gradient-to-r from-ashesi-primary/10 to-ghana-yellow/10 rounded-lg border border-ghana-yellow/20">
              <p className="text-center text-xs text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Why tip?</span> Your support keeps Perpway free and running for all students. Thank you! 💛
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
