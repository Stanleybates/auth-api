const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve index.html from the public/ folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./auth');
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Auth API is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});