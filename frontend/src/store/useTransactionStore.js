import { create } from 'zustand';
import api from '../api/axios.js';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  categories: [],
  loading: false,

  loadTransactions: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/transactions');
      set({ transactions: res.data.data.transactions || res.data.data || [] });
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      set({ loading: false });
    }
  },

  loadCategories: async () => {
    try {
      const res = await api.get('/categories');
      set({ categories: res.data.data.categories || res.data.data || [] });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  },

  addTransaction: async (formPayload) => {
    const res = await api.post('/transactions', {
      merchant: formPayload.merchant,
      category_id: formPayload.category_id,
      amount: parseFloat(formPayload.amount),
      date: formPayload.date,
      notes: formPayload.notes
    });
    // Dynamically insert new transaction to state to avoid refetching
    const newTxn = res.data.data;
    set(state => ({
      transactions: [newTxn, ...state.transactions]
    }));
    return newTxn;
  },

  editTransaction: async (id, formPayload) => {
    const res = await api.put(`/transactions/${id}`, {
      merchant: formPayload.merchant,
      category_id: formPayload.category_id,
      amount: parseFloat(formPayload.amount),
      date: formPayload.date,
      notes: formPayload.notes
    });
    const updatedTxn = res.data.data;
    set(state => ({
      transactions: state.transactions.map(t => (t.transaction_id === id || t.id === id) ? { ...t, ...updatedTxn } : t)
    }));
    return updatedTxn;
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);
    set(state => ({
      transactions: state.transactions.filter(t => t.transaction_id !== id && t.id !== id)
    }));
  }
}));
