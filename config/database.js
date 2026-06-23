const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fullscreen_global';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[DB] Conectado a MongoDB:', MONGODB_URI);
  } catch (err) {
    console.error('[DB] Error de conexion:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
