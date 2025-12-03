import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Delivery = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    itemDescription: '',
    pickupPoint: '',
    dropoffPoint: '',
    deliveryType: 'instant',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const deliveryTypes = [
    {
      id: 'instant',
      name: 'Instant Delivery',
      icon: '⚡',
      description: 'Same day delivery (2-4 hours)',
      price: 'GHS 15-25',
    },
    {
      id: 'next-day',
      name: 'Next-Day Delivery',
      icon: '📅',
      description: 'Delivered tomorrow',
      price: 'GHS 10-15',
    },
    {
      id: 'weekly-station',
      name: 'Weekly Station Pickup',
      icon: '📦',
      description: 'Pickup from campus station weekly',
      price: 'GHS 5-8',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (formData.contact && !/^0\d{9}$/.test(formData.contact.replace(/\s/g, ''))) {
      newErrors.contact = 'Enter valid Ghana number (0XX XXX XXXX)';
    }
    if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Item description is required';
    if (!formData.pickupPoint.trim()) newErrors.pickupPoint = 'Pickup point is required';
    if (!formData.dropoffPoint.trim()) newErrors.dropoffPoint = 'Drop-off point is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Send delivery request to backend
      await axios.post('http://localhost:5000/api/delivery/request', formData);

      // Show success animation
      setTimeout(() => {
        setSubmitting(false);
        setShowSuccess(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            name: '',
            contact: '',
            itemDescription: '',
            pickupPoint: '',
            dropoffPoint: '',
            deliveryType: 'instant',
            notes: '',
          });
          setFocusedField(null);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Delivery request error:', error);
      setSubmitting(false);
      alert('Failed to submit request. Please try again!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block text-6xl mb-4"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            📦
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Delivery Service
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Need something delivered to campus? No wahala! Fill the form below
            and we go sort you out! 🚚
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Types */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <h2 className="font-display text-xl font-bold mb-4 dark:text-white">
              Choose Delivery Type
            </h2>
            <div className="space-y-3">
              {deliveryTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.03,
                    x: 5,
                    transition: { type: 'spring', stiffness: 400, damping: 17 }
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData({ ...formData, deliveryType: type.id })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    formData.deliveryType === type.id
                      ? 'border-ashesi-primary bg-ashesi-primary/5 dark:bg-ashesi-primary/10 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Selection indicator */}
                  <AnimatePresence>
                    {formData.deliveryType === type.id && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        className="absolute left-0 top-0 bottom-0 w-1 bg-ashesi-primary"
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex items-start">
                    <motion.div
                      className="text-3xl mr-3"
                      animate={{
                        rotate: formData.deliveryType === type.id ? [0, -10, 10, 0] : 0,
                        scale: formData.deliveryType === type.id ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {type.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{type.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{type.description}</p>
                      <p className="text-sm font-semibold text-ashesi-primary">
                        {type.price}
                      </p>
                    </div>

                    {/* Checkmark for selected */}
                    <AnimatePresence>
                      {formData.deliveryType === type.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="text-2xl text-ashesi-primary"
                        >
                          ✓
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-ghana-yellow/10 dark:bg-ghana-yellow/20 border-2 border-ghana-yellow rounded-xl p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="mr-2">💡</span> Pro Tip
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Weekly station pickup dey save money pass! If e no dey urgent,
                e fit wait small. Your parcel go dey safe! 📦
              </p>
            </div>
          </motion.div>

          {/* Delivery Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <h2 className="font-display text-xl font-bold mb-6 dark:text-white">
                Delivery Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <motion.div
                      animate={{
                        scale: focusedField === 'name' ? 1.02 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Kwame Mensah"
                        className={`input-field ${
                          errors.name ? 'border-red-500 dark:border-red-500' : ''
                        } ${
                          focusedField === 'name' ? 'ring-2 ring-ashesi-primary/50' : ''
                        }`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-xs mt-1 flex items-center"
                        >
                          <span className="mr-1">⚠️</span>
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number *
                    </label>
                    <motion.div
                      animate={{
                        scale: focusedField === 'contact' ? 1.02 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('contact')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="0XX XXX XXXX"
                        className={`input-field ${
                          errors.contact ? 'border-red-500 dark:border-red-500' : ''
                        } ${
                          focusedField === 'contact' ? 'ring-2 ring-ashesi-primary/50' : ''
                        }`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {errors.contact && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-xs mt-1 flex items-center"
                        >
                          <span className="mr-1">⚠️</span>
                          {errors.contact}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Item Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Item Description *
                  </label>
                  <motion.div
                    animate={{
                      scale: focusedField === 'itemDescription' ? 1.02 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <textarea
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('itemDescription')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Describe what you want delivered (e.g., Books, Food, Electronics)"
                      className={`input-field min-h-[100px] resize-none ${
                        errors.itemDescription ? 'border-red-500 dark:border-red-500' : ''
                      } ${
                        focusedField === 'itemDescription' ? 'ring-2 ring-ashesi-primary/50' : ''
                      }`}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.itemDescription && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-xs mt-1 flex items-center"
                      >
                        <span className="mr-1">⚠️</span>
                        {errors.itemDescription}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Point *
                    </label>
                    <motion.div
                      animate={{
                        scale: focusedField === 'pickupPoint' ? 1.02 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <input
                        type="text"
                        name="pickupPoint"
                        value={formData.pickupPoint}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('pickupPoint')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g., Madina Market"
                        className={`input-field ${
                          errors.pickupPoint ? 'border-red-500 dark:border-red-500' : ''
                        } ${
                          focusedField === 'pickupPoint' ? 'ring-2 ring-ashesi-primary/50' : ''
                        }`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {errors.pickupPoint && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-xs mt-1 flex items-center"
                        >
                          <span className="mr-1">⚠️</span>
                          {errors.pickupPoint}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Drop-off Point *
                    </label>
                    <motion.div
                      animate={{
                        scale: focusedField === 'dropoffPoint' ? 1.02 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <input
                        type="text"
                        name="dropoffPoint"
                        value={formData.dropoffPoint}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('dropoffPoint')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g., Ashesi Campus - Volta Hall"
                        className={`input-field ${
                          errors.dropoffPoint ? 'border-red-500 dark:border-red-500' : ''
                        } ${
                          focusedField === 'dropoffPoint' ? 'ring-2 ring-ashesi-primary/50' : ''
                        }`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {errors.dropoffPoint && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-xs mt-1 flex items-center"
                        >
                          <span className="mr-1">⚠️</span>
                          {errors.dropoffPoint}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Additional Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <motion.div
                    animate={{
                      scale: focusedField === 'notes' ? 1.02 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('notes')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Any special instructions? E.g., 'Call me when you reach gate'"
                      className={`input-field min-h-[80px] resize-none ${
                        focusedField === 'notes' ? 'ring-2 ring-ashesi-primary/50' : ''
                      }`}
                    />
                  </motion.div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{
                    scale: 1.03,
                    transition: { type: 'spring', stiffness: 400, damping: 17 }
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  disabled={submitting}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green opacity-0 group-hover:opacity-20"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  <span className="relative z-10">
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <motion.svg
                          className="h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </motion.svg>
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Submitting Request...
                        </motion.span>
                      </span>
                    ) : (
                      'Submit Delivery Request 🚀'
                    )}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-ghana-yellow/10 dark:from-green-900/20 dark:to-ghana-yellow/5"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.3, 1],
                  rotate: [0, 360, 360],
                }}
                transition={{
                  duration: 0.8,
                  times: [0, 0.6, 1],
                  ease: "easeOut"
                }}
                className="text-7xl mb-4 relative z-10"
              >
                ✅
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-3xl font-bold text-green-600 dark:text-green-400 mb-3 relative z-10"
              >
                Request Received!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-700 dark:text-gray-300 mb-2 relative z-10"
              >
                Your parcel dey on road already! 🚚💨
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 dark:text-gray-400 relative z-10"
              >
                We go contact you shortly to confirm the delivery details.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 relative z-10"
              >
                <p className="text-sm text-green-800 dark:text-green-300 font-semibold">
                  Check your phone for updates! 📱
                </p>
              </motion.div>

              {/* Close hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1 }}
                className="text-xs text-gray-500 dark:text-gray-400 mt-4 relative z-10"
              >
                Click anywhere to close
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Delivery;
