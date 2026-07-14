import { Router } from 'express';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all budgets for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.user_id });
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.category_id] = c.category_name;
    });

    const formattedBudgets = budgets.map(b => ({
      id: b._id.toString(),
      name: categoryMap[b.category_id] || 'Others',
      limit: b.limit,
      period: b.monthly ? 'monthly' : (b.daily ? 'daily' : 'weekly'),
    }));

    res.json({ status: 'success', data: formattedBudgets });
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Create new budget
router.post('/', auth, async (req, res) => {
  try {
    const { name, limit, period } = req.body;

    if (!name || limit === undefined || !period) {
      return res.status(400).json({ status: 'error', message: 'Category name, limit and period are required' });
    }

    let cat = await Category.findOne({ category_name: name });
    if (!cat) {
      cat = await Category.create({ category_name: name });
    }

    const existing = await Budget.findOne({ user_id: req.user.user_id, category_id: cat.category_id });
    if (existing) {
      return res.status(400).json({ status: 'error', message: `A budget for "${name}" already exists.` });
    }

    const monthly = period === 'monthly';
    const daily = period === 'daily';

    const budget = await Budget.create({
      user_id: req.user.user_id,
      category_id: cat.category_id,
      limit: parseFloat(limit),
      monthly,
      daily,
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: budget._id.toString(),
        name: cat.category_name,
        limit: budget.limit,
        period: period,
      }
    });
  } catch (err) {
    console.error('Create budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Update budget
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, limit, period } = req.body;
    const { id } = req.params;

    const budget = await Budget.findOne({ _id: id, user_id: req.user.user_id });
    if (!budget) {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }

    let cat = await Category.findOne({ category_name: name });
    if (!cat) {
      cat = await Category.create({ category_name: name });
    }

    // Check if updating to another category that already has a budget
    if (budget.category_id !== cat.category_id) {
      const existing = await Budget.findOne({ user_id: req.user.user_id, category_id: cat.category_id });
      if (existing) {
        return res.status(400).json({ status: 'error', message: `A budget for "${name}" already exists.` });
      }
      budget.category_id = cat.category_id;
    }

    if (limit !== undefined) budget.limit = parseFloat(limit);
    if (period !== undefined) {
      budget.monthly = period === 'monthly';
      budget.daily = period === 'daily';
    }

    await budget.save();

    res.json({
      status: 'success',
      data: {
        id: budget._id.toString(),
        name: cat.category_name,
        limit: budget.limit,
        period: period || (budget.monthly ? 'monthly' : (budget.daily ? 'daily' : 'weekly')),
      }
    });
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Delete budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Budget.deleteOne({ _id: id, user_id: req.user.user_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }

    res.json({ status: 'success', message: 'Budget deleted successfully' });
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
