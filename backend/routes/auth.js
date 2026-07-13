import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();

const signToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);

    res.status(201).json({
      status: 'success',
      data: { user: { user_id: user.user_id, name: user.name, email: user.email }, token },
    });
  } catch (err) {
    // Handle the race condition where two requests with the same email
    // pass findOne at the same time; the unique index catches it here.
    if (err.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }
    console.error('Register error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      status: 'success',
      data: { user: { user_id: user.user_id, name: user.name, email: user.email }, token },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({ status: 'success', data: { user: { user_id: user.user_id, name: user.name, email: user.email } } });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;