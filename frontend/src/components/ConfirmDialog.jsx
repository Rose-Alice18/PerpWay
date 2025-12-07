import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Yes, do it!', cancelText = 'Nah, cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'danger':
        return {
          gradient: 'from-red-500 via-pink-600 to-rose-600',
          emoji: '⚠️',
          confirmBg: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500 via-orange-500 to-amber-500',
          emoji: '🤔',
          confirmBg: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
        };
      case 'info':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-sky-500',
          emoji: '💡',
          confirmBg: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
        };
      case 'success':
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          emoji: '✨',
          confirmBg: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
        };
      default:
        return {
          gradient: 'from-purple-500 via-violet-500 to-indigo-500',
          emoji: '🎯',
          confirmBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        };
    }
  };

  const style = getTypeStyle();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${style.gradient} p-6`}>
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{ duration: 0.6, repeat: 0 }}
                className="text-6xl mb-4 text-center"
              >
                {style.emoji}
              </motion.div>
              <h2 className="text-2xl font-black text-white text-center drop-shadow-lg">
                {title}
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 text-center text-lg leading-relaxed mb-6">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-3 ${style.confirmBg} text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl transform hover:scale-105`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
