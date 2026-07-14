import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all transactions for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.user_id }).sort({ date: -1 });
    
    // Look up category names to join them
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.category_id] = c.category_name;
    });

    const formattedTransactions = transactions.map(t => ({
      id: t.transaction_id,
      merchant: t.merchant,
      category: categoryMap[t.category_id] || 'Others',
      amount: t.amount,
      date: t.date.toISOString().split('T')[0],
      notes: t.notes || '',
    }));

    res.json({ status: 'success', data: formattedTransactions });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Create new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { merchant, category, amount, date, notes } = req.body;

    if (!merchant || !category || amount === undefined) {
      return res.status(400).json({ status: 'error', message: 'Merchant, category and amount are required' });
    }

    // Find the category by name or ID
    let cat = await Category.findOne({
      $or: [
        { category_name: category },
        { category_id: category }
      ]
    });

    // If not found, default to 'Others' or create it
    if (!cat) {
      cat = await Category.findOne({ category_name: 'Others' });
      if (!cat) {
        cat = await Category.create({ category_name: 'Others' });
      }
    }

    const transaction = await Transaction.create({
      user_id: req.user.user_id,
      category_id: cat.category_id,
      amount: parseFloat(amount),
      merchant,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: transaction.transaction_id,
        merchant: transaction.merchant,
        category: cat.category_name,
        amount: transaction.amount,
        date: transaction.date.toISOString().split('T')[0],
        notes: transaction.notes || '',
      }
    });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { merchant, category, amount, date, notes } = req.body;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ transaction_id: id, user_id: req.user.user_id });
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    let cat;
    if (category) {
      cat = await Category.findOne({
        $or: [
          { category_name: category },
          { category_id: category }
        ]
      });
      if (!cat) {
        cat = await Category.findOne({ category_name: 'Others' });
      }
      transaction.category_id = cat.category_id;
    } else {
      cat = await Category.findOne({ category_id: transaction.category_id });
    }

    if (merchant !== undefined) transaction.merchant = merchant;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (date !== undefined) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.json({
      status: 'success',
      data: {
        id: transaction.transaction_id,
        merchant: transaction.merchant,
        category: cat ? cat.category_name : 'Others',
        amount: transaction.amount,
        date: transaction.date.toISOString().split('T')[0],
        notes: transaction.notes || '',
      }
    });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Transaction.deleteOne({ transaction_id: id, user_id: req.user.user_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    res.json({ status: 'success', message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
