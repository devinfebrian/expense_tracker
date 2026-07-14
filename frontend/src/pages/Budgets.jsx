import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios.js';
import { getAdjustments, saveAdjustments } from '../utils/storage.js';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '🍚 Food & Drinks', limit: '', period: 'monthly' });
  const [error, setError] = useState('');

  const categories = [
    '🍚 Food & Drinks',
    '🚌 Transportation',
    '📚 Education',
    '🏠 Living Expenses',
    '🎉 Personal & Entertainment'
  ];

  const getBudgetIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('housing') || n.includes('rent') || n.includes('living')) return 'home';
    if (n.includes('dining') || n.includes('restaurant') || n.includes('food') || n.includes('grocery') || n.includes('groceries')) return 'restaurant';
    if (n.includes('transport') || n.includes('car')) return 'directions_car';
    if (n.includes('entertainment') || n.includes('movie') || n.includes('netflix')) return 'movie';
    if (n.includes('education')) return 'school';
    return 'account_balance_wallet';
  };

  const getPeriodStart = (period) => {
    const now = new Date();
    if (period === 'daily') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.getFullYear(), now.getMonth(), diff);
    } else {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const loadData = async () => {
    try {
      const [budgetRes, txnRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/transactions')
      ]);
      const rawBudgets = budgetRes.data.data || [];
      const transactions = txnRes.data.data || [];
      const rawAdjustments = getAdjustments();

      // Map spent amounts and warning states on the fly from actual transactions
      const calculatedBudgets = rawBudgets.map(b => {
        const startOfPeriod = getPeriodStart(b.period);
        const categoryTxns = transactions.filter(t => 
          t.category.toLowerCase() === b.name.toLowerCase() && 
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
          icon: b.icon || getBudgetIcon(b.name)
        };
      });

      setBudgets(calculatedBudgets);
      setAdjustments(rawAdjustments);
    } catch (err) {
      console.error('Error loading budget data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setError('');
    setForm({ name: '🍚 Food & Drinks', limit: '', period: 'monthly' });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setError('');
    setForm({ name: b.name, limit: b.limit.toString(), period: b.period });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const newLimit = parseFloat(form.limit);
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    try {
      if (editing) {
        const prevLimit = editing.limit;
        const limitDiff = newLimit - prevLimit;
        
        await api.put(`/budgets/${editing.id}`, {
          name: form.name,
          limit: newLimit,
          period: form.period
        });

        // Log the adjustment change
        if (limitDiff !== 0) {
          const newAdjustment = {
            date: todayStr,
            category: form.name,
            previousLimit: prevLimit,
            newLimit: newLimit,
            change: limitDiff,
            changeClass: limitDiff >= 0 ? 'text-secondary' : 'text-error'
          };
          const updatedAdjustments = [newAdjustment, ...adjustments];
          saveAdjustments(updatedAdjustments);
        }
      } else {
        // Check if budget for this category already exists
        const exists = budgets.some(b => b.name.toLowerCase() === form.name.toLowerCase());
        if (exists) {
          setError(`A budget for "${form.name}" already exists. Please edit the existing one instead.`);
          return;
        }

        await api.post('/budgets', {
          name: form.name,
          limit: newLimit,
          period: form.period
        });

        // Log positive creation adjustment
        const newAdjustment = {
          date: todayStr,
          category: form.name,
          previousLimit: 0,
          newLimit: newLimit,
          change: newLimit,
          changeClass: 'text-secondary'
        };
        const updatedAdjustments = [newAdjustment, ...adjustments];
        saveAdjustments(updatedAdjustments);
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const target = budgets.find(b => b.id === id);
        await api.delete(`/budgets/${id}`);

        if (target) {
          const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const newAdjustment = {
            date: todayStr,
            category: target.name,
            previousLimit: target.limit,
            newLimit: 0,
            change: -target.limit,
            changeClass: 'text-error'
          };
          const updatedAdjustments = [newAdjustment, ...adjustments];
          saveAdjustments(updatedAdjustments);
        }

        loadData();
      } catch (err) {
        console.error('Error deleting budget:', err);
        alert(err.response?.data?.message || 'Failed to delete budget');
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
            <div key={b.id} className={`budget-card ${warn ? 'card-warning' : ''}`}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-name">{b.name}</h3>
                  <p className="budget-card-period">{b.period.toUpperCase()}</p>
                </div>
                <div className="budget-card-actions">
                  <button className="icon-btn" onClick={() => openEdit(b)} style={{ marginRight: '4px' }}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="icon-btn text-tertiary" onClick={() => handleDelete(b.id)}>
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
                  {b.name}
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
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select 
                    className="form-input" 
                    value={form.period} 
                    onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
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
