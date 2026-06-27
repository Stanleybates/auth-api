// Routes now wire everything together using DI
// This is where we inject the real repository into the service,
// then inject the service into the controller
const express = require('express');
const router = express.Router();

const userRepository = require('../repositories/userRepository');
const makeAuthService = require('../services/authService');
const makeAuthController = require('../controllers/authController');

// Inject repository → service → controller
const authService = makeAuthService(userRepository);
const authController = makeAuthController(authService);

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));

module.exports = router;