import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

const getCategoryMap = async () => {
  const categories = await Category.find();
  const catMap = {};
  categories.forEach(c => {
    catMap[c.category_id] = c.category_name;
  });
  return catMap;
};

export const fetchTransactionsByUserId = async (user_id) => {
  const transactions = await Transaction.find({ user_id }).sort({ date: -1, createdAt: -1 });
  const catMap = await getCategoryMap();
  
  return transactions.map(t => ({
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
};

export const createTransaction = async (user_id, { merchant, category, category_id, amount, date, notes }) => {
  let targetCategoryId = category_id;
  if (!targetCategoryId && category) {
    const found = await Category.findOne({ category_name: category });
    if (found) targetCategoryId = found.category_id;
  }

  if (!merchant || !targetCategoryId || amount === undefined || !date) {
    const err = new Error('Merchant, category, amount, and date are required');
    err.statusCode = 400;
    throw err;
  }

  const transaction = await Transaction.create({
    user_id,
    merchant,
    category_id: targetCategoryId,
    amount: parseFloat(amount),
    date,
    notes: notes || '',
  });

  const catMap = await getCategoryMap();
  return {
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
  };
};

export const updateTransaction = async (user_id, transaction_id, { merchant, category, category_id, amount, date, notes }) => {
  const transaction = await Transaction.findOne({ transaction_id, user_id });
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
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
  return {
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
  };
};

export const deleteTransaction = async (user_id, transaction_id) => {
  const transaction = await Transaction.findOneAndDelete({ transaction_id, user_id });
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  return true;
};
