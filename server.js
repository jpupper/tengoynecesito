require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3090;
const BASE_PATH = process.env.BASE_PATH || '/tengoynecesito';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: [
    "https://fullscreencode.com",
    "https://www.fullscreencode.com",
    "https://vps-4455523-x.dattaweb.com",
    "http://localhost:3090",
    "http://localhost:3000",
    "http://localhost:3027"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files with prefix (for production behind Nginx)
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));
// Also serve without prefix (for local development)
app.use(express.static(path.join(__dirname, 'public')));

// Routes - with prefix for production
app.use(BASE_PATH + '/api/products', require('./routes/products'));
app.use(BASE_PATH + '/api/users', require('./routes/users'));
app.use(BASE_PATH + '/api/transactions', require('./routes/transactions'));

// Routes without prefix (for local dev and fallback)
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));

// Health check
app.get(BASE_PATH + '/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', app: 'tengoynecesito', timestamp: new Date() });
});
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', app: 'tengoynecesito', timestamp: new Date() });
});

// SPA-like fallback: serve index.html for root paths
app.get(BASE_PATH, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get(BASE_PATH + '/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to DB and start server
connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] TengoYNecesito corriendo en puerto ${PORT}`);
    console.log(`[Server] Base path: ${BASE_PATH}`);
    console.log(`[Server] Modo: ${process.env.NODE_ENV || 'local'}`);
  });
});

module.exports = app;
