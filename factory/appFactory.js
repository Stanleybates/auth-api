// FACTORY — the composition root of the entire app
// This is the ONE place that knows how all pieces connect
// Everything else is decoupled — they don't know about each other

const userRepository = require('../repositories/userRepository');
const makeAuthService = require('../services/authService');
const makeAuthController = require('../controllers/authController');

function createApp(express) {
  const app = express();

  // Wire up the dependency chain:
  // repository → service → controller → routes
  const authService = makeAuthService(userRepository);
  const authController = makeAuthController(authService);

  // Return the controller so routes can use it
  // You could also return the full router here
  return { app, authController };
}

module.exports = createApp;