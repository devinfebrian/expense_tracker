import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.user_id }).sort({ date: -1, createdAt: -1 });
    res.json({
      status: 'success',
      data: transactions,
    });
  } catch (err) {
    console.error('Fetch transactions error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// POST /api/transactions
router.post('/', auth, async (req, res) => {
  try {
    const { merchant, category, category_id, amount, date, notes } = req.body;
    
    let resolvedCategory = category;
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

    if (!merchant || !resolvedCategory || amount === undefined || !date) {
      return res.status(400).json({ status: 'error', message: 'Merchant, category, amount, and date are required' });
    }

    const transaction = await Transaction.create({
      user_id: req.user.user_id,
      merchant,
      category: resolvedCategory,
      amount: parseFloat(amount),
      date,
      notes: notes || '',
    });

    res.status(201).json({
      status: 'success',
      data: transaction,
    });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { merchant, category, category_id, amount, date, notes } = req.body;

    const transaction = await Transaction.findOne({ _id: req.params.id, user_id: req.user.user_id });
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    let resolvedCategory = category;
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

    if (merchant) transaction.merchant = merchant;
    if (resolvedCategory) transaction.category = resolvedCategory;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (date) transaction.date = date;
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.json({
      status: 'success',
      data: transaction,
    });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user_id: req.user.user_id });
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
