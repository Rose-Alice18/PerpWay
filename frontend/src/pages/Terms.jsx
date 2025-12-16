import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Terms = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [contactInfo, setContactInfo] = useState({
    email: 'support@perpway.com',
    phone: '+233 XX XXX XXXX',
    whatsapp: ''
  });

  // Fetch admin contact settings
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/settings`);
        if (response.data && response.data.general) {
          setContactInfo({
            email: 'support@perpway.com', // Always show this on frontend
            phone: response.data.general.supportPhone || '+233 XX XXX XXXX',
            whatsapp: response.data.general.supportPhone || '' // Use same number for WhatsApp
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, []);

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: '📜' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
  ];

  const termsContent = [
    {
      title: '1. Welcome to Perpway! 👋',
      content: 'Hey! Thanks for choosing Perpway. By using our platform, you\'re agreeing to these terms - think of them as our friendship agreement. We\'ve tried to keep them simple and fair. If something doesn\'t sit right with you, feel free to reach out to us before using the platform!',
    },
    {
      title: '2. Your Account 🔐',
      content: 'Creating an account is easy! Just make sure to keep your login details safe (don\'t share your password with anyone, not even us). We trust you to keep your info accurate and up-to-date. Your account, your responsibility - but we\'re here to help if you need it!',
    },
    {
      title: '3. What We Do 🚀',
      content: 'Perpway is like your campus buddy that connects you with drivers, delivery services, vendors, and ride-sharing opportunities. Think of us as the middleman helping students connect with services they need. We do our best to verify everyone, but remember - we\'re just facilitating the connection!',
    },
    {
      title: '4. Finding Drivers 🚗',
      content: 'Need a ride? Our Driver Finder helps you connect with trusted local drivers. A small tip (as low as GHS 2) unlocks their contact info - this helps us keep the platform running and free! Once you have their number, you arrange everything directly with them. We\'re just making the introduction!',
    },
    {
      title: '5. Delivery Service 📦',
      content: 'We help get your stuff to campus! We try our best to hit the delivery times, but sometimes things happen (traffic, weather, etc.). We only deliver legal, safe items - no sketchy stuff please! If something seems off about a delivery request, we might have to decline it for everyone\'s safety.',
    },
    {
      title: '6. Payments 💰',
      content: 'All our prices are in Ghana Cedis (GHS) - nice and simple! You can pay through Mobile Money or cash depending on the service. Once a payment is made, it\'s usually final (unless there\'s a real problem - then let\'s talk!). If we need to adjust prices, we\'ll give you a heads up.',
    },
    {
      title: '7. Ride Sharing 🚙',
      content: 'Heading the same way? Our ride pairing helps you split costs and make friends! You arrange everything directly with your ride buddy - payment, pickup time, all that. Please be safe, use good judgment, and treat each other with respect. We\'re just connecting you!',
    },
    {
      title: '8. Be Cool, Be Respectful 😎',
      content: 'Simple rules: follow the law, be nice to others, don\'t scam people, and don\'t mess with the platform. Basically, just be a decent human! If someone\'s being sketchy or making you uncomfortable, let us know immediately.',
    },
    {
      title: '9. Our Stuff 📝',
      content: 'All the content on Perpway (our logo, design, features, etc.) belongs to us or our partners. You\'re welcome to use the platform, but please don\'t copy or steal our work. If you want to use something for a project or presentation, just ask us first!',
    },
    {
      title: '10. The Real Talk ⚠️',
      content: 'We work hard to keep Perpway running smoothly, but we can\'t promise it\'ll be perfect 100% of the time. Sometimes things break, or services don\'t go as planned. We\'re not responsible for everything that happens, but we\'ll always try to make things right when we can!',
    },
    {
      title: '11. Account Issues 🚫',
      content: 'If someone\'s breaking the rules or doing shady stuff, we might need to suspend or close their account. We don\'t like doing this, but sometimes it\'s necessary to keep everyone safe. If this happens to you and you think it\'s a mistake, reach out - we\'re human and we make mistakes too!',
    },
    {
      title: '12. We Might Update These ✏️',
      content: 'As Perpway grows, these terms might need updates. When we make big changes, we\'ll let you know! If you keep using Perpway after we update the terms, it means you\'re cool with the changes. If not, you can always reach out with concerns.',
    },
    {
      title: '13. Ghana Rules Apply 🇬🇭',
      content: 'Perpway operates under Ghanaian law. If there\'s ever a legal dispute (hopefully there won\'t be!), it\'ll be handled in Ghana. But honestly, we\'d rather just talk things out like friends first!',
    },
    {
      title: '14. Questions? Let\'s Chat! 💬',
      content: `Got questions or concerns about these terms? We\'re here to help! Email us at ${contactInfo.email}, call/WhatsApp us at ${contactInfo.phone}, or use our Contact page. We actually read and respond to messages - promise! 😊`,
    },
  ];

  const privacyContent = [
    {
      title: '1. What Info Do We Collect? 📝',
      content: 'When you sign up, we collect the basics: your name, email, and phone number. We also automatically collect some technical stuff (like your device type and browser) to make the platform work better. Don\'t worry - we only collect what we actually need!',
    },
    {
      title: '2. How Do We Use Your Info? 🔍',
      content: 'We use your information to: make the platform work smoothly, process your orders and payments, send you updates (and cool features we\'re adding!), keep the platform safe from scammers, and improve the overall experience. We\'re not trying to be creepy - just helpful!',
    },
    {
      title: '3. Do We Share Your Info? 🤝',
      content: 'We DO NOT sell your information to anyone - period! However, we do share it in specific cases: with drivers/vendors when you use services (they need your contact to deliver!), with ride-sharing buddies when you pair up, and with authorities if legally required. You have full control over what you share when you sign up!',
    },
    {
      title: '4. Driver & Vendor Contacts 📞',
      content: 'Here\'s the deal: when you tip to unlock driver contacts, you get their number. When you order deliveries or rides, they get yours. It\'s a fair exchange that makes the service work! Everyone knows what they\'re signing up for.',
    },
    {
      title: '5. Is Your Data Safe? 🔐',
      content: 'Absolutely! We use industry-standard security to protect your information. But real talk - nothing on the internet is 100% hack-proof. We do our absolute best, use encryption, and constantly update our security. Your trust matters to us!',
    },
    {
      title: '6. How Long Do We Keep Your Data? ⏰',
      content: 'We keep your information while your account is active and for a reasonable time after (for things like transaction records). If you want us to delete your data, just ask! We\'ll take care of it, keeping only what\'s legally required.',
    },
    {
      title: '7. Your Privacy Rights ✊',
      content: 'You\'re in control! You can: view and update your info anytime, delete your account and data, opt-out of promotional emails, download your data, and ask us questions about how we use your information. Just reach out - we make it easy!',
    },
    {
      title: '8. Cookies 🍪',
      content: 'We use cookies (not the edible kind!) to remember your preferences and improve your experience. You can disable them in your browser, but some features might not work as well. They help us make Perpway better for you!',
    },
    {
      title: '9. Third-Party Links 🔗',
      content: 'Sometimes we link to other websites or services. We can\'t control their privacy practices, so read their policies if you\'re concerned. We only link to services we trust, but better safe than sorry!',
    },
    {
      title: '10. Age Requirement 🔞',
      content: 'Perpway is for adults (18+). If you\'re under 18, please don\'t use the platform. If we find out someone underage signed up, we\'ll need to delete their account. No hard feelings - come back when you\'re older!',
    },
    {
      title: '11. Ghana-Based 🇬🇭',
      content: 'Perpway is proudly Ghanaian! Your data is stored and processed here in Ghana. If you\'re accessing from another country, just know your information will be handled according to Ghanaian laws.',
    },
    {
      title: '12. Policy Updates 📢',
      content: 'As we grow and add features, this policy might change. We\'ll always let you know about big updates! If you keep using Perpway after an update, it means you\'re okay with the changes. Questions? Just ask!',
    },
    {
      title: '13. Got Privacy Questions? 🤔',
      content: `We\'re totally transparent about data privacy! Have concerns or questions? Email us at ${contactInfo.email}, call/WhatsApp at ${contactInfo.phone}, or use our Contact page. We\'ll explain everything in plain English - no legal jargon! 💙`,
    },
  ];

  const content = activeTab === 'terms' ? termsContent : privacyContent;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-4xl mx-auto"
      >
        <motion.div
          className="inline-block text-7xl mb-6"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          📜
        </motion.div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-white">
          The Legal Stuff (But Friendly!)
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Your rights, our promises - all in language you can actually understand! 🤝
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex gap-4 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-ashesi-primary text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-md'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="card bg-ghana-yellow/10 dark:bg-ghana-yellow/20 border-l-4 border-ghana-yellow">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Last Updated:</span> January 2025
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 dark:text-white">
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {activeTab === 'terms'
                  ? 'We know legal stuff can be boring, so we\'ve written these terms in plain language! This is basically our agreement on how to work together. Take a quick read - we promise it won\'t put you to sleep! 😊'
                  : 'Your privacy matters! Here\'s everything about how we handle your data, written in human language (not legal jargon). We believe in being totally transparent with you! 🔒'}
              </p>
            </div>

            <div className="space-y-8">
              {content.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-l-4 border-ashesi-primary pl-6 py-2"
                >
                  <h3 className="font-display text-xl font-bold mb-3 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 card bg-gradient-to-br from-ashesi-primary to-ghana-red text-white text-center"
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            💬
          </motion.div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Questions About Our Policies?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            If you need clarification or have concerns about these policies, we dey here to help!
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

        {/* Quick Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold mb-2 dark:text-white">Your Data is Safe</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use industry-standard security measures to protect your information.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold mb-2 dark:text-white">Transparency First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We believe in being open about how we use your data.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold mb-2 dark:text-white">Your Rights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You have full control over your personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
