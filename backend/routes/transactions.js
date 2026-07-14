import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all transactions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.user_id }).lean();
    const categoryIds = transactions.map(t => t.category_id);
    const categories = await Category.find({ category_id: { $in: categoryIds } });

    const categoryMap = categories.reduce((map, c) => {
      map[c.category_id] = c;
      return map;
    }, {});

    const enrichedTransactions = transactions.map(t => ({
      ...t,
      category_name: categoryMap[t.category_id]?.category_name || 'Unknown',
    }));

    // Sort by date descending, then createdAt descending
    enrichedTransactions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) return dateB - dateA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      status: 'success',
      data: { transactions: enrichedTransactions },
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Create a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { category_id, amount, merchant, date, notes } = req.body;

    if (!category_id || amount === undefined || !merchant || !date) {
      return res.status(400).json({ status: 'error', message: 'Category, amount, merchant, and date are required' });
    }

    if (amount < 0) {
      return res.status(400).json({ status: 'error', message: 'Amount cannot be negative' });
    }

    // Verify category exists
    const category = await Category.findOne({ category_id });
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    const transaction = await Transaction.create({
      user_id: req.user.user_id,
      category_id,
      amount,
      merchant,
      date,
      notes: notes || '',
    });

    res.status(201).json({
      status: 'success',
      data: {
        transaction: {
          ...transaction.toObject(),
          category_name: category.category_name,
        },
      },
    });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Update a transaction
router.put('/:transaction_id', auth, async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { category_id, amount, merchant, date, notes } = req.body;

    if (!category_id || amount === undefined || !merchant || !date) {
      return res.status(400).json({ status: 'error', message: 'Category, amount, merchant, and date are required' });
    }

    if (amount < 0) {
      return res.status(400).json({ status: 'error', message: 'Amount cannot be negative' });
    }

    // Verify category exists
    const category = await Category.findOne({ category_id });
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { transaction_id, user_id: req.user.user_id },
      { category_id, amount, merchant, date, notes: notes || '' },
      { new: true }
    ).lean();

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    res.json({
      status: 'success',
      data: {
        transaction: {
          ...transaction,
          category_name: category.category_name,
        },
      },
    });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Delete a transaction
router.delete('/:transaction_id', auth, async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ transaction_id, user_id: req.user.user_id });
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    res.json({
      status: 'success',
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
