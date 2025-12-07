import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose, duration = null }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-400 via-emerald-500 to-teal-500',
          icon: '✨',
          emoji: '🎉',
          text: 'Yay!'
        };
      case 'error':
        return {
          gradient: 'from-red-400 via-pink-500 to-rose-500',
          icon: '💀',
          emoji: '😭',
          text: 'Oops!'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-amber-500',
          icon: '⚠️',
          emoji: '🤔',
          text: 'Hmm...'
        };
      case 'info':
        return {
          gradient: 'from-blue-400 via-cyan-500 to-sky-500',
          icon: '💡',
          emoji: '👀',
          text: 'Hey!'
        };
      default:
        return {
          gradient: 'from-purple-400 via-violet-500 to-indigo-500',
          icon: '✨',
          emoji: '🎉',
          text: 'Nice!'
        };
    }
  };

  const style = getToastStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <div className={`relative bg-gradient-to-r ${style.gradient} rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"
               style={{
                 backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
               }}
          />
        </div>

        {/* Content */}
        <div className="relative px-6 py-4 flex items-center gap-4">
          {/* Animated emoji */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.2, 1.2, 1.2, 1]
            }}
            transition={{ duration: 0.5 }}
            className="text-4xl"
          >
            {style.emoji}
          </motion.div>

          {/* Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black text-white drop-shadow-lg">
                {style.text}
              </span>
              <span className="text-xl">{style.icon}</span>
            </div>
            <p className="text-white font-semibold drop-shadow-md text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar - only show if duration is set */}
        {duration && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="h-1 bg-white/40"
          />
        )}
      </div>
    </motion.div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="mb-4 pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
