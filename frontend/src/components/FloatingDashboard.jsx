import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('userAuthenticated');
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(authStatus === 'true');
    setUserRole(role);

    // Load saved position from localStorage
    const savedPosition = localStorage.getItem('floatingDashboardPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  const handleDragEnd = (event, info) => {
    const newPosition = { x: info.point.x, y: info.point.y };
    setPosition(newPosition);
    // Save position to localStorage
    localStorage.setItem('floatingDashboardPosition', JSON.stringify(newPosition));
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

  return (
    <AnimatePresence>
      {isAuthenticated && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{
            top: 0,
            left: 0,
            right: window.innerWidth - 200,
            bottom: window.innerHeight - 100
          }}
          onDragEnd={handleDragEnd}
          style={{
            x: position.x,
            y: position.y,
            position: 'fixed',
            bottom: position.x === 0 && position.y === 0 ? '1.5rem' : 'auto',
            right: position.x === 0 && position.y === 0 ? '1.5rem' : 'auto',
            top: position.x === 0 && position.y === 0 ? 'auto' : 0,
            left: position.x === 0 && position.y === 0 ? 'auto' : 0,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
          }}
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 180 }}
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
            {/* Pulsing outer glow - breathing effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Secondary breathing glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-3xl blur-xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Main button with breathing animation */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 10px 40px rgba(59, 130, 246, 0.4)",
                  "0 20px 60px rgba(168, 85, 247, 0.6)",
                  "0 10px 40px rgba(236, 72, 153, 0.4)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl px-6 py-4 flex items-center gap-3 border-2 border-white/30"
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
              <div className="hidden sm:block relative z-10">
                <motion.p
                  animate={{
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="font-black text-sm"
                >
                  My Dashboard
                </motion.p>
                <p className="text-xs opacity-90 font-semibold">Click to view</p>
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
                className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white"
              >
                !
              </motion.div>
            </motion.div>

            {/* Mobile version - compact with breathing and text */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 5, -5, 0],
                boxShadow: [
                  "0 8px 30px rgba(59, 130, 246, 0.4)",
                  "0 12px 45px rgba(168, 85, 247, 0.6)",
                  "0 8px 30px rgba(236, 72, 153, 0.4)"
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="sm:hidden absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl px-4 py-3 flex flex-col items-center justify-center shadow-2xl border-2 border-white/40 min-w-[90px]"
            >
              <motion.span
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.15, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="text-2xl mb-1"
              >
                📊
              </motion.span>
              <motion.p
                animate={{
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[9px] font-black text-white leading-tight text-center"
              >
                Dashboard
              </motion.p>
            </motion.div>
          </motion.div>
          </div>

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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingDashboard;
