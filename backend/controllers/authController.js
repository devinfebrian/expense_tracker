import * as authService from '../services/authService.js';

const sendError = (res, err) => {
  const clientErrors = new Set(['CastError', 'ValidationError']);
  const status = err.statusCode || (clientErrors.has(err.name) ? 400 : 500);
  const expose = err.statusCode || clientErrors.has(err.name);
  if (!expose) console.error('Auth controller error:', err);
  res.status(status).json({
    status: 'error',
    message: expose ? err.message : 'Internal server error',
  });
};

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
  avatar: user.avatar,
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
    sendError(res, err);
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
    sendError(res, err);
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

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!name || !email) {
      return res.status(400).json({ status: 'error', message: 'Name and email are required' });
    }
    const updatedUser = await authService.updateUserProfile(req.user.user_id, name, email, avatar);
    
    // Sign a new token for the updated user
    const token = authService.signToken(updatedUser);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      status: 'success',
      data: { user: attachUser(updatedUser) },
    });
  } catch (err) {
    sendError(res, err);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ status: 'error', message: 'New password must be at least 8 characters' });
    }
    await authService.updateUserPassword(req.user.user_id, currentPassword, newPassword);
    res.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (err) {
    sendError(res, err);
  }
};
