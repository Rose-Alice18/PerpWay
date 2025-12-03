import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: '📜' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
  ];

  const termsContent = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Perpway, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.',
    },
    {
      title: '2. User Accounts',
      content: 'You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must provide accurate and complete information when creating your account.',
    },
    {
      title: '3. Use of Services',
      content: 'Perpway provides a platform to connect students with drivers, delivery services, local vendors, and ride-sharing opportunities. We act as a facilitator and are not directly responsible for the services provided by third-party vendors or drivers. You agree to use our services only for lawful purposes and in accordance with these terms.',
    },
    {
      title: '4. Driver Finder Service',
      content: 'The Driver Finder service provides access to contact information for verified drivers. A small tip is required to access this information. Once you receive driver contacts, you deal directly with the drivers for all ride arrangements and payments. Perpway is not responsible for the quality of service provided by drivers.',
    },
    {
      title: '5. Delivery Service',
      content: 'Our delivery service facilitates the transport of items to campus. We strive to deliver within the specified timeframes but cannot guarantee exact delivery times. We are not liable for delays caused by circumstances beyond our control. Items must be legal and safe to transport. We reserve the right to refuse delivery of any item.',
    },
    {
      title: '6. Payment and Fees',
      content: 'All fees and prices are displayed in Ghana Cedis (GHS). Payments are processed through mobile money or cash as specified for each service. All sales are final unless otherwise stated. We reserve the right to modify our fees at any time with notice.',
    },
    {
      title: '7. Ride Pairing',
      content: 'The ride pairing service connects users heading in the same direction. Users arrange rides and payments directly with each other. Perpway is not responsible for the safety, quality, or legality of ride-sharing arrangements. Users should exercise caution and use good judgment when participating in ride-sharing.',
    },
    {
      title: '8. User Conduct',
      content: 'You agree not to: (a) violate any laws or regulations; (b) infringe on the rights of others; (c) harass, abuse, or harm others; (d) use the platform for fraudulent purposes; (e) interfere with the proper functioning of the platform; (f) upload malicious code or viruses; (g) collect user information without consent.',
    },
    {
      title: '9. Intellectual Property',
      content: 'All content on Perpway, including text, graphics, logos, and software, is the property of Perpway or its licensors and is protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or reproduce any content without our express written permission.',
    },
    {
      title: '10. Disclaimers and Limitations',
      content: 'Perpway is provided "as is" without warranties of any kind. We do not guarantee uninterrupted, secure, or error-free service. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid for services in the past 30 days.',
    },
    {
      title: '11. Termination',
      content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason. Upon termination, your right to use the platform will immediately cease. Provisions that should survive termination will remain in effect.',
    },
    {
      title: '12. Changes to Terms',
      content: 'We may modify these Terms of Service at any time. We will notify users of significant changes through the platform or via email. Your continued use of Perpway after changes constitutes acceptance of the modified terms.',
    },
    {
      title: '13. Governing Law',
      content: 'These terms are governed by the laws of Ghana. Any disputes arising from these terms or your use of Perpway will be resolved in the courts of Ghana.',
    },
    {
      title: '14. Contact Information',
      content: 'If you have questions about these Terms of Service, please contact us through our Contact page or email us at support@perpway.com.',
    },
  ];

  const privacyContent = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, including: name, email address, phone number, and any other information you choose to provide. We also collect information automatically when you use our platform, such as device information, IP address, browser type, and usage patterns.',
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to: (a) provide, maintain, and improve our services; (b) process transactions and send related information; (c) communicate with you about services, updates, and promotional offers; (d) monitor and analyze usage patterns; (e) detect and prevent fraud and abuse; (f) comply with legal obligations.',
    },
    {
      title: '3. Information Sharing',
      content: 'We may share your information with: (a) service providers who help us operate the platform; (b) drivers and vendors when you use our services; (c) other users when you participate in ride-sharing; (d) law enforcement when required by law; (e) business partners with your consent. We do not sell your personal information to third parties.',
    },
    {
      title: '4. Driver and Vendor Contact Information',
      content: 'When you use the Driver Finder service or browse local vendors, you gain access to their contact information. Similarly, when you request deliveries or rides, your contact information may be shared with drivers and vendors to facilitate the service.',
    },
    {
      title: '5. Data Security',
      content: 'We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.',
    },
    {
      title: '6. Data Retention',
      content: 'We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legitimate business purposes or as required by law, even after account closure.',
    },
    {
      title: '7. Your Rights and Choices',
      content: 'You have the right to: (a) access and update your personal information; (b) request deletion of your account and data; (c) opt-out of promotional communications; (d) object to certain data processing; (e) request a copy of your data. Contact us to exercise these rights.',
    },
    {
      title: '8. Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to improve user experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings, but disabling cookies may limit some functionality.',
    },
    {
      title: '9. Third-Party Links',
      content: 'Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.',
    },
    {
      title: '10. Children\'s Privacy',
      content: 'Perpway is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.',
    },
    {
      title: '11. International Users',
      content: 'Perpway operates primarily in Ghana. If you access our platform from outside Ghana, please be aware that your information may be transferred to, stored, and processed in Ghana.',
    },
    {
      title: '12. Changes to Privacy Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes through the platform or via email. Your continued use after changes constitutes acceptance of the updated policy.',
    },
    {
      title: '13. Contact Us',
      content: 'If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our Contact page or email us at privacy@perpway.com.',
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
          Legal Information
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Understanding your rights and our commitments to you 🤝
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
                  ? 'These Terms of Service govern your use of Perpway. Please read them carefully before using our platform.'
                  : 'This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use Perpway.'}
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
