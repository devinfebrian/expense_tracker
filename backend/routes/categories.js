import { Router } from 'express';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all categories (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json({
      status: 'success',
      data: { categories },
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
