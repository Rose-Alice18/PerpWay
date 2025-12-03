// This file contains the complete implementation of Rides, Vendors, and Users tabs
// Copy these implementations back into AdminDashboard.jsx to replace the placeholders

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// ============================================
// RIDES TAB - Complete Implementation
// ============================================
export const RidesTab = ({ rides, fetchData, exportToCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  const filteredRides = rides.filter(ride => {
    const matchesSearch = !searchTerm ||
      ride.pickup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.creatorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = new Date(ride.date) >= new Date();
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'completed' && !isActive);

    return matchesSearch && matchesStatus;
  });

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to delete this ride?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/rides/${rideId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting ride:', error);
      alert('Failed to delete ride');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isRideActive = (ride) => new Date(ride.date) >= new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Rides Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Showing {filteredRides.length} / {rides.length} rides</p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                🗂️ Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-ashesi-primary shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                📋 Table
              </button>
            </div>
            <button
              onClick={() => exportToCSV(filteredRides, 'rides', ['pickup', 'destination', 'date', 'time', 'availableSeats', 'creatorName'])}
              className="px-4 py-2 bg-gradient-to-r from-ghana-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by pickup, destination, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-ashesi-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Rides</option>
              <option value="active">Active (Upcoming)</option>
              <option value="completed">Completed (Past)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRides.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No rides found matching your filters</p>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-3">
                    <span className="text-2xl">🚙</span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${
                    isRideActive(ride)
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}>
                    {isRideActive(ride) ? 'ACTIVE' : 'COMPLETED'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">📍</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-lg">🎯</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">To</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(ride.date)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ride.time}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ride.availableSeats}</p>
                  </div>
                </div>

                {ride.creatorName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-semibold">Created by:</span> {ride.creatorName}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedRide(ride); setShowDetailsModal(true); }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                  >
                    👁️ View Details
                  </button>
                  <button
                    onClick={() => handleDeleteRide(ride._id)}
                    className="flex-1 px-3 py-2 bg-ghana-red text-white rounded-xl font-semibold hover:bg-ghana-red/90 transition-all text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Route</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Seats</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Creator</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRides.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No rides found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredRides.map((ride) => (
                    <motion.tr
                      key={ride._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <span className="text-green-600">📍</span> {ride.pickup}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span className="text-red-600">🎯</span> {ride.destination}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">{formatDate(ride.date)}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{ride.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg text-sm font-semibold">
                          {ride.availableSeats} seats
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{ride.creatorName || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isRideActive(ride)
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {isRideActive(ride) ? 'ACTIVE' : 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedRide(ride); setShowDetailsModal(true); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleDeleteRide(ride._id)}
                            className="px-3 py-1.5 bg-ghana-red text-white rounded-lg font-semibold hover:bg-ghana-red/90 transition-all text-xs"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ride Details</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Route</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.pickup} → {selectedRide.destination}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedRide.date)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.time}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Seats</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedRide.availableSeats}</p>
              </div>
              {selectedRide.joinedUsers && selectedRide.joinedUsers.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Joined Passengers ({selectedRide.joinedUsers.length})</p>
                  <div className="space-y-2">
                    {selectedRide.joinedUsers.map((user, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2">
                        <span className="text-lg">👤</span>
                        <span className="font-medium text-gray-900 dark:text-white">{user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => { setShowDetailsModal(false); setSelectedRide(null); }}
              className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Note: VendorsTab and UsersTab implementations continue in the next part...
// Due to character limit, please let me know when you're ready for the next part
