import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JoinRideModal from '../components/JoinRideModal';
import SuccessModal from '../components/SuccessModal';

const RidePairing = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    pickupLocation: '',
    destination: '',
    departureTime: '',
    departureDate: '',
    seatsNeeded: 1,
    notes: '',
  });

  // Get today's date in YYYY-MM-DD format for min date validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rides');
      setRides(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/rides/create', formData);

      // Refresh rides list
      fetchRides();

      // Reset form and close modal
      setFormData({
        name: '',
        contact: '',
        pickupLocation: '',
        destination: '',
        departureTime: '',
        departureDate: '',
        seatsNeeded: 1,
        notes: '',
      });
      setShowForm(false);

      setSuccessMessage('Ride posted successfully! 🚗');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error posting ride:', error);
      alert('Failed to post ride. Please try again!');
    }
  };

  const handleJoinRide = (ride) => {
    setSelectedRide(ride);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = async (contactData) => {
    try {
      const rideId = selectedRide._id || selectedRide.id;
      await axios.post(`http://localhost:5000/api/rides/${rideId}/join`, contactData);
      setSuccessMessage('Success! The ride creator might contact you soon. 🎉');
      setShowSuccessModal(true);
      fetchRides();
      setShowJoinModal(false);
      setSelectedRide(null);
    } catch (error) {
      console.error('Error joining ride:', error);
      const errorMsg = error.response?.data?.error || 'Failed to join ride. Please try again!';
      alert(errorMsg);
      throw error;
    }
  };

  const filteredRides = rides.filter((ride) => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return ride.departureDate === today;
    }
    if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return ride.departureDate === tomorrow.toISOString().split('T')[0];
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">🚙</div>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Ride Pairing 🚙
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Going somewhere? Find others heading the same way!
            Hop in, we go campus together chale! 🚗💨
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              🚗 Post a Ride
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/drivers')}
              className="px-6 py-3 bg-ghana-yellow text-gray-800 dark:text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              🚕 Call a Driver Instead
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {['all', 'today', 'tomorrow'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  filter === f
                    ? 'bg-ashesi-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Rides List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold mb-1 dark:text-white">
                    {ride.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    📞 {ride.contact}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  ride.availableSeats === 0
                    ? 'bg-ghana-red text-white'
                    : 'bg-ghana-green text-white'
                }`}>
                  {ride.availableSeats} {ride.availableSeats === 1 ? 'seat' : 'seats'}
                </div>
              </div>

              {/* Seats Info Alert - Only show if availableSeats is valid */}
              {ride.availableSeats != null && (
                <div className={`mb-3 p-2.5 rounded-lg border ${
                  ride.availableSeats === 0
                    ? 'bg-red-50 border-red-200'
                    : ride.availableSeats <= 1
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-xs font-medium flex items-center gap-1.5 ${
                    ride.availableSeats === 0
                      ? 'text-red-800'
                      : ride.availableSeats <= 1
                      ? 'text-orange-800'
                      : 'text-yellow-800'
                  }`}>
                    <span>💺</span>
                    <span>
                      {ride.availableSeats === 0
                        ? 'FULL! No seats left. Call a driver instead!'
                        : `Only ${ride.availableSeats} ${ride.availableSeats === 1 ? 'seat' : 'seats'} left!`
                      }
                    </span>
                  </p>
                </div>
              )}

              {/* Route Information */}
              <div className="mb-4 bg-gradient-to-r from-ghana-red/10 via-ghana-yellow/10 to-ghana-green/10 rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">From</p>
                    <p className="font-bold flex items-center">
                      <span className="mr-2">🚩</span>
                      {ride.pickupLocation || 'N/A'}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-2xl">→</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">To</p>
                    <p className="font-bold flex items-center">
                      <span className="mr-2">📍</span>
                      {ride.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Departure Info */}
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 flex items-center">
                  <span className="mr-2">📅</span>
                  <span className="font-semibold">
                    {new Date(ride.departureDate).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <span className="mr-2">🕒</span>
                  <span className="font-semibold">{ride.departureTime}</span>
                </p>
              </div>

              {/* Notes */}
              {ride.notes && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-xs text-gray-500 mb-1 font-semibold">
                    💬 Note from Ride Creator:
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    "{ride.notes}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: ride.availableSeats === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: ride.availableSeats === 0 ? 1 : 0.98 }}
                  onClick={() => handleJoinRide(ride)}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    ride.availableSeats === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-ghana-red hover:bg-ghana-red/90 text-white hover:shadow-lg'
                  }`}
                  disabled={ride.availableSeats === 0}
                >
                  {ride.availableSeats === 0 ? 'Ride Full 😔' : 'Join This Ride 🚗'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/drivers')}
                  className={`w-full px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    ride.availableSeats === 0
                      ? 'bg-ghana-green text-white animate-pulse'
                      : 'bg-ghana-yellow text-gray-800'
                  }`}
                >
                  <span className="text-lg">🚕</span>
                  <span>
                    {ride.availableSeats === 0
                      ? 'Now Go Ahead & Call a Driver!'
                      : 'Or Call a Driver Directly!'}
                  </span>
                </motion.button>
              </div>

              {/* Joined Users - Compact Version */}
              {ride.joinedUsers && ride.joinedUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1">
                    <span>👥</span>
                    <span>{ride.joinedUsers.length} {ride.joinedUsers.length === 1 ? 'Person' : 'People'} Joined:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ride.joinedUsers.map((user, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full text-xs transition-all"
                      >
                        <span>👤</span>
                        <span className="font-semibold text-gray-800">
                          {typeof user === 'string' ? user : user.name}
                        </span>
                        {typeof user === 'object' && user.seatsNeeded && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-ghana-red font-bold">
                              {user.seatsNeeded} 💺
                            </span>
                          </>
                        )}
                        {typeof user === 'object' && user.phone && (
                          <>
                            <span className="text-gray-400">•</span>
                            <a
                              href={`tel:${user.phone}`}
                              className="text-ghana-green hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {user.phone}
                            </a>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredRides.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No rides available
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to post a ride!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Post a Ride
            </button>
          </motion.div>
        )}
      </div>

      {/* Post Ride Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-3xl font-bold mb-6 text-center">
                Post a Ride 🚗
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ama Serwaa"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="0XX XXX XXXX"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="e.g., Madina, Accra Mall"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Destination *
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g., Ashesi Campus"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      min={getTodayDate()}
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cannot select past dates
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <input
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleChange}
                      min={formData.departureDate === getTodayDate() ? getCurrentTime() : undefined}
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.departureDate === getTodayDate() && 'Cannot select past times for today'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    How Many Seats Do You Need? * (1-4 seats)
                  </label>
                  <input
                    type="number"
                    name="seatsNeeded"
                    value={formData.seatsNeeded}
                    onChange={handleChange}
                    min="1"
                    max="4"
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 <strong>Important:</strong> A taxi has 5 total seats (1 driver + 4 passengers).
                    <br />
                    <strong>YOU are a passenger!</strong> Select how many of the 4 passenger seats YOU need.
                    <br />
                    📊 <strong>You need: {formData.seatsNeeded || 1} {formData.seatsNeeded === 1 ? 'seat' : 'seats'}</strong> → <strong>Others can join: {4 - (formData.seatsNeeded || 1)} {4 - (formData.seatsNeeded || 1) === 1 ? 'seat' : 'seats'}</strong>
                    <br />
                    <span className="text-red-600">⚠️ Total passengers will be: {formData.seatsNeeded || 1} (you) + {4 - (formData.seatsNeeded || 1)} (others) = 4 max</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special notes? E.g., 'Meeting at main gate', 'Stopping at Madina'"
                    className="input-field min-h-[80px] resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Post Ride 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Ride Modal */}
      <AnimatePresence>
        {showJoinModal && selectedRide && (
          <JoinRideModal
            ride={selectedRide}
            onClose={() => {
              setShowJoinModal(false);
              setSelectedRide(null);
            }}
            onSubmit={handleJoinSubmit}
          />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default RidePairing;
