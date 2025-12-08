import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShoppingRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    shopLocations: '',
    estimatedPrice: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, image: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.productDescription.trim()) newErrors.productDescription = 'Description is required';
    if (!formData.shopLocations.trim()) newErrors.shopLocations = 'Shop locations are required';
    if (!imageFile) newErrors.image = 'Product image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (!userEmail) {
      alert('Please sign in to submit a shopping request');
      navigate('/signin');
      return;
    }

    setSubmitting(true);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userEmail', userEmail);
      formDataToSend.append('userName', userName || 'Guest');
      formDataToSend.append('userContact', localStorage.getItem('userContact') || '');
      formDataToSend.append('productName', formData.productName);
      formDataToSend.append('productDescription', formData.productDescription);
      formDataToSend.append('shopLocations', formData.shopLocations);
      formDataToSend.append('estimatedPrice', formData.estimatedPrice);
      formDataToSend.append('productImage', imageFile);

      await axios.post(`${apiUrl}/api/shopping/create`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        setFormData({
          productName: '',
          productDescription: '',
          shopLocations: '',
          estimatedPrice: '',
        });
        setImageFile(null);
        setImagePreview(null);
        setSubmitting(false);
        setShowSuccess(false);
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Shopping request error:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('API URL:', apiUrl);
      setSubmitting(false);

      let errorMessage = 'Failed to submit request.';
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }

      alert(`${errorMessage}\n\nPlease try again!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block text-6xl mb-4"
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🛍️
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Shopping Service
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Need something from town but don't have time? We'll get it for you!
            Just tell us what you need and where to find it.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="e.g., iPhone Charger, Body Lotion, Perfume"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.productName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-ashesi-primary transition-all duration-200`}
              />
              {errors.productName && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.productName}
                </p>
              )}
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Product Image * (Max 5MB)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <div className={`border-2 border-dashed ${
                    errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl p-8 text-center cursor-pointer hover:border-ashesi-primary transition-all duration-200`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div>
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl mb-2">📸</div>
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">
                          Click to upload product image
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          JPG, PNG or WEBP (max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
              {errors.image && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.image}
                </p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Product Description *
              </label>
              <textarea
                name="productDescription"
                value={formData.productDescription}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the product in detail (color, size, brand, specific features, etc.)"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.productDescription ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-ashesi-primary transition-all duration-200`}
              />
              {errors.productDescription && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.productDescription}
                </p>
              )}
            </div>

            {/* Shop Locations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Where to Find It *
              </label>
              <input
                type="text"
                name="shopLocations"
                value={formData.shopLocations}
                onChange={handleChange}
                placeholder="e.g., Madina Market, Melcom, Game Store at Accra Mall"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.shopLocations ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-ashesi-primary transition-all duration-200`}
              />
              {errors.shopLocations && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.shopLocations}
                </p>
              )}
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estimated Price (Optional)
              </label>
              <input
                type="number"
                name="estimatedPrice"
                value={formData.estimatedPrice}
                onChange={handleChange}
                placeholder="e.g., 50"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-ashesi-primary transition-all duration-200"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If you know the approximate price, let us know!
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center leading-relaxed">
                💡 <strong>How it works:</strong> Submit your request → Admin reviews and authorizes →
                You'll get notified with the final price → Make payment → We'll purchase and deliver to you!
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-ashesi-primary to-ghana-red hover:shadow-lg'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Shopping Request 🛍️'}
            </motion.button>
          </form>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md text-center shadow-2xl"
              >
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Request Submitted!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We'll review your request and get back to you soon. Check your dashboard for updates!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShoppingRequest;
