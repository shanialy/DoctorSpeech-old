//--------------------------------------------------------
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../env/config');

async function connectToDatabase() {

  try {

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('Connected to MongoDB Atlas!');
  } catch (error) {
    console.error('Failed to connect:', error);
  } 
}

module.exports = { connectToDatabase };
