import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import BudgetModal from '../components/BudgetModal';
import { useAuthStore } from '../store/useAuthStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { getCurrentPeriod, getPeriodRange, formatPeriodLabel, getPrevPeriod, getNextPeriod } from '../utils/period';
import getCategoryIcon from '../utils/categoryIcon';

export default function Budgets() {
  const user = useAuthStore(state => state.user);

  const budgets = useBudgetStore(state => state.budgets);
  const loadBudgets = useBudgetStore(state => state.loadBudgets);
  const addBudget = useBudgetStore(state => state.addBudget);
  const editBudget = useBudgetStore(state => state.editBudget);
  const deleteBudget = useBudgetStore(state => state.deleteBudget);
  const loadingBudgets = useBudgetStore(state => state.loading);

  const transactions = useTransactionStore(state => state.transactions);
  const categories = useTransactionStore(state => state.categories);
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const loadCategories = useTransactionStore(state => state.loadCategories);

  const [selectedPeriod, setSelectedPeriod] = useState(() => getCurrentPeriod('monthly'));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBudgets(user, selectedPeriod);
    loadTransactions();
    loadCategories();
  }, [loadBudgets, loadTransactions, loadCategories, user, selectedPeriod]);

  const calculatedBudgets = budgets.map(b => {
    const range = getPeriodRange(b.period);
    const categoryTxns = transactions.filter(t => {
      if (t.category_id !== b.category_id) return false;
      if (!range) return false;
      const d = new Date(t.date);
      return d >= range.start && d < range.end;
    });
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
      icon: b.icon || getCategoryIcon(b.category_name)
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
    try {
      if (editing) {
        await editBudget(editing.budget_id, formPayload);
      } else {
        await addBudget(formPayload);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the budget.');
    }
  };

  const handleDelete = async (budget_id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(budget_id);
      } catch (err) {
        console.error('Failed to delete budget:', err);
        setError('Failed to delete the budget.');
      }
    }
  };

  const goPrev = () => {
    const prev = getPrevPeriod(selectedPeriod, 'monthly');
    if (prev) setSelectedPeriod(prev);
  };

  const goNext = () => {
    const next = getNextPeriod(selectedPeriod, 'monthly');
    if (next) setSelectedPeriod(next);
  };

  const isCurrentPeriod = selectedPeriod === getCurrentPeriod('monthly');

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
        {isCurrentPeriod && (
          <button className="btn-primary" onClick={openAdd}>+ New Budget</button>
        )}
      </div>

      <div className="page-header" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={goPrev} aria-label="Previous period">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15 }}>
            {formatPeriodLabel(selectedPeriod)}
          </span>
          <button
            className="icon-btn"
            onClick={goNext}
            disabled={isCurrentPeriod}
            aria-label="Next period"
            style={{ opacity: isCurrentPeriod ? 0.35 : 1, cursor: isCurrentPeriod ? 'not-allowed' : 'pointer' }}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          {!isCurrentPeriod && (
            <button
              className="btn-secondary"
              style={{ padding: '4px 12px', fontSize: 13 }}
              onClick={() => setSelectedPeriod(getCurrentPeriod('monthly'))}
            >
              Back to current
            </button>
          )}
        </div>
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
                  <p className="budget-card-period">{(b.type)?.toUpperCase()}</p>
                </div>
                {isCurrentPeriod && (
                  <div className="budget-card-actions">
                    <button className="icon-btn" onClick={() => openEdit(b)} style={{ marginRight: '4px' }}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="icon-btn text-tertiary" onClick={() => handleDelete(b.budget_id || b.id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                )}
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

        {isCurrentPeriod && (
          <div className="budget-card card-cta" onClick={openAdd}>
            <span className="material-symbols-outlined cta-icon">add_circle</span>
            <h3 className="cta-text">Create New Budget</h3>
            <p className="cta-sub">Set spending limits for any category</p>
          </div>
        )}
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