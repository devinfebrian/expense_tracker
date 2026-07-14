import * as authService from '../services/authService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const attachUser = (user) => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' });
    }

    const user = await authService.registerUser(name, email, password);
    const token = authService.signToken(user);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({
      status: 'success',
      data: { user: attachUser(user) },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await authService.loginUser(email, password);
    const token = authService.signToken(user);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({
      status: 'success',
      data: { user: attachUser(user) },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ status: 'success', message: 'Logged out successfully' });
};

export const getMe = (req, res) => {
  res.json({
    status: 'success',
    data: { user: req.user },
  });
};
