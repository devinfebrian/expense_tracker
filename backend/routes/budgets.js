import { Router } from 'express';
import Budget from '../models/Budget.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/budgets
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.user_id });
    res.json({
      status: 'success',
      data: budgets,
    });
  } catch (err) {
    console.error('Fetch budgets error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// POST /api/budgets
router.post('/', auth, async (req, res) => {
  try {
    const { name, category_name, category_id, limit, period, type } = req.body;

    let resolvedCategory = name || category_name;
    if (!resolvedCategory && category_id) {
      const categoryNames = [
        '🍚 Food & Drinks',
        '🚌 Transportation',
        '📚 Education',
        '🏠 Living Expenses',
        '🎉 Personal & Entertainment'
      ];
      const idx = parseInt(category_id) - 1;
      resolvedCategory = (idx >= 0 && idx < categoryNames.length) ? categoryNames[idx] : 'Others';
    }

    const resolvedType = period || type || 'monthly';

    if (!resolvedCategory || limit === undefined) {
      return res.status(400).json({ status: 'error', message: 'Category name and limit are required' });
    }

    const budget = await Budget.create({
      user_id: req.user.user_id,
      category_name: resolvedCategory,
      limit: parseFloat(limit),
      type: resolvedType,
    });

    res.status(201).json({
      status: 'success',
      data: budget,
    });
  } catch (err) {
    console.error('Create budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category_name, category_id, limit, period, type } = req.body;

    const budget = await Budget.findOne({ _id: req.params.id, user_id: req.user.user_id });
    if (!budget) {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }

    let resolvedCategory = name || category_name;
    if (!resolvedCategory && category_id) {
      const categoryNames = [
        '🍚 Food & Drinks',
        '🚌 Transportation',
        '📚 Education',
        '🏠 Living Expenses',
        '🎉 Personal & Entertainment'
      ];
      const idx = parseInt(category_id) - 1;
      resolvedCategory = (idx >= 0 && idx < categoryNames.length) ? categoryNames[idx] : 'Others';
    }

    const resolvedType = period || type;

    if (resolvedCategory) budget.category_name = resolvedCategory;
    if (limit !== undefined) budget.limit = parseFloat(limit);
    if (resolvedType) budget.type = resolvedType;

    await budget.save();

    res.json({
      status: 'success',
      data: budget,
    });
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user_id: req.user.user_id });
    if (!budget) {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }

    res.json({
      status: 'success',
      message: 'Budget deleted successfully',
    });
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
