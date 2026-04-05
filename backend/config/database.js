require('dotenv').config();
// const { Pool } = require('pg');
const mongoose = require('mongoose');

// MongoDB configuration
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillcert';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = {
  mongoose,
};