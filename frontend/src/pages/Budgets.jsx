import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import BudgetModal from '../components/BudgetModal';
import { useAuthStore } from '../store/useAuthStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';

export default function Budgets() {
  const user = useAuthStore(state => state.user);
  
  const budgets = useBudgetStore(state => state.budgets);
  const adjustments = useBudgetStore(state => state.adjustments);
  const loadBudgets = useBudgetStore(state => state.loadBudgets);
  const addBudget = useBudgetStore(state => state.addBudget);
  const editBudget = useBudgetStore(state => state.editBudget);
  const deleteBudget = useBudgetStore(state => state.deleteBudget);
  const loadingBudgets = useBudgetStore(state => state.loading);

  const transactions = useTransactionStore(state => state.transactions);
  const categories = useTransactionStore(state => state.categories);
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const loadCategories = useTransactionStore(state => state.loadCategories);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBudgets(user);
    loadTransactions();
    loadCategories();
  }, [loadBudgets, loadTransactions, loadCategories, user]);

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

  // Compute spent dynamically
  const calculatedBudgets = budgets.map(b => {
    const startOfPeriod = getPeriodStart(b.type);
    const categoryTxns = transactions.filter(t => 
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

  const openAdd = () => {
    setEditing(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (formPayload) => {
    setError('');
    const newLimit = parseFloat(formPayload.limit);
    const selectedCategoryName = categories.find(c => (c.category_id === formPayload.category_id || c.id === formPayload.category_id))?.category_name || '';

    try {
      if (editing) {
        await editBudget(user, editing.budget_id, formPayload, editing.limit, selectedCategoryName);
      } else {
        const exists = budgets.some(b => b.category_name.toLowerCase() === selectedCategoryName.toLowerCase());
        if (exists) {
          setError(`A budget for "${selectedCategoryName}" already exists. Please edit the existing one instead.`);
          return;
        }
        await addBudget(user, formPayload, selectedCategoryName);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the budget.');
    }
  };

  const handleDelete = async (budget_id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const target = budgets.find(b => b.budget_id === budget_id);
        if (target) {
          await deleteBudget(user, budget_id, target.limit, target.category_name);
        }
      } catch (err) {
        console.error('Failed to delete budget:', err);
        setError('Failed to delete the budget.');
      }
    }
  };

  const isOverBudget = calculatedBudgets.some(b => b.percentage >= 100);
  const totalBudget = calculatedBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = calculatedBudgets.reduce((s, b) => s + b.spent, 0);

  if (loadingBudgets && budgets.length === 0) {
    return (
      <Layout>
        <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#45464d' }}>
          Loading budgets...
        </div>
      </Layout>
    );
  }

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
        <SummaryCard label="TOTAL BUDGET" value={`Rp${totalBudget.toLocaleString('id-ID')}`} />
        <SummaryCard label="TOTAL SPENT" value={`Rp${totalSpent.toLocaleString('id-ID')}`} />
        <SummaryCard 
          label="REMAINING" 
          value={`Rp${(totalBudget - totalSpent).toLocaleString('id-ID')}`}
          valueClass={totalBudget - totalSpent < 0 ? 'text-tertiary' : ''}
        />
      </div>

      {isOverBudget && (
        <div className="alert alert-warning">
          <span className="material-symbols-outlined">warning</span>
          <span>You have exceeded one or more budget limits. Please review your spending.</span>
        </div>
      )}

      <div className="budget-grid">
        {calculatedBudgets.map(b => {
          const pct = Math.min(b.percentage, 100);
          const warn = b.percentage >= 100;
          return (
            <div key={b.budget_id || b.id} className={`budget-card ${warn ? 'card-warning' : ''}`}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-name">{b.category_name}</h3>
                  <p className="budget-card-period">{(b.type || b.period)?.toUpperCase()}</p>
                </div>
                <div className="budget-card-actions">
                  <button className="icon-btn" onClick={() => openEdit(b)} style={{ marginRight: '4px' }}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="icon-btn text-tertiary" onClick={() => handleDelete(b.budget_id || b.id)}>
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

      <BudgetModal 
        isOpen={showModal}
        editingItem={editing}
        categories={categories}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        error={error}
      />
    </Layout>
  );
}
