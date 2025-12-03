import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: '🚗 Driver Finder',
      questions: [
        {
          question: 'How do I get drivers\' contact numbers?',
          answer: 'When you visit the Driver Finder page and pay a small tip, you\'ll get access to at least 5 trusted drivers\' contact numbers that you can save and use anytime you need a ride!',
        },
        {
          question: 'How much does it cost to access driver contacts?',
          answer: 'A small one-time tip gives you access to multiple drivers\' numbers. This tip helps us maintain the platform and verify drivers for your safety.',
        },
        {
          question: 'Are the drivers trustworthy?',
          answer: 'Yes! All our drivers are vetted and verified. We work only with drivers who have good track records and have been recommended by students.',
        },
        {
          question: 'Can I save the drivers\' numbers?',
          answer: 'Absolutely! Once you get access, you can save all the numbers to your phone and contact any driver directly whenever you need a ride.',
        },
      ],
    },
    {
      category: '📦 Delivery Service',
      questions: [
        {
          question: 'What delivery options do you offer?',
          answer: 'We offer three options: Instant Delivery (2-4 hours), Next-Day Delivery (24-48 hours), and Weekly Station Pickup (budget-friendly option). Choose what works best for you!',
        },
        {
          question: 'How much does delivery cost?',
          answer: 'Instant delivery costs GHS 15-25, Next-day delivery is GHS 10-15, and Weekly station pickup is just GHS 5-8. Prices depend on item size and pickup location.',
        },
        {
          question: 'Where can items be picked up from?',
          answer: 'We can pick up from popular locations like Madina, Adenta, Accra Mall, and other major areas around campus. Just specify the pickup point when making your request!',
        },
        {
          question: 'How do I track my delivery?',
          answer: 'Once your delivery request is confirmed, we\'ll contact you via phone to provide updates. You\'ll get a call when the item is picked up and another when it\'s ready for delivery.',
        },
      ],
    },
    {
      category: '🛍️ Local Services',
      questions: [
        {
          question: 'What kind of local services can I find?',
          answer: 'You can find barbers, tailors, fruit vendors, laundry services, and many other local businesses around Berekuso. All in one place!',
        },
        {
          question: 'How do I contact a vendor?',
          answer: 'Each vendor listing has their contact number and location. Just call or WhatsApp them directly to make arrangements or ask questions.',
        },
        {
          question: 'Are the vendor prices fixed?',
          answer: 'Most vendors have standard prices, but you can always negotiate! The prices shown on our platform are estimates to help you budget.',
        },
        {
          question: 'Can I suggest a vendor to be added?',
          answer: 'Yes please! If you know a great local service provider, contact us through the Contact page and we\'ll verify and add them to the platform.',
        },
      ],
    },
    {
      category: '🚙 Ride Pairing',
      questions: [
        {
          question: 'How does ride pairing work?',
          answer: 'Post where you\'re going and when, and other students heading the same way can join you. Share the ride, split the cost, save money!',
        },
        {
          question: 'Is ride pairing safe?',
          answer: 'Yes! All users must sign in to use the platform, and we recommend only pairing with people you know or fellow students. Always meet in public areas.',
        },
        {
          question: 'How do we split the cost?',
          answer: 'You arrange payment directly with your ride-mates. Most students use mobile money or split the fare equally. Agree on the amount before the trip!',
        },
        {
          question: 'Can I cancel a ride pairing?',
          answer: 'Yes, but please notify your ride-mates as soon as possible if plans change. It\'s just good etiquette!',
        },
      ],
    },
    {
      category: '💡 General',
      questions: [
        {
          question: 'Do I need to create an account?',
          answer: 'Yes! Creating an account helps us provide better service and keeps the community safe. Sign up is quick and easy!',
        },
        {
          question: 'Is Perpway free to use?',
          answer: 'The platform is free to browse! You only pay for specific services like driver contacts or delivery fees. No hidden charges!',
        },
        {
          question: 'How do I make payments?',
          answer: 'We accept mobile money (MTN, Vodafone, AirtelTigo) and cash for most services. Payment details will be provided for each service.',
        },
        {
          question: 'What if I have a problem with a service?',
          answer: 'Contact us immediately through the Contact page or call our support line. We take all complaints seriously and will help resolve any issues.',
        },
        {
          question: 'Can I use Perpway from other campuses?',
          answer: 'Currently, we focus on serving students around Berekuso area, but we\'re planning to expand to other campuses soon! Stay tuned!',
        },
      ],
    },
  ];

  const toggleAccordion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-4xl mx-auto"
      >
        <motion.div
          className="inline-block text-7xl mb-6"
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
          ❓
        </motion.div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Got questions? We get answers! Find everything you need to know about using Perpway.
          If you no see your question here, just contact us! 📧
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for questions..."
            className="input-field pl-12"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
            🔍
          </div>
        </div>
      </motion.div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 dark:text-white">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.questions.map((faq, questionIndex) => {
                const index = `${categoryIndex}-${questionIndex}`;
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={questionIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: questionIndex * 0.05 }}
                    className="card hover:shadow-lg transition-shadow duration-300"
                  >
                    <button
                      onClick={() => toggleAccordion(categoryIndex, questionIndex)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <h3 className="font-semibold text-lg pr-4 dark:text-white">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl flex-shrink-0"
                      >
                        {isOpen ? '➖' : '➕'}
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Still Have Questions CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mt-16 card bg-gradient-to-br from-ashesi-primary to-ghana-red text-white text-center"
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          💬
        </motion.div>
        <h2 className="font-display text-3xl font-bold mb-4">
          Still Have Questions?
        </h2>
        <p className="text-lg opacity-90 mb-6">
          No wahala! We dey here to help you. Reach out and we go answer all your questions!
        </p>
        <motion.a
          href="/contact"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block bg-white text-ashesi-primary font-bold py-3 px-8 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300"
        >
          Contact Us 📧
        </motion.a>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <a href="/drivers" className="card hover:shadow-lg transition-all duration-300 text-center group">
          <div className="text-4xl mb-3">🚗</div>
          <h3 className="font-bold dark:text-white group-hover:text-ashesi-primary transition-colors">
            Find Drivers
          </h3>
        </a>
        <a href="/delivery" className="card hover:shadow-lg transition-all duration-300 text-center group">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-bold dark:text-white group-hover:text-ashesi-primary transition-colors">
            Request Delivery
          </h3>
        </a>
        <a href="/services" className="card hover:shadow-lg transition-all duration-300 text-center group">
          <div className="text-4xl mb-3">🛍️</div>
          <h3 className="font-bold dark:text-white group-hover:text-ashesi-primary transition-colors">
            Browse Services
          </h3>
        </a>
      </motion.div>
    </div>
  );
};

export default FAQ;
