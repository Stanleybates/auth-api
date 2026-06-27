// index.js is now clean — it just starts the server
// All wiring is handled by the factory
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const createApp = require('./factory/appFactory');
const { app, authController } = createApp(express);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes — controller already has its dependencies injected by the factory
app.post('/auth/signup', authController.signup.bind(authController));
app.post('/auth/login', authController.login.bind(authController));

app.get('/health', (req, res) => {
  res.json({ message: 'Auth API is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});