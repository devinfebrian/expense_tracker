import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    res.status(500).json({ status: 'error', message: err.message });
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
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ user_id: decoded.user_id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({ status: 'success', data: { user: { user_id: user.user_id, name: user.name, email: user.email } } });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
});

export default router;
