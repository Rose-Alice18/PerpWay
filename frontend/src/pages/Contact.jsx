import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Us',
      value: 'support@perpway.com',
      description: 'We dey reply within 24 hours!',
    },
    {
      icon: '📱',
      title: 'Call Us',
      value: '+233 XX XXX XXXX',
      description: 'Monday - Friday, 8am - 6pm',
    },
    {
      icon: '📍',
      title: 'Visit Us',
      value: 'Campus Location',
      description: 'Find us on campus!',
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      value: '+233 XX XXX XXXX',
      description: 'Quick responses, all day!',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

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
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

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
      // Send contact form to backend
      await axios.post('http://localhost:5000/api/contact/submit', formData);

      setShowSuccess(true);
      setSubmitting(false);

      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        setFocusedField(null);
      }, 3000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitting(false);
      alert('Failed to send message. Please try again!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-4xl mx-auto"
      >
        <motion.div
          className="inline-block text-7xl mb-6"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          📧
        </motion.div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
          Get In Touch
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          We dey here to help you! Whether you get question, feedback, or just want to say hello,
          feel free to reach out. We go respond quick! 💬
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="card text-center"
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              >
                {info.icon}
              </motion.div>
              <h3 className="font-bold text-lg mb-2 dark:text-white">{info.title}</h3>
              <p className="text-ashesi-primary font-semibold mb-2">{info.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{info.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="font-display text-2xl font-bold mb-6 dark:text-white">
              Send Us A Message 📩
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
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

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <motion.div
                  animate={{
                    scale: focusedField === 'email' ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="kwame@example.com"
                    className={`input-field ${
                      errors.email ? 'border-red-500 dark:border-red-500' : ''
                    } ${
                      focusedField === 'email' ? 'ring-2 ring-ashesi-primary/50' : ''
                    }`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1 flex items-center"
                    >
                      <span className="mr-1">⚠️</span>
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Subject */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <motion.div
                  animate={{
                    scale: focusedField === 'subject' ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="What's on your mind?"
                    className={`input-field ${
                      errors.subject ? 'border-red-500 dark:border-red-500' : ''
                    } ${
                      focusedField === 'subject' ? 'ring-2 ring-ashesi-primary/50' : ''
                    }`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.subject && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1 flex items-center"
                    >
                      <span className="mr-1">⚠️</span>
                      {errors.subject}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Message *
                </label>
                <motion.div
                  animate={{
                    scale: focusedField === 'message' ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Tell us more..."
                    rows="6"
                    className={`input-field min-h-[150px] resize-none ${
                      errors.message ? 'border-red-500 dark:border-red-500' : ''
                    } ${
                      focusedField === 'message' ? 'ring-2 ring-ashesi-primary/50' : ''
                    }`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1 flex items-center"
                    >
                      <span className="mr-1">⚠️</span>
                      {errors.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{
                  scale: 1.03,
                  transition: { type: 'spring', stiffness: 400, damping: 17 }
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
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
                    Sending Message...
                  </span>
                ) : (
                  'Send Message 🚀'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Quick Response */}
            <div className="card bg-gradient-to-br from-ashesi-primary to-ghana-red text-white">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⚡
              </motion.div>
              <h3 className="font-display text-2xl font-bold mb-3">Quick Response</h3>
              <p className="opacity-90">
                We dey usually respond within 24 hours! For urgent matters, call or WhatsApp us directly.
              </p>
            </div>

            {/* FAQ Link */}
            <div className="card">
              <motion.div
                className="text-5xl mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ❓
              </motion.div>
              <h3 className="font-display text-xl font-bold mb-3 dark:text-white">Have Questions?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Check our FAQ page for quick answers to common questions!
              </p>
              <a
                href="/faq"
                className="inline-block text-ashesi-primary hover:text-ghana-red font-semibold transition-colors duration-300"
              >
                Visit FAQ →
              </a>
            </div>

            {/* Operating Hours */}
            <div className="card">
              <motion.div
                className="text-5xl mb-4"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                🕐
              </motion.div>
              <h3 className="font-display text-xl font-bold mb-3 dark:text-white">Operating Hours</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-semibold">8am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-semibold">9am - 3pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-semibold">Closed</span>
                </div>
              </div>
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
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
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
                className="text-7xl mb-4"
              >
                ✅
              </motion.div>

              <h3 className="font-display text-3xl font-bold text-green-600 dark:text-green-400 mb-3">
                Message Sent!
              </h3>

              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Your message don reach us! 📧
              </p>

              <p className="text-gray-600 dark:text-gray-400">
                We go reply you soon. Check your email!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
