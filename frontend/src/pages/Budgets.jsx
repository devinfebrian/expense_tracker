/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category_id: '', limit: '', type: 'monthly' });
  const [error, setError] = useState('');

  const getBudgetIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('food') || n.includes('drinks') || n.includes('meals') || n.includes('restaurant')) return 'restaurant';
    if (n.includes('transport') || n.includes('taxi') || n.includes('bus') || n.includes('car')) return 'directions_car';
    if (n.includes('education') || n.includes('books') || n.includes('school')) return 'school';
    if (n.includes('living') || n.includes('rent') || n.includes('dorm') || n.includes('housing')) return 'home';
    if (n.includes('personal') || n.includes('entertainment') || n.includes('shopping') || n.includes('movie') || n.includes('games')) return 'celebration';
    return 'account_balance_wallet';
  };

  const getPeriodStart = (type) => {
    const now = new Date();
    if (type === 'daily') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.getFullYear(), now.getMonth(), diff);
    } else {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [catRes, budgetRes, txRes] = await Promise.all([
        api.get('/categories'),
        api.get('/budgets'),
        api.get('/transactions')
      ]);
      
      const rawCategories = catRes.data.data || [];
      const rawBudgets = budgetRes.data.data.budgets || budgetRes.data.data || [];
      const rawTxns = txRes.data.data.transactions || txRes.data.data || [];

      setCategories(rawCategories);

      // Compute spent dynamically on the client
      const calculatedBudgets = rawBudgets.map(b => {
        const startOfPeriod = getPeriodStart(b.type);
        const categoryTxns = rawTxns.filter(t => 
          t.category.toLowerCase() === b.category_name.toLowerCase() && 
          new Date(t.date) >= startOfPeriod
        );
        const spent = categoryTxns.reduce((sum, t) => sum + t.amount, 0);
        const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
        
        let status = 'ON TRACK';
        let statusClass = 'text-secondary';
        if (spent > b.limit) {
          status = 'EXCEEDED';
          statusClass = 'text-error';
        } else if (spent === b.limit) {
          status = 'REACHED';
          statusClass = 'text-on-primary-fixed-variant';
        }

        return {
          ...b,
          spent,
          percentage,
          status,
          statusClass,
          icon: b.icon || getBudgetIcon(b.category_name)
        };
      });

      setBudgets(calculatedBudgets);

      if (user) {
        const storedAdjustments = localStorage.getItem(`duidku_adjustments_${user.user_id}`);
        setAdjustments(storedAdjustments ? JSON.parse(storedAdjustments) : []);
      }
    } catch (err) {
      console.error('Error loading budget data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdd = () => {
    setEditing(null);
    setError('');
    setForm({ 
      category_id: categories[0]?.category_id || categories[0]?.id || '', 
      limit: '', 
      type: 'monthly' 
    });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setError('');
    setForm({ category_id: b.category_id, limit: b.limit.toString(), type: b.type });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const newLimit = parseFloat(form.limit);
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const selectedCategoryName = categories.find(c => (c.category_id === form.category_id || c.id === form.category_id))?.category_name || '';

    try {
      let updatedAdjustments = [...adjustments];

      if (editing) {
        const prevLimit = editing.limit;
        const limitDiff = newLimit - prevLimit;
        
        await api.put(`/budgets/${editing.budget_id}`, {
          category_id: form.category_id,
          limit: newLimit,
          type: form.type
        });

        if (limitDiff !== 0) {
          const newAdjustment = {
            date: todayStr,
            category: selectedCategoryName,
            previousLimit: prevLimit,
            newLimit: newLimit,
            change: limitDiff,
            changeClass: limitDiff >= 0 ? 'text-secondary' : 'text-error'
          };
          updatedAdjustments = [newAdjustment, ...updatedAdjustments];
        }
      } else {
        // Check if budget for this category already exists
        const exists = budgets.some(b => b.category_name.toLowerCase() === selectedCategoryName.toLowerCase());
        if (exists) {
          setError(`A budget for "${selectedCategoryName}" already exists. Please edit the existing one instead.`);
          return;
        }

        await api.post('/budgets', {
          category_id: form.category_id,
          limit: newLimit,
          type: form.type
        });

        const newAdjustment = {
          date: todayStr,
          category: selectedCategoryName,
          previousLimit: 0,
          newLimit: newLimit,
          change: newLimit,
          changeClass: 'text-secondary'
        };
        updatedAdjustments = [newAdjustment, ...updatedAdjustments];
      }

      if (user) {
        localStorage.setItem(`duidku_adjustments_${user.user_id}`, JSON.stringify(updatedAdjustments));
      }
      setAdjustments(updatedAdjustments);
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the budget.');
    }
  };

  const handleDelete = async (budget_id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const target = budgets.find(b => b.budget_id === budget_id);
        await api.delete(`/budgets/${budget_id}`);

        if (target && user) {
          const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const newAdjustment = {
            date: todayStr,
            category: target.category_name,
            previousLimit: target.limit,
            newLimit: 0,
            change: -target.limit,
            changeClass: 'text-error'
          };
          const updatedAdjustments = [newAdjustment, ...adjustments];
          localStorage.setItem(`duidku_adjustments_${user.user_id}`, JSON.stringify(updatedAdjustments));
          setAdjustments(updatedAdjustments);
        }

        loadData();
      } catch (err) {
        console.error('Failed to delete budget:', err);
        setError('Failed to delete the budget.');
      }
    }
  };

  const isOverBudget = budgets.some(b => b.percentage >= 100);
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Management</h1>
          <p className="page-subtitle">Set and monitor your spending limits across categories.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ New Budget</button>
      </div>

      <div className="budget-hero">
        <div className="summary-card">
          <p className="summary-label">TOTAL BUDGET</p>
          <h3 className="summary-value">Rp{totalBudget.toLocaleString('id-ID')}</h3>
        </div>
        <div className="summary-card">
          <p className="summary-label">TOTAL SPENT</p>
          <h3 className="summary-value">Rp{totalSpent.toLocaleString('id-ID')}</h3>
        </div>
        <div className="summary-card">
          <p className="summary-label">REMAINING</p>
          <h3 className={`summary-value ${totalBudget - totalSpent < 0 ? 'text-tertiary' : ''}`}>
            Rp{(totalBudget - totalSpent).toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {isOverBudget && (
        <div className="alert alert-warning">
          <span className="material-symbols-outlined">warning</span>
          <span>You have exceeded one or more budget limits. Please review your spending.</span>
        </div>
      )}

      <div className="budget-grid">
        {budgets.map(b => {
          const pct = Math.min(b.percentage, 100);
          const warn = b.percentage >= 100;
          return (
            <div key={b.budget_id} className={`budget-card ${warn ? 'card-warning' : ''}`}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-name">{b.category_name}</h3>
                  <p className="budget-card-period">{b.type.toUpperCase()}</p>
                </div>
                <div className="budget-card-actions">
                  <button className="icon-btn" onClick={() => openEdit(b)} style={{ marginRight: '4px' }}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="icon-btn text-tertiary" onClick={() => handleDelete(b.budget_id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <div className="budget-card-amounts">
                <span className={`budget-card-spent ${warn ? 'text-tertiary' : 'text-secondary'}`}>
                  Rp{b.spent.toLocaleString('id-ID')}
                </span>
                <span className="budget-card-limit">/ Rp{b.limit.toLocaleString('id-ID')}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${warn ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="budget-card-status" style={{ marginTop: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{b.icon}</span>
                  {b.category_name}
                </span>
                <span className={warn ? 'text-tertiary' : ''} style={{ fontWeight: 600 }}>{b.status}</span>
              </div>
            </div>
          );
        })}

        <div className="budget-card card-cta" onClick={openAdd}>
          <span className="material-symbols-outlined cta-icon">add_circle</span>
          <h3 className="cta-text">Create New Budget</h3>
          <p className="cta-sub">Set spending limits for any category</p>
        </div>
      </div>

      <div className="txn-summary" style={{ padding: 0, marginTop: 32 }}>
        <div className="budget-adjustments">
          <div className="chart-header" style={{ marginBottom: 12 }}>
            <h4 className="chart-title">Budget Adjustments</h4>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>BUDGET</th>
                  <th>ADJUSTMENT</th>
                  <th>REASON</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px 0' }}>
                      No adjustments logged yet.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((a, index) => (
                    <tr key={index}>
                      <td className="text-on-surface-variant">{a.date}</td>
                      <td>{a.category}</td>
                      <td>
                        <span className={a.changeClass}>
                          {a.change >= 0 ? '+' : ''}Rp{a.change.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="text-on-surface-variant">
                        Limit changed from Rp{a.previousLimit.toLocaleString('id-ID')} to Rp{a.newLimit.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Budget' : 'New Budget'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && <p style={{ color: 'var(--error)', padding: '0 24px', margin: '8px 0 0 0', fontSize: 13 }}>{error}</p>}
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Budget Name (Category)</label>
                  <select 
                    className="form-input" 
                    value={form.category_id} 
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  >
                    {categories.map(c => <option key={c.category_id || c.id} value={c.category_id || c.id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select 
                    className="form-input" 
                    value={form.type} 
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Limit (Rp)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={form.limit} 
                  onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} 
                  required 
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'UPDATE' : 'CREATE'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
