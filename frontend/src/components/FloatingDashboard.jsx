import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FloatingDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isDragged, setIsDragged] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('userAuthenticated');
    const role = localStorage.getItem('userRole');

    console.log('FloatingDashboard - Auth Status:', authStatus);
    console.log('FloatingDashboard - User Role:', role);

    setIsAuthenticated(authStatus === 'true');
    setUserRole(role);

    // Check if dashboard was previously dragged
    const wasDragged = localStorage.getItem('floatingDashboardDragged');
    if (wasDragged === 'true') {
      setIsDragged(true);
    }
  }, []);

  const handleDragStart = () => {
    if (!isDragged) {
      setIsDragged(true);
      localStorage.setItem('floatingDashboardDragged', 'true');
    }
  };

  const handleClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected - navigate to dashboard
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/dashboard');
      setLastTap(0);
    } else {
      // Single tap - just record the time
      setLastTap(now);
    }
  };

  console.log('FloatingDashboard rendering - isAuthenticated:', isAuthenticated);

  // Don't show if not authenticated
  if (!isAuthenticated) {
    console.log('FloatingDashboard - Not authenticated, returning null');
    return null;
  }

  console.log('FloatingDashboard - Rendering component visible');

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: -window.innerHeight + 150,
        left: -window.innerWidth + 150,
        right: window.innerWidth - 150,
        bottom: window.innerHeight - 150
      }}
      onDragStart={handleDragStart}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="z-[9999] select-none"
    >
      <div className="relative group">
        {/* Drag Handle - visible on hover */}
        <motion.div
          whileHover={{ opacity: 1 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 whitespace-nowrap"
        >
          ⬍ Drag me | Double-tap to open ⬍
        </motion.div>

        <motion.div
          onClick={handleClick}
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          whileTap={{ scale: 0.85 }}
          className="relative cursor-pointer"
        >
          {/* Pulsing outer glow - breathing effect - BEHIND the button */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Main button with breathing animation */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 border-2 border-white/30"
          >
            {/* Animated shine overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-3xl"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1
              }}
            />

            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-2xl relative z-10"
            >
              📊
            </motion.div>
            <div className="relative z-10">
              <motion.p
                animate={{
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="font-black text-xs sm:text-sm"
              >
                My Dashboard
              </motion.p>
              <p className="hidden sm:block text-xs opacity-90 font-semibold">Click to view</p>
            </div>

            {/* Pulsing notification badge */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white z-20"
            >
              !
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced tooltip with animation */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          whileHover={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-5 py-3 rounded-2xl text-sm font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 shadow-2xl border-2 border-white/30"
        >
          <span className="relative z-10">Go to Dashboard →</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FloatingDashboard;
