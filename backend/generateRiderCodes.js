// Script to generate rider codes for existing riders
const mongoose = require('mongoose');
const MotorRider = require('./models/MotorRider');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/perpway', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

async function generateRiderCodes() {
  try {
    // Get all riders without a riderCode
    const riders = await MotorRider.find({
      $or: [
        { riderCode: { $exists: false } },
        { riderCode: null },
        { riderCode: '' }
      ]
    });

    console.log(`Found ${riders.length} riders without codes`);

    for (const rider of riders) {
      // Generate code
      const namePrefix = rider.name.replace(/\s/g, '').substring(0, 3).toUpperCase();
      const phoneDigits = rider.phone.replace(/\D/g, '').slice(-4);
      rider.riderCode = `${namePrefix}${phoneDigits}`;

      await rider.save();
      console.log(`✅ Generated code for ${rider.name}: ${rider.riderCode}`);
    }

    console.log('\n🎉 All rider codes generated successfully!');
    console.log('\nRider Codes:');

    const allRiders = await MotorRider.find({});
    allRiders.forEach(rider => {
      console.log(`  ${rider.name}: ${rider.riderCode}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateRiderCodes();
