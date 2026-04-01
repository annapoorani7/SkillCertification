require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');

// Postgres configuration
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://skillcert:skillcert_password@localhost:5432/skillcert_dev',
});

pgPool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

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
  pgPool,
  mongoose,
};