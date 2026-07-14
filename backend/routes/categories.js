import { Router } from 'express';
import auth from '../middleware/auth.js';

const router = Router();

const categoryNames = [
  '🍚 Food & Drinks',
  '🚌 Transportation',
  '📚 Education',
  '🏠 Living Expenses',
  '🎉 Personal & Entertainment'
];

// GET /api/categories
router.get('/', auth, (req, res) => {
  const mapped = categoryNames.map((name, i) => ({
    id: (i + 1).toString(),
    category_id: (i + 1).toString(),
    category_name: name,
    name: name
  }));
  res.json({
    status: 'success',
    data: mapped,
  });
});

export default router;
