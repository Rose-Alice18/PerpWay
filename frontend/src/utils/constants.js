// App-wide constants and configuration

export const APP_NAME = 'Perpway';

export const CONTACT_INFO = {
  email: 'info@perpway.com',
  phone: '+233 XX XXX XXXX',
  location: 'Ashesi University, Berekuso, Ghana',
};

export const SOCIAL_LINKS = {
  facebook: '#',
  instagram: '#',
  twitter: '#',
  whatsapp: '#',
};

export const DELIVERY_TYPES = {
  INSTANT: {
    id: 'instant',
    name: 'Instant Delivery',
    icon: '⚡',
    description: 'Same day delivery (2-4 hours)',
    priceRange: 'GHS 15-25',
    estimatedTime: '2-4 hours',
  },
  NEXT_DAY: {
    id: 'next-day',
    name: 'Next-Day Delivery',
    icon: '📅',
    description: 'Delivered tomorrow',
    priceRange: 'GHS 10-15',
    estimatedTime: '24 hours',
  },
  WEEKLY_STATION: {
    id: 'weekly-station',
    name: 'Weekly Station Pickup',
    icon: '📦',
    description: 'Pickup from campus station weekly',
    priceRange: 'GHS 5-8',
    estimatedTime: '3-7 days',
  },
};

export const VENDOR_CATEGORIES = {
  FRUIT: {
    id: 'fruit',
    name: 'Fruit Vendors',
    icon: '🍎',
    description: 'Fresh fruits daily',
  },
  TAILOR: {
    id: 'tailor',
    name: 'Tailors & Seamstresses',
    icon: '👗',
    description: 'Custom clothing and alterations',
  },
  BARBER: {
    id: 'barber',
    name: 'Barbers & Stylists',
    icon: '💈',
    description: 'Hair cuts and styling',
  },
  FOOD: {
    id: 'food',
    name: 'Food Vendors',
    icon: '🍲',
    description: 'Local dishes and meals',
  },
};

export const DRIVER_AVAILABILITY = {
  AVAILABLE: {
    id: 'available',
    label: 'Available',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  BUSY: {
    id: 'busy',
    label: 'Busy',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  OFFLINE: {
    id: 'offline',
    label: 'Offline',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
};

export const PAYMENT_METHODS = {
  MOMO: {
    id: 'momo',
    name: 'Mobile Money',
    icon: '📱',
    description: 'MTN, Vodafone, AirtelTigo',
  },
  CARD: {
    id: 'card',
    name: 'Card Payment',
    icon: '💳',
    description: 'Visa, Mastercard',
  },
};

export const TIP_AMOUNT = 2; // GHS

export const GHANA_COLORS = {
  RED: '#CE1126',
  YELLOW: '#FCD116',
  GREEN: '#006B3F',
  GOLD: '#FFD700',
};

export const MESSAGES = {
  // Success messages
  PAYMENT_SUCCESS: 'Chale, you fit see the contact now! 🎉',
  DELIVERY_SUCCESS: 'Your parcel dey on road already! 🚚💨',
  RIDE_POSTED: 'Ride posted successfully! 🚗',
  RIDE_JOINED: 'Request sent! The driver will contact you soon. 🎉',

  // Error messages
  PAYMENT_FAILED: 'Payment failed. Please try again!',
  DELIVERY_FAILED: 'Failed to submit request. Please try again!',
  RIDE_FULL: 'Sorry, this ride is full! 😔',
  NETWORK_ERROR: 'Network error. Please check your connection.',

  // Info messages
  TIP_TOOLTIP: 'Small tip den you go fit see number! 💰',
  NO_DRIVERS: 'No drivers found. Try changing your filter!',
  NO_VENDORS: 'No vendors found in this category.',
  NO_RIDES: 'No rides available. Be the first to post!',

  // Fun messages
  WELCOME: 'Welcome to Perpway! We dey here for you! 🎉',
  SMALL_TIP: 'Small tip go carry you far! 😄',
  LETS_GO: 'E be like say you ready to move? Make we go! 🚗💨',
  SORT_YOU_OUT: 'No wahala! We go sort you out! 👍',
};

export const POPULAR_DESTINATIONS = [
  'Ashesi Campus',
  'Madina',
  'Accra Mall',
  'Tema Station',
  'East Legon',
  'Circle',
  'Kaneshie',
  'Adenta',
];

export const ROUTES = {
  HOME: '/',
  DRIVERS: '/drivers',
  DELIVERY: '/delivery',
  SERVICES: '/services',
  RIDES: '/rides',
};

export const API_ENDPOINTS = {
  DRIVERS: '/api/drivers',
  VENDORS: '/api/vendors',
  DELIVERY: '/api/delivery/request',
  RIDES: '/api/rides',
  PAYMENTS: '/api/payments/tip',
};

// Validation patterns
export const VALIDATION = {
  PHONE_REGEX: /^0\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
};

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  slideDown: {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  scaleIn: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
};

export default {
  APP_NAME,
  CONTACT_INFO,
  SOCIAL_LINKS,
  DELIVERY_TYPES,
  VENDOR_CATEGORIES,
  DRIVER_AVAILABILITY,
  PAYMENT_METHODS,
  TIP_AMOUNT,
  GHANA_COLORS,
  MESSAGES,
  POPULAR_DESTINATIONS,
  ROUTES,
  API_ENDPOINTS,
  VALIDATION,
  ANIMATION_VARIANTS,
};
