import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {

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
    </div>
  );
};

export default Home;
