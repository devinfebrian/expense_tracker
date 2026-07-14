import { Router } from 'express';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ category_name: 1 });
    const mapped = categories.map(c => ({
      id: c.category_id,
      category_id: c.category_id,
      category_name: c.category_name,
      name: c.category_name
    }));
    res.json({
      status: 'success',
      data: mapped,
    });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
