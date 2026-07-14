import { Router } from 'express';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

const getCategoryMap = async () => {
  const categories = await Category.find();
  const catMap = {};
  categories.forEach(c => {
    catMap[c.category_id] = c.category_name;
  });
  return catMap;
};

// GET /api/budgets
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.user_id });
    const catMap = await getCategoryMap();

    const mapped = budgets.map(b => ({
      budget_id: b.budget_id,
      id: b.budget_id,
      user_id: b.user_id,
      category_id: b.category_id,
      category_name: catMap[b.category_id] || 'Others',
      name: catMap[b.category_id] || 'Others',
      limit: b.limit,
      type: b.type,
      period: b.type
    }));

    res.json({
      status: 'success',
      data: mapped,
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

    let targetCategoryId = category_id;
    if (!targetCategoryId && (name || category_name)) {
      const found = await Category.findOne({ category_name: name || category_name });
      if (found) targetCategoryId = found.category_id;
    }

    const resolvedType = type || period || 'monthly';

    if (!targetCategoryId || limit === undefined) {
      return res.status(400).json({ status: 'error', message: 'Category and limit are required' });
    }

    const budget = await Budget.create({
      user_id: req.user.user_id,
      category_id: targetCategoryId,
      limit: parseFloat(limit),
      type: resolvedType,
    });

    const catMap = await getCategoryMap();

    res.status(201).json({
      status: 'success',
      data: {
        budget_id: budget.budget_id,
        id: budget.budget_id,
        user_id: budget.user_id,
        category_id: budget.category_id,
        category_name: catMap[budget.category_id] || 'Others',
        name: catMap[budget.category_id] || 'Others',
        limit: budget.limit,
        type: budget.type,
        period: budget.type
      },
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

    const budget = await Budget.findOne({ budget_id: req.params.id, user_id: req.user.user_id });
    if (!budget) {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }

    let targetCategoryId = category_id;
    if (!targetCategoryId && (name || category_name)) {
      const found = await Category.findOne({ category_name: name || category_name });
      if (found) targetCategoryId = found.category_id;
    }

    const resolvedType = type || period;

    if (targetCategoryId) budget.category_id = targetCategoryId;
    if (limit !== undefined) budget.limit = parseFloat(limit);
    if (resolvedType) budget.type = resolvedType;

    await budget.save();

    const catMap = await getCategoryMap();

    res.json({
      status: 'success',
      data: {
        budget_id: budget.budget_id,
        id: budget.budget_id,
        user_id: budget.user_id,
        category_id: budget.category_id,
        category_name: catMap[budget.category_id] || 'Others',
        name: catMap[budget.category_id] || 'Others',
        limit: budget.limit,
        type: budget.type,
        period: budget.type
      },
    });
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ budget_id: req.params.id, user_id: req.user.user_id });
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
