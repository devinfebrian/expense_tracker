import { Router } from 'express';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all budgets for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.user_id }).lean();
    const categoryIds = budgets.map(b => b.category_id);
    const categories = await Category.find({ category_id: { $in: categoryIds } });
    
    const categoryMap = categories.reduce((map, c) => {
      map[c.category_id] = c;
      return map;
    }, {});

    const enrichedBudgets = budgets.map(b => ({
      ...b,
      category_name: categoryMap[b.category_id]?.category_name || 'Unknown',
    }));

    res.json({
      status: 'success',
      data: { budgets: enrichedBudgets },
    });
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Create a new budget
router.post('/', auth, async (req, res) => {
  try {
    const { category_id, limit, type } = req.body;

    if (!category_id || limit === undefined || !type) {
      return res.status(400).json({ status: 'error', message: 'Category, limit, and type are required' });
    }

    if (limit < 0) {
      return res.status(400).json({ status: 'error', message: 'Limit cannot be negative' });
    }

    if (!['monthly', 'daily', 'weekly'].includes(type)) {
      return res.status(400).json({ status: 'error', message: 'Invalid budget type' });
    }

    // Verify category exists
    const category = await Category.findOne({ category_id });
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    // Check duplicate budget for user, category, and type
    const exists = await Budget.findOne({
      user_id: req.user.user_id,
      category_id,
      type,
    });

    if (exists) {
      return res.status(409).json({
        status: 'error',
        message: `A ${type} budget for this category already exists.`,
      });
    }

    const budget = await Budget.create({
      user_id: req.user.user_id,
      category_id,
      limit,
      type,
    });

    res.status(201).json({
      status: 'success',
      data: {
        budget: {
          ...budget.toObject(),
          category_name: category.category_name,
        },
      },
    });
  } catch (err) {
    console.error('Create budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Update a budget
router.put('/:budget_id', auth, async (req, res) => {
  try {
    const { budget_id } = req.params;
    const { category_id, limit, type } = req.body;

    if (!category_id || limit === undefined || !type) {
      return res.status(400).json({ status: 'error', message: 'Category, limit, and type are required' });
    }

    if (limit < 0) {
      return res.status(400).json({ status: 'error', message: 'Limit cannot be negative' });
    }

    if (!['monthly', 'daily', 'weekly'].includes(type)) {
      return res.status(400).json({ status: 'error', message: 'Invalid budget type' });
    }

    // Verify category exists
    const category = await Category.findOne({ category_id });
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    // Check duplicate budget if updating category_id or type
    const duplicate = await Budget.findOne({
      user_id: req.user.user_id,
      category_id,
      type,
      budget_id: { $ne: budget_id },
    });

    if (duplicate) {
      return res.status(409).json({
        status: 'error',
        message: `A ${type} budget for this category already exists.`,
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { budget_id, user_id: req.user.user_id },
      { category_id, limit, type },
      { new: true }
    ).lean();

    if (!budget) {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }

    res.json({
      status: 'success',
      data: {
        budget: {
          ...budget,
          category_name: category.category_name,
        },
      },
    });
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Delete a budget
router.delete('/:budget_id', auth, async (req, res) => {
  try {
    const { budget_id } = req.params;

    const budget = await Budget.findOneAndDelete({ budget_id, user_id: req.user.user_id });
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
