import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import BudgetModal from '../components/BudgetModal';
import { useAuthStore } from '../store/useAuthStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { getCurrentPeriod, getPeriodRange, formatPeriodLabel, getPrevPeriod, getNextPeriod } from '../utils/period';
import getCategoryIcon, { getCategoryStyle } from '../utils/categoryIcon';

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

  const [activeTab, setActiveTab] = useState('monthly'); // 'all', 'monthly', 'weekly', 'daily'

  const calculatedBudgets = budgets.map(b => {
    let range;
    if (b.type === 'daily') {
      range = getPeriodRange(getCurrentPeriod('daily'));
    } else if (b.type === 'weekly') {
      const mondayStr = getCurrentPeriod('weekly');
      const parts = mondayStr.split('-');
      const start = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 7);
      range = { start, end };
    } else {
      range = getPeriodRange(b.period);
    }
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

    const categoryStyle = getCategoryStyle(b.category_name);

    return {
      ...b,
      spent,
      percentage,
      status,
      statusClass,
      icon: b.icon || getCategoryIcon(b.category_name),
      color: categoryStyle.color,
      bg: categoryStyle.bg,
      txns: categoryTxns
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

  // Filter budgets for calculation based on the active tab
  const summaryBudgets = calculatedBudgets.filter(b => {
    if (activeTab === 'monthly') return !b.type || b.type === 'monthly';
    return b.type === activeTab;
  });

  const totalBudget = summaryBudgets.reduce((s, b) => s + b.limit, 0);

  // Avoid double-counting transactions that fall into multiple budgets
  const uniqueTxns = new Map();
  summaryBudgets.forEach(b => {
    if (b.txns) {
      b.txns.forEach(t => {
        const id = t.transaction_id || t.id;
        uniqueTxns.set(id, t);
      });
    }
  });
  const totalSpent = Array.from(uniqueTxns.values()).reduce((s, t) => s + t.amount, 0);

  const renderBudgetGrid = (budgetsList, showCta = false) => {
    return (
      <div className="budget-grid" style={{ marginBottom: '24px' }}>
        {budgetsList.map(b => {
          const pct = Math.min(b.percentage, 100);
          const warn = b.percentage >= 100;
          return (
            <div key={b.budget_id || b.id} className={`budget-card ${warn ? 'card-warning' : ''}`} style={{ backgroundColor: b.bg, borderLeft: `4px solid ${b.color}` }}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-name" style={{ color: b.color }}>{b.category_name}</h3>
                  <p className="budget-card-period">{(b.type || 'monthly')?.toUpperCase()}</p>
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
                <span className={`budget-card-spent ${warn ? 'text-error' : 'text-secondary'}`}>
                  Rp{b.spent.toLocaleString('id-ID')}
                </span>
                <span className="budget-card-limit">/ Rp{b.limit.toLocaleString('id-ID')}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${warn ? 'bg-danger' : 'bg-secondary'}`} style={{ width: `${pct}%`, ...(warn ? { background: 'var(--danger)' } : {}) }} />
              </div>
              <div className="budget-card-status" style={{ marginTop: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{b.icon}</span>
                  {b.category_name}
                </span>
                <span className={warn ? 'text-error' : ''} style={{ fontWeight: 600 }}>{b.status}</span>
              </div>
            </div>
          );
        })}
        {showCta && isCurrentPeriod && (
          <div className="budget-card card-cta" onClick={openAdd}>
            <span className="material-symbols-outlined cta-icon">add_circle</span>
            <h3 className="cta-text">Create New Budget</h3>
            <p className="cta-sub">Set spending limits for any category</p>
          </div>
        )}
      </div>
    );
  };

  const getBudgetsByPeriodType = (type) => {
    return calculatedBudgets.filter(b => {
      if (type === 'monthly') return !b.type || b.type === 'monthly';
      return b.type === type;
    });
  };

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

      {/* Period Tabs Selector */}
      <div className="tab-container" style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {['monthly', 'weekly', 'daily'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '14px',
              textTransform: 'capitalize',
              backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              border: activeTab === tab ? '1px solid var(--primary)' : '1px solid var(--border)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="budget-hero">
        <SummaryCard label={`TOTAL BUDGET (${activeTab.toUpperCase()})`} value={`Rp${totalBudget.toLocaleString('id-ID')}`} />
        <SummaryCard label={`TOTAL SPENT (${activeTab.toUpperCase()})`} value={`Rp${totalSpent.toLocaleString('id-ID')}`} />
        <SummaryCard
          label={`REMAINING (${activeTab.toUpperCase()})`}
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

      {/* Render selected filtered grid */}
      {renderBudgetGrid(getBudgetsByPeriodType(activeTab), true)}
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