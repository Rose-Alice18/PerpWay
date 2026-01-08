const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for shopping images
const shoppingStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perpway/shopping',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

// Create storage for delivery images
const deliveryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perpway/delivery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

// Create storage for vendor images
const vendorStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perpway/vendors',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

// Create multer upload instances
const uploadShopping = multer({ storage: shoppingStorage });
const uploadDelivery = multer({ storage: deliveryStorage });
const uploadVendor = multer({ storage: vendorStorage });

module.exports = {
  cloudinary,
  uploadShopping,
  uploadDelivery,
  uploadVendor
};
