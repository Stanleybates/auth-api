// SERVICE — handles business logic (hashing, token generation)
// The controller just calls the service; the service uses the repository
// This makes each layer responsible for ONE thing only

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// makeAuthService is a FACTORY that injects the repository
// If you pass a fake repository in tests, the service works identically
function makeAuthService(userRepository) {
  return {

    async signup(name, email, password) {
      // Check duplicate email
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        const error = new Error('Email already registered');
        error.status = 409;
        throw error;
      }

      // Hash password — this is business logic, belongs in service
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userRepository.create(name, email, hashedPassword);

      // Generate token
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { token, user: newUser };
    },

    async login(email, password) {
      const user = await userRepository.findByEmail(email);

      if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: { id: user.id, name: user.name, email: user.email }
      };
    }
  };
}

module.exports = makeAuthService;