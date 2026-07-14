import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/debug', async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.json({ status: 'success', data: { transactions, count: transactions.length } });
  } catch (err) {
    console.error('Debug transactions error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, period, search } = req.query;
    const filter = { user_id: req.user.user_id };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { merchant: { $regex: regex } },
        { notes: { $regex: regex } },
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (period && period !== 'all') {
      const now = new Date();
      let start;
      if (period === 'daily') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'weekly' || period === 'last7') {
        start = new Date(now);
        start.setDate(start.getDate() - 7);
      } else if (period === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'last30') {
        start = new Date(now);
        start.setDate(start.getDate() - 30);
      }
      if (start) filter.date = { $gte: start };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ status: 'success', data: { transactions } });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { period } = req.query;
    const filter = { user_id: req.user.user_id };

    if (period && period !== 'all') {
      const now = new Date();
      let start;
      if (period === 'daily') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'weekly' || period === 'last7') {
        start = new Date(now);
        start.setDate(start.getDate() - 7);
      } else if (period === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'last30') {
        start = new Date(now);
        start.setDate(start.getDate() - 30);
      }
      if (start) filter.date = { $gte: start };
    }

    const transactions = await Transaction.find(filter);
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const count = transactions.length;

    res.json({
      status: 'success',
      data: {
        total,
        count,
        average: count > 0 ? Math.round(total / count) : 0,
      },
    });
  } catch (err) {
    console.error('Get summary error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { merchant, category, amount, date, notes } = req.body;
    if (!merchant || !category || amount === undefined || !date) {
      return res.status(400).json({ status: 'error', message: 'Merchant, category, amount, and date are required' });
    }
    const transaction = await Transaction.create({
      user_id: req.user.user_id,
      merchant,
      category,
      amount,
      date,
      notes: notes || '',
    });
    res.status(201).json({ status: 'success', data: { transaction } });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    console.error('Create transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { merchant, category, amount, date, notes } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.user_id },
      { merchant, category, amount, date, notes },
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    res.json({ status: 'success', data: { transaction } });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    console.error('Update transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.user_id,
    });
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    res.json({ status: 'success', message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
