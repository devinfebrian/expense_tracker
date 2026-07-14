import { Router } from 'express';
import Transaction from '../models/Transaction.js';
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

// GET /api/transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.user_id }).sort({ date: -1, createdAt: -1 });
    const catMap = await getCategoryMap();
    
    const mapped = transactions.map(t => ({
      transaction_id: t.transaction_id,
      id: t.transaction_id,
      user_id: t.user_id,
      category_id: t.category_id,
      category: catMap[t.category_id] || 'Others',
      amount: t.amount,
      merchant: t.merchant,
      date: t.date,
      notes: t.notes,
      createdAt: t.createdAt
    }));

    res.json({
      status: 'success',
      data: mapped,
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
    
    let targetCategoryId = category_id;
    if (!targetCategoryId && category) {
      const found = await Category.findOne({ category_name: category });
      if (found) targetCategoryId = found.category_id;
    }

    if (!merchant || !targetCategoryId || amount === undefined || !date) {
      return res.status(400).json({ status: 'error', message: 'Merchant, category link, amount, and date are required' });
    }

    const transaction = await Transaction.create({
      user_id: req.user.user_id,
      merchant,
      category_id: targetCategoryId,
      amount: parseFloat(amount),
      date,
      notes: notes || '',
    });

    const catMap = await getCategoryMap();

    res.status(201).json({
      status: 'success',
      data: {
        transaction_id: transaction.transaction_id,
        id: transaction.transaction_id,
        user_id: transaction.user_id,
        category_id: transaction.category_id,
        category: catMap[transaction.category_id] || 'Others',
        amount: transaction.amount,
        merchant: transaction.merchant,
        date: transaction.date,
        notes: transaction.notes,
        createdAt: transaction.createdAt
      },
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

    const transaction = await Transaction.findOne({ transaction_id: req.params.id, user_id: req.user.user_id });
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    let targetCategoryId = category_id;
    if (!targetCategoryId && category) {
      const found = await Category.findOne({ category_name: category });
      if (found) targetCategoryId = found.category_id;
    }

    if (merchant) transaction.merchant = merchant;
    if (targetCategoryId) transaction.category_id = targetCategoryId;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (date) transaction.date = date;
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    const catMap = await getCategoryMap();

    res.json({
      status: 'success',
      data: {
        transaction_id: transaction.transaction_id,
        id: transaction.transaction_id,
        user_id: transaction.user_id,
        category_id: transaction.category_id,
        category: catMap[transaction.category_id] || 'Others',
        amount: transaction.amount,
        merchant: transaction.merchant,
        date: transaction.date,
        notes: transaction.notes,
        createdAt: transaction.createdAt
      },
    });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ transaction_id: req.params.id, user_id: req.user.user_id });
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
