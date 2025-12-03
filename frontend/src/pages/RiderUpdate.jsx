import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const RiderUpdate = () => {
  const { riderCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [riderName, setRiderName] = useState('');
  const [updates, setUpdates] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRiderDeliveries();
  }, [riderCode]);

  const fetchRiderDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/delivery/rider/${riderCode}`);
      setDeliveries(response.data.deliveries);
      setRiderName(response.data.riderName);

      // Initialize updates state
      const initialUpdates = {};
      response.data.deliveries.forEach(delivery => {
        initialUpdates[delivery._id] = {
          status: delivery.status,
          notes: ''
        };
      });
      setUpdates(initialUpdates);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to load deliveries. Please check the link or contact admin.');
      setLoading(false);
    }
  };

  const handleStatusChange = (deliveryId, newStatus) => {
    setUpdates(prev => ({
      ...prev,
      [deliveryId]: {
        ...prev[deliveryId],
        status: newStatus
      }
    }));
  };

  const handleNotesChange = (deliveryId, notes) => {
    setUpdates(prev => ({
      ...prev,
      [deliveryId]: {
        ...prev[deliveryId],
        notes: notes
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Prepare updates array
      const updatesArray = Object.entries(updates).map(([deliveryId, update]) => ({
        deliveryId,
        status: update.status,
        notes: update.notes
      }));

      await axios.post(`http://localhost:5000/api/delivery/rider/${riderCode}/update`, {
        updates: updatesArray
      });

      setSuccess(true);
      setTimeout(() => {
        fetchRiderDeliveries(); // Refresh the list
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating deliveries:', error);
      setError('Failed to update deliveries. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error && deliveries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please contact Perpway admin for assistance.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-red/10 via-ghana-yellow/20 to-ghana-green/10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/geesh.png"
              alt="Perpway Logo"
              className="w-16 h-16 object-contain rounded-xl shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green bg-clip-text text-transparent">
                Perpway Deliveries
              </h1>
              <p className="text-gray-600 font-semibold">🏍️ {riderName}</p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-semibold">
              📋 {deliveries.filter(d => ['assigned', 'in-progress'].includes(d.status)).length} active deliveries
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Update the status of each delivery below and submit when done.
            </p>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <span className="text-3xl">✅</span>
              <div>
                <p className="text-green-800 font-bold">Updates Submitted Successfully!</p>
                <p className="text-green-600 text-sm">The admin has been notified of the delivery statuses.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <span className="text-3xl">⚠️</span>
            <p className="text-red-800 font-semibold">{error}</p>
          </motion.div>
        )}

        {/* Deliveries List */}
        <div className="space-y-4 mb-6">
          {deliveries.map((delivery, index) => (
            <motion.div
              key={delivery._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Delivery #{index + 1}</h3>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    ID: {delivery._id?.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Delivery Details */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-gray-700">👤 Customer:</span>
                    <span className="text-gray-900">{delivery.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-gray-700">📞 Contact:</span>
                    <span className="text-gray-900">{delivery.contact}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-gray-700">📦 Item:</span>
                    <span className="text-gray-900">{delivery.itemDescription}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-gray-700">📍 Pickup:</span>
                    <span className="text-gray-900">{delivery.pickupPoint || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-gray-700">📍 Dropoff:</span>
                    <span className="text-gray-900">{delivery.dropoffPoint || 'N/A'}</span>
                  </div>
                  {delivery.notes && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700">📝 Notes:</span>
                      <span className="text-gray-900">{delivery.notes}</span>
                    </div>
                  )}
                </div>

                {/* Status Update Buttons */}
                <div className="pt-3 border-t-2 border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Update Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange(delivery._id, 'delivered')}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        updates[delivery._id]?.status === 'delivered'
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      ✅ Delivered
                    </button>
                    <button
                      onClick={() => handleStatusChange(delivery._id, 'cancelled')}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        updates[delivery._id]?.status === 'cancelled'
                          ? 'bg-red-600 text-white shadow-lg scale-105'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      ❌ Could Not Deliver
                    </button>
                  </div>

                  {/* Notes field for failed deliveries */}
                  {updates[delivery._id]?.status === 'cancelled' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Reason (Optional):
                      </label>
                      <input
                        type="text"
                        value={updates[delivery._id]?.notes || ''}
                        onChange={(e) => handleNotesChange(delivery._id, e.target.value)}
                        placeholder="e.g., Customer not home, Wrong address..."
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        {deliveries.length > 0 && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Updates...
              </span>
            ) : (
              <span>Submit All Updates 🚀</span>
            )}
          </motion.button>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Perpway - Personal Easy Rides & Packages
        </p>
      </div>
    </div>
  );
};

export default RiderUpdate;
