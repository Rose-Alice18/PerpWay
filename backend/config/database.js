const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // Mongoose 6+ doesn't need useNewUrlParser and useUnifiedTopology options
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/theashway');

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;
