import axios from 'axios';
import { 
  getTransactions, 
  saveTransactions, 
  getBudgets, 
  saveBudgets, 
  getAdjustments, 
  saveAdjustments 
} from '../utils/storage.js';

// The real axios instance for authenticating on the backend
const realApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Mock api wrapper that intercepts transaction/budget actions to use localStorage
const api = {
  get: async (url, config) => {
    if (url.startsWith('/auth') || url.startsWith('auth')) {
      return realApi.get(url, config);
    }
    
    if (url === '/transactions' || url === 'transactions') {
      const txns = getTransactions();
      return { data: { status: 'success', data: txns } };
    }
    
    if (url === '/budgets' || url === 'budgets') {
      const budgets = getBudgets();
      return { data: { status: 'success', data: budgets } };
    }
    
    if (url === '/budgets/adjustments' || url === 'budgets/adjustments') {
      const adjustments = getAdjustments();
      return { data: { status: 'success', data: adjustments } };
    }
    
    if (url === '/summary' || url === 'summary') {
      const txns = getTransactions();
      const budgets = getBudgets();
      
      const totalExpenses = txns.reduce((sum, t) => sum + t.amount, 0);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTxns = txns.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const totalSpent = monthlyTxns.reduce((sum, t) => sum + t.amount, 0);

      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevMonthTxns = txns.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });
      const prevMonthSpent = prevMonthTxns.reduce((sum, t) => sum + t.amount, 0);

      let expenseChange = 0;
      if (prevMonthSpent > 0) {
        expenseChange = parseFloat((((totalSpent - prevMonthSpent) / prevMonthSpent) * 100).toFixed(1));
      } else if (totalSpent > 0) {
        expenseChange = 100.0;
      }

      const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
      const expenseProgress = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
      const remainingBudget = Math.max(totalLimit - totalSpent, 0);

      const monthlyTotals = Array(12).fill(0);
      txns.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === currentYear) {
          monthlyTotals[d.getMonth()] += t.amount;
        }
      });
      const maxSpent = Math.max(...monthlyTotals);
      const spendingData = monthlyTotals.map(val => {
        if (maxSpent === 0) return 10;
        return Math.max(Math.round((val / maxSpent) * 90), 10);
      });

      return {
        data: {
          status: 'success',
          data: {
            totalExpenses,
            totalSpent,
            expenseChange,
            expenseProgress,
            remainingBudget,
            spendingData
          }
        }
      };
    }
    
    return realApi.get(url, config);
  },
  
  post: async (url, data, config) => {
    if (url.startsWith('/auth') || url.startsWith('auth')) {
      return realApi.post(url, data, config);
    }
    
    if (url === '/transactions' || url === 'transactions') {
      const txns = getTransactions();
      const newTxn = {
        id: Date.now().toString(),
        merchant: data.merchant,
        category: data.category,
        amount: parseFloat(data.amount),
        date: data.date,
        notes: data.notes || ''
      };
      const updated = [newTxn, ...txns];
      saveTransactions(updated);
      return { data: { status: 'success', data: newTxn } };
    }
    
    if (url === '/budgets' || url === 'budgets') {
      const budgets = getBudgets();
      const newBudget = {
        id: Date.now().toString(),
        name: data.name,
        limit: parseFloat(data.limit),
        period: data.period
      };
      const updated = [...budgets, newBudget];
      saveBudgets(updated);
      return { data: { status: 'success', data: newBudget } };
    }
    
    return realApi.post(url, data, config);
  },
  
  put: async (url, data, config) => {
    if (url.startsWith('/auth') || url.startsWith('auth')) {
      return realApi.put(url, data, config);
    }
    
    const parts = url.split('/');
    const id = parts.pop();
    const basePath = parts.join('/');
    
    if (basePath === '/transactions' || basePath === 'transactions') {
      const txns = getTransactions();
      const updated = txns.map(t => 
        t.id === id ? { ...t, ...data, amount: parseFloat(data.amount) } : t
      );
      saveTransactions(updated);
      return { data: { status: 'success' } };
    }
    
    if (basePath === '/budgets' || basePath === 'budgets') {
      const budgets = getBudgets();
      const updated = budgets.map(b => 
        b.id === id ? { ...b, ...data, limit: parseFloat(data.limit) } : b
      );
      saveBudgets(updated);
      return { data: { status: 'success' } };
    }
    
    return realApi.put(url, data, config);
  },
  
  delete: async (url, config) => {
    if (url.startsWith('/auth') || url.startsWith('auth')) {
      return realApi.delete(url, config);
    }
    
    const parts = url.split('/');
    const id = parts.pop();
    const basePath = parts.join('/');
    
    if (basePath === '/transactions' || basePath === 'transactions') {
      const txns = getTransactions();
      const updated = txns.filter(t => t.id !== id);
      saveTransactions(updated);
      return { data: { status: 'success' } };
    }
    
    if (basePath === '/budgets' || basePath === 'budgets') {
      const budgets = getBudgets();
      const updated = budgets.filter(b => b.id !== id);
      saveBudgets(updated);
      return { data: { status: 'success' } };
    }
    
    return realApi.delete(url, config);
  }
};

export default api;