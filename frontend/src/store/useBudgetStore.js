import { create } from 'zustand';
import api from '../api/axios.js';

export const useBudgetStore = create((set) => ({
  budgets: [],
  loading: false,

  loadBudgets: async (user, period = 'current') => {
    set({ loading: true });
    try {
      const res = await api.get('/budgets', { params: { period } });
      set({ budgets: res.data.data.budgets || res.data.data || [] });
    } catch (err) {
      console.error('Error loading budgets:', err);
    } finally {
      set({ loading: false });
    }
  },

  addBudget: async (formPayload) => {
    const res = await api.post('/budgets', {
      category_id: formPayload.category_id,
      limit: parseFloat(formPayload.limit),
      type: formPayload.type
    });
    const newBudget = res.data.data;
    set(state => ({
      budgets: [...state.budgets, newBudget]
    }));
    return newBudget;
  },

  editBudget: async (id, formPayload) => {
    const res = await api.put(`/budgets/${id}`, {
      category_id: formPayload.category_id,
      limit: parseFloat(formPayload.limit),
      type: formPayload.type
    });
    const updatedBudget = res.data.data;
    set(state => ({
      budgets: state.budgets.map(b => (b.budget_id === id || b.id === id) ? { ...b, ...updatedBudget } : b)
    }));
    return updatedBudget;
  },

  deleteBudget: async (id) => {
    await api.delete(`/budgets/${id}`);
    set(state => ({
      budgets: state.budgets.filter(b => b.budget_id !== id && b.id !== id)
    }));
  }
}));