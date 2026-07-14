import api from './axios.js';

const getCategoryIcon = (cat) => {
  const c = cat.toLowerCase();
  if (c === 'food') return 'restaurant';
  if (c === 'transport') return 'directions_car';
  if (c === 'shopping') return 'shopping_bag';
  if (c === 'bills') return 'electric_bolt';
  if (c === 'housing') return 'home';
  if (c === 'entertainment') return 'movie';
  return 'account_balance_wallet';
};

const getCategoryClass = (cat) => {
  const c = cat.toLowerCase();
  if (c === 'food') return 'bg-secondary-container text-on-secondary-fixed-variant';
  if (c === 'housing') return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
  return 'surface-container-highest text-primary';
};

const transformTransaction = (t) => ({
  id: t._id,
  merchant: t.merchant,
  category: t.category,
  amount: t.amount,
  date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
  notes: t.notes || '',
  icon: getCategoryIcon(t.category),
  categoryClass: getCategoryClass(t.category),
});

export const fetchTransactions = async (params = {}) => {
  const res = await api.get('/transactions', { params });
  return res.data.data.transactions.map(transformTransaction);
};

export const createTransaction = async (data) => {
  const res = await api.post('/transactions', data);
  return transformTransaction(res.data.data.transaction);
};

export const updateTransaction = async (id, data) => {
  const res = await api.put(`/transactions/${id}`, data);
  return transformTransaction(res.data.data.transaction);
};

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`);
};
