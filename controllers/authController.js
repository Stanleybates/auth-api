function makeAuthController(authService) {
  return {

    async signup(req, res) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      try {
        const result = await authService.signup(name, email, password);
        res.status(201).json({ message: 'Account created', ...result });
      } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
      }
    },

    async login(req, res) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      try {
        const result = await authService.login(email, password);
        res.json({ message: 'Login successful', ...result });
      } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
      }
    }
  };
}

module.exports = makeAuthController;
