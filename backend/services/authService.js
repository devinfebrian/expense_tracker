import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const registerUser = async (name, email, password) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password });
  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  return user;
};

export const signToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, name: user.name, email: user.email, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const updateUserProfile = async (user_id, name, email, avatar) => {
  const existing = await User.findOne({ email, user_id: { $ne: user_id } });
  if (existing) {
    const err = new Error('Email already registered by another account');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.findOneAndUpdate(
    { user_id },
    { name, email, avatar },
    { returnDocument: 'after', runValidators: true }
  );

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

export const updateUserPassword = async (user_id, currentPassword, newPassword) => {
  const user = await User.findOne({ user_id }).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  await user.save();
};
