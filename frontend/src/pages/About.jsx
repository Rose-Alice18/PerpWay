import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const stats = [
    { icon: '🚗', value: '20+', label: 'Trusted Drivers' },
    { icon: '📦', value: '500+', label: 'Deliveries Made' },
    { icon: '🛍️', value: '50+', label: 'Local Vendors' },
    { icon: '😊', value: '1000+', label: 'Happy Users' },
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Our Mission',
      description: 'To connect students with reliable transport, delivery, and local services, making campus life easier and more convenient for everyone.',
    },
    {
      icon: '👁️',
      title: 'Our Vision',
      description: 'To become the most trusted community platform for students, providing seamless access to essential services across campuses in Ghana.',
    },
    {
      icon: '💪',
      title: 'Our Values',
      description: 'Trust, reliability, and community. We believe in building strong relationships and making every interaction count.',
    },
  ];

  const team = [
    {
      name: 'The Founders',
      role: 'Students for Students',
      description: 'Created by students who understand the challenges of campus life and wanted to make things better.',
      emoji: '👥',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ashesi-primary via-ghana-red to-ghana-yellow py-20 px-4 overflow-hidden">
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

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-7xl mb-6"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ℹ️
            </motion.div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">About Perpway</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Your trusted community platform for personal easy rides and packages. Making campus life simple, one service at a time! 🚀
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  className="text-5xl mb-3"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-4xl font-bold text-ashesi-primary mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-center dark:text-white">
              Our Story 📖
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              <p>
                Perpway was born from a simple observation: students face daily challenges finding reliable transport, getting items delivered, and connecting with local service providers around campus.
              </p>
              <p>
                We saw friends struggling to find trusted drivers, waiting hours for deliveries, and searching endlessly for quality local services. We knew there had to be a better way.
              </p>
              <p>
                That's why we created Perpway - a one-stop platform that brings together drivers, delivery services, local vendors, and ride-sharing opportunities all in one place. We make campus life easier by connecting you with trusted services at your fingertips.
              </p>
              <p className="font-semibold text-ashesi-primary">
                Today, we're proud to serve over 1000 students, facilitating thousands of rides, deliveries, and connections every month! 🎉
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold mb-12 text-center dark:text-white"
          >
            What Drives Us
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="card text-center"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  {value.icon}
                </motion.div>
                <h3 className="font-display text-2xl font-bold mb-4 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold mb-12 text-center dark:text-white"
          >
            Meet The Team
          </motion.h2>
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="card text-center"
            >
              <motion.div
                className="text-8xl mb-6 inline-block"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {member.emoji}
              </motion.div>
              <h3 className="font-display text-3xl font-bold mb-2 dark:text-white">{member.name}</h3>
              <p className="text-ashesi-primary font-semibold text-lg mb-4">{member.role}</p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                {member.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-ashesi-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience Perpway? 🎉
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of students who trust Perpway for their daily needs!
            </p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-ashesi-primary font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300"
            >
              Get Started Now 🚀
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
