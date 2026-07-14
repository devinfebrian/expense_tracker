import { create } from 'zustand';
import api from '../api/axios.js';

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  adjustments: [],
  loading: false,

  loadBudgets: async (user) => {
    set({ loading: true });
    try {
      const res = await api.get('/budgets');
      set({ budgets: res.data.data.budgets || res.data.data || [] });
      
      if (user) {
        const storedAdjustments = localStorage.getItem(`duidku_adjustments_${user.user_id}`);
        set({ adjustments: storedAdjustments ? JSON.parse(storedAdjustments) : [] });
      }
    } catch (err) {
      console.error('Error loading budgets:', err);
    } finally {
      set({ loading: false });
    }
  },

  addBudget: async (user, formPayload, selectedCategoryName) => {
    const res = await api.post('/budgets', {
      category_id: formPayload.category_id,
      limit: parseFloat(formPayload.limit),
      type: formPayload.type
    });
    const newBudget = res.data.data;
    set(state => ({
      budgets: [...state.budgets, newBudget]
    }));

    // Log adjustment in localStorage
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newAdjustment = {
      date: todayStr,
      category: selectedCategoryName,
      previousLimit: 0,
      newLimit: parseFloat(formPayload.limit),
      change: parseFloat(formPayload.limit),
      changeClass: 'text-secondary'
    };
    const updatedAdjustments = [newAdjustment, ...get().adjustments];
    if (user) {
      localStorage.setItem(`duidku_adjustments_${user.user_id}`, JSON.stringify(updatedAdjustments));
    }
    set({ adjustments: updatedAdjustments });
    return newBudget;
  },

  editBudget: async (user, id, formPayload, prevLimit, selectedCategoryName) => {
    const limitVal = parseFloat(formPayload.limit);
    const res = await api.put(`/budgets/${id}`, {
      category_id: formPayload.category_id,
      limit: limitVal,
      type: formPayload.type
    });
    const updatedBudget = res.data.data;
    set(state => ({
      budgets: state.budgets.map(b => (b.budget_id === id || b.id === id) ? { ...b, ...updatedBudget } : b)
    }));

    // Log adjustment in localStorage
    const limitDiff = limitVal - prevLimit;
    if (limitDiff !== 0) {
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newAdjustment = {
        date: todayStr,
        category: selectedCategoryName,
        previousLimit: prevLimit,
        newLimit: limitVal,
        change: limitDiff,
        changeClass: limitDiff >= 0 ? 'text-secondary' : 'text-error'
      };
      const updatedAdjustments = [newAdjustment, ...get().adjustments];
      if (user) {
        localStorage.setItem(`duidku_adjustments_${user.user_id}`, JSON.stringify(updatedAdjustments));
      }
      set({ adjustments: updatedAdjustments });
    }
    return updatedBudget;
  },

  deleteBudget: async (user, id, limitVal, categoryName) => {
    await api.delete(`/budgets/${id}`);
    set(state => ({
      budgets: state.budgets.filter(b => b.budget_id !== id && b.id !== id)
    }));

    // Log negative adjustment
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newAdjustment = {
      date: todayStr,
      category: categoryName,
      previousLimit: limitVal,
      newLimit: 0,
      change: -limitVal,
      changeClass: 'text-error'
    };
    const updatedAdjustments = [newAdjustment, ...get().adjustments];
    if (user) {
      localStorage.setItem(`duidku_adjustments_${user.user_id}`, JSON.stringify(updatedAdjustments));
    }
    set({ adjustments: updatedAdjustments });
  }
}));
