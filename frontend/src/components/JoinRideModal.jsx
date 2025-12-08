import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JoinRideModal = ({ ride, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    seatsNeeded: 1,
    contactVisibility: 'private', // 'private' or 'public'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Join ride error:', error);
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🚙</div>
          <h2 className="font-display text-2xl font-bold mb-2 dark:text-white">
            Join This Ride!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Going to <span className="font-semibold text-ashesi-primary">{ride.destination}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {new Date(ride.departureDate).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })} at {ride.departureTime}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Kwame Mensah"
              className="input-field"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0XX XXX XXXX"
              className="input-field"
              required
              pattern="[0-9]{10}"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The ride creator will call/text you
            </p>
          </div>

          {/* Seats Needed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              How Many Seats Do You Need? * 💺
            </label>
            <input
              type="number"
              name="seatsNeeded"
              value={formData.seatsNeeded}
              onChange={handleChange}
              min="1"
              max={ride.availableSeats}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="font-semibold text-ghana-red">Available: {ride.availableSeats} {ride.availableSeats === 1 ? 'seat' : 'seats'}</span>
              <br />
              You selected: <strong>{formData.seatsNeeded}</strong> {formData.seatsNeeded === 1 ? 'seat' : 'seats'}
              {formData.seatsNeeded <= ride.availableSeats && (
                <span> → Remaining: <strong>{ride.availableSeats - formData.seatsNeeded}</strong> {(ride.availableSeats - formData.seatsNeeded) === 1 ? 'seat' : 'seats'}</span>
              )}
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Number (Optional)
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="0XX XXX XXXX (if different from phone)"
              className="input-field"
              pattern="[0-9]{10}"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              For quick chats. Leave blank if same as phone number
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="input-field"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              For confirmation messages
            </p>
          </div>

          {/* Contact Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Contact Information Visibility 🔒
            </label>
            <div className="space-y-3">
              {/* Private Option */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                style={{
                  borderColor: formData.contactVisibility === 'private' ? '#8B0000' : '',
                  backgroundColor: formData.contactVisibility === 'private' ? 'rgba(139, 0, 0, 0.05)' : ''
                }}
              >
                <input
                  type="radio"
                  name="contactVisibility"
                  value="private"
                  checked={formData.contactVisibility === 'private'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">🔒 Private</span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">Recommended</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Only the ride creator can see your contact details. Other passengers won't see your phone number.
                  </p>
                </div>
              </label>

              {/* Public Option */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                style={{
                  borderColor: formData.contactVisibility === 'public' ? '#8B0000' : '',
                  backgroundColor: formData.contactVisibility === 'public' ? 'rgba(139, 0, 0, 0.05)' : ''
                }}
              >
                <input
                  type="radio"
                  name="contactVisibility"
                  value="public"
                  checked={formData.contactVisibility === 'public'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">🌐 Public</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    All passengers and the ride creator can see your contact details for coordination.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-ghana-yellow/10 dark:bg-ghana-yellow/20 border-2 border-ghana-yellow rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">📞 Note:</span> The ride creator will always see your
              contact details and reach out to you directly. Make sure your phone is reachable!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-all"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Ride 🎉'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default JoinRideModal;
