import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('userAuthenticated');
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(authStatus === 'true');
    setUserRole(role);
  }, []);

  const features = [
    {
      title: 'Driver Finder',
      description: 'Get access to all our trusted drivers\' numbers! Small tip den you go fit get at least 5 drivers contact to choose from. 🚗',
      icon: '🚗',
      path: '/drivers',
      color: 'from-red-500 to-red-600',
      bgGlow: 'group-hover:shadow-red-500/50',
    },
    {
      title: 'Delivery Service',
      description: 'Need something delivered to campus? We got you covered with instant, next-day, and weekly options! 📦',
      icon: '📦',
      path: '/delivery',
      color: 'from-yellow-500 to-yellow-600',
      bgGlow: 'group-hover:shadow-yellow-500/50',
    },
    {
      title: 'Local Services',
      description: 'Find the best barbers, tailors, fruit vendors, and more around Berekuso. All your needs, one place! 🛍️',
      icon: '🛍️',
      path: '/services',
      color: 'from-green-600 to-green-700',
      bgGlow: 'group-hover:shadow-green-500/50',
    },
    {
      title: 'Ride Pairing',
      description: 'Going somewhere? Find others heading the same way and share the ride. Save money, make friends! 🚙',
      icon: '🚙',
      path: '/rides',
      color: 'from-blue-500 to-blue-600',
      bgGlow: 'group-hover:shadow-blue-500/50',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ghana-red via-ghana-yellow to-ghana-green py-20 px-4 overflow-hidden">
        {/* Animated background circles */}
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 15,
              duration: 0.8
            }}
          >
            <motion.h1
              className="font-display text-5xl md:text-7xl font-bold mb-6"
              animate={{
                textShadow: ["0 0 20px rgba(255,255,255,0.5)", "0 0 40px rgba(255,255,255,0.8)", "0 0 20px rgba(255,255,255,0.5)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Welcome to Perpway! ✨
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-4 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your Community Hub
            </motion.p>
            <motion.p
              className="text-lg md:text-xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              E be like say you dey find driver? You need delivery? Want local services? We dey here for you!
              Everything wey you need, all for one place. Make we help you! 💪
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="#features"
                className="inline-block bg-white text-ashesi-primary font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 relative group"
              >
                <span className="relative z-10">Explore Services 🚀</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green rounded-full opacity-0 group-hover:opacity-20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              What We Offer
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              All the services wey go make your campus life sweet pass! Choose what you need below 👇
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -15,
                  scale: 1.03,
                  rotate: [0, 1, -1, 0],
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className="card group relative overflow-hidden cursor-pointer"
              >
                {/* Animated gradient overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  initial={false}
                />

                {/* Floating icon animation */}
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-4xl mb-4 mx-auto relative z-10 ${feature.bgGlow} shadow-lg transition-shadow duration-300`}
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1.1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                  >
                    {feature.icon}
                  </motion.span>
                </motion.div>

                <motion.h3
                  className="font-display text-xl font-bold mb-3 text-center dark:text-white relative z-10"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {feature.title}
                </motion.h3>

                <motion.p
                  className="text-gray-600 dark:text-gray-300 mb-6 text-center leading-relaxed relative z-10"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {feature.description}
                </motion.p>

                <Link to={feature.path}>
                  <motion.button
                    className="block w-full text-center bg-ashesi-primary text-white py-3 rounded-lg font-semibold relative overflow-hidden group/btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Get Started</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-ghana-red via-ghana-yellow to-ghana-green opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-ashesi-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Join the Perpway Community! 🎉
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Whether you dey look for ride, need delivery, or want connect with local vendors,
              we get you covered. Make we help you navigate campus life with ease!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/drivers"
                className="btn-secondary"
              >
                Find a Driver Now
              </Link>
              <Link
                to="/rides"
                className="bg-white text-ashesi-primary font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Start Carpooling
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{
                scale: 1.08,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.3 }
              }}
              className="p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🚗
              </motion.div>
              <motion.h3
                className="font-display text-3xl font-bold text-ashesi-primary mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                20+
              </motion.h3>
              <p className="text-gray-600 dark:text-gray-300">Trusted Drivers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{
                scale: 1.08,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.3 }
              }}
              className="p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📦
              </motion.div>
              <motion.h3
                className="font-display text-3xl font-bold text-ashesi-primary mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                100+
              </motion.h3>
              <p className="text-gray-600 dark:text-gray-300">Deliveries Made</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{
                scale: 1.08,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.3 }
              }}
              className="p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                😊
              </motion.div>
              <motion.h3
                className="font-display text-3xl font-bold text-ashesi-primary mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                500+
              </motion.h3>
              <p className="text-gray-600 dark:text-gray-300">Happy Students</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Dashboard Button - Only show when authenticated */}
      <AnimatePresence>
        {isAuthenticated && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={() => navigate(userRole === 'admin' ? '/admin/dashboard' : '/dashboard')}
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.85 }}
              className="relative group"
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
            </motion.button>

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
    </div>
  );
};

export default Home;
