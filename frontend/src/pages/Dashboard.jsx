import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import TransactionModal from '../components/TransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAuthStore } from '../store/useAuthStore';
import { getPeriodRange, getCurrentPeriod, getPrevPeriod, getNextPeriod, formatPeriodLabel, getMonthlyWindow, getShortMonthLabel } from '../utils/period';
import getCategoryIcon from '../utils/categoryIcon';

const CATEGORY_COLORS = ['#6750A4', '#EADDFF', '#79747E', '#322F35'];

export default function Dashboard() {
  const user = useAuthStore(state => state.user);
  const transactions = useTransactionStore(state => state.transactions);
  const categories = useTransactionStore(state => state.categories);
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const loadCategories = useTransactionStore(state => state.loadCategories);
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const loadingTxns = useTransactionStore(state => state.loading);

  const budgets = useBudgetStore(state => state.budgets);
  const loadBudgets = useBudgetStore(state => state.loadBudgets);
  const loadingBudgets = useBudgetStore(state => state.loading);

  const [showModal, setShowModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => getCurrentPeriod('monthly'));

  useEffect(() => {
    loadTransactions();
    loadBudgets(user, selectedPeriod);
    loadCategories();
  }, [loadTransactions, loadBudgets, loadCategories, user, selectedPeriod]);

  const handleSave = async (formPayload) => {
    try {
      await addTransaction(formPayload);
      setShowModal(false);
      loadBudgets(user, selectedPeriod);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const loading = loadingTxns || loadingBudgets;

  const {
    totalExpenses,
    totalSpent,
    expenseChange,
    expenseProgress,
    remainingBudget,
    dailyAverage,
    periodTxns,
    categoryBreakdown,
    calculatedBudgets,
    trendMonths,
    trendTotals,
  } = useMemo(() => {
    // All comparisons UTC, period-range based.
    const range = getPeriodRange(selectedPeriod);
    const prevRange = getPeriodRange(getPrevPeriod(selectedPeriod, 'monthly'));

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

    const periodTxns = transactions.filter(t => {
      if (!range) return false;
      const d = new Date(t.date);
      return d >= range.start && d < range.end;
    });
    const totalSpent = periodTxns.reduce((sum, t) => sum + t.amount, 0);

    const prevPeriodTxns = transactions.filter(t => {
      if (!prevRange) return false;
      const d = new Date(t.date);
      return d >= prevRange.start && d < prevRange.end;
    });
    const prevMonthSpent = prevPeriodTxns.reduce((sum, t) => sum + t.amount, 0);

    let expenseChange = 0;
    if (prevMonthSpent > 0) {
      expenseChange = parseFloat((((totalSpent - prevMonthSpent) / prevMonthSpent) * 100).toFixed(1));
    } else if (totalSpent > 0) {
      expenseChange = 100.0;
    }

    // Q-D2=1: only monthly budgets for selected period count toward "This Month" card.
    const monthlyBudgets = budgets.filter(b => b.type === 'monthly' && b.period === selectedPeriod);
    const totalLimit = monthlyBudgets.reduce((sum, b) => sum + b.limit, 0);
    const expenseProgress = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
    const remainingBudget = Math.max(totalLimit - totalSpent, 0);

    // Daily average: current month uses days elapsed; past month uses full month length.
    const now = new Date();
    const isCurrent = selectedPeriod === getCurrentPeriod('monthly');
    let daysForAverage;
    if (isCurrent && range) {
      daysForAverage = Math.max(1, Math.floor((now - range.start) / (1000 * 60 * 60 * 24)) + 1);
    } else if (range) {
      daysForAverage = Math.max(1, Math.round((range.end - range.start) / (1000 * 60 * 60 * 24)));
    } else {
      daysForAverage = 1;
    }
    const dailyAverage = Math.round(totalSpent / daysForAverage);

    // Category breakdown: scope to selected period.
    const categoriesMap = {};
    periodTxns.forEach(t => {
      const key = t.category || 'Others';
      categoriesMap[key] = (categoriesMap[key] || 0) + t.amount;
    });
    const totalCategoryAmount = Object.values(categoriesMap).reduce((s, v) => s + v, 0);
    const categoryBreakdown = Object.keys(categoriesMap).map(cat => {
      const amt = categoriesMap[cat];
      const pct = totalCategoryAmount > 0 ? Math.round((amt / totalCategoryAmount) * 100) : 0;
      return { label: cat, pct };
    }).sort((a, b) => b.pct - a.pct).slice(0, 4);

    // Budget health: Q-D9=1, all budgets whose period falls inside selected month
    // (backend already regex-matches when period=YYYY-MM, but also guard client-side).
    const monthlyPrefix = selectedPeriod; // "YYYY-MM"
    const calculatedBudgets = budgets
      .filter(b => b.period && b.period.startsWith(monthlyPrefix))
      .map(b => {
        const bRange = getPeriodRange(b.period);
        const categoryTxns = transactions.filter(t => {
          if (t.category_id !== b.category_id) return false;
          if (!bRange) return false;
          const d = new Date(t.date);
          return d >= bRange.start && d < bRange.end;
        });
        const spent = categoryTxns.reduce((sum, t) => sum + t.amount, 0);
        const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;

        let status = 'ON TRACK';
        let statusClass = 'text-secondary';
        let warning = false;
        if (spent > b.limit) {
          status = 'EXCEEDED';
          statusClass = 'text-error';
          warning = true;
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
          warning,
          icon: getCategoryIcon(b.category_name)
        };
      });

    // Spending trends: last 12 months ending at selectedPeriod.
    const trendMonths = getMonthlyWindow(selectedPeriod, 12);
    const trendTotals = trendMonths.map(p => {
      const r = getPeriodRange(p);
      if (!r) return 0;
      return transactions
        .filter(t => {
          const d = new Date(t.date);
          return d >= r.start && d < r.end;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      totalExpenses,
      totalSpent,
      expenseChange,
      expenseProgress,
      remainingBudget,
      dailyAverage,
      periodTxns,
      categoryBreakdown,
      calculatedBudgets,
      trendMonths,
      trendTotals,
    };
  }, [transactions, budgets, selectedPeriod]);

  const displayCategories = categoryBreakdown.length > 0 ? categoryBreakdown : [
    { label: 'No expenses yet', pct: 0 }
  ];

  const doughnutGradient = useMemo(() => {
    if (categoryBreakdown.length === 0) {
      return 'conic-gradient(var(--surface-container-high) 0% 100%)';
    }
    let acc = 0;
    const stops = [];
    categoryBreakdown.forEach((c, i) => {
      const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
      const start = acc;
      acc += c.pct;
      stops.push(`${color} ${start}% ${acc}%`);
    });
    if (acc < 100) {
      stops.push(`var(--surface-container-high) ${acc}% 100%`);
    }
    return `conic-gradient(${stops.join(', ')})`;
  }, [categoryBreakdown]);

  const isCurrentPeriod = selectedPeriod === getCurrentPeriod('monthly');
  const currentPeriodStr = getCurrentPeriod('monthly');

  const goPrev = () => {
    const prev = getPrevPeriod(selectedPeriod, 'monthly');
    if (prev) setSelectedPeriod(prev);
  };

  const goNext = () => {
    const next = getNextPeriod(selectedPeriod, 'monthly');
    if (next) setSelectedPeriod(next);
  };

  const maxTrend = Math.max(...trendTotals);
  const trendBars = trendTotals.map(v => {
    if (maxTrend === 0) return 10;
    return Math.max(Math.round((v / maxTrend) * 90), 10);
  });

  if (loading && transactions.length === 0) {
    return (
      <Layout>
        <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#45464d' }}>
          Loading dashboard insights...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Overview</h1>
          <p className="page-subtitle">Track and manage your daily spending.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="icon-btn" onClick={goPrev} aria-label="Previous month">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, minWidth: 90, textAlign: 'center' }}>
              {formatPeriodLabel(selectedPeriod)}
            </span>
            <button
              className="icon-btn"
              onClick={goNext}
              disabled={isCurrentPeriod}
              aria-label="Next month"
              style={{ opacity: isCurrentPeriod ? 0.35 : 1, cursor: isCurrentPeriod ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            {!isCurrentPeriod && (
              <button
                className="btn-secondary"
                style={{ padding: '4px 12px', fontSize: 13 }}
                onClick={() => setSelectedPeriod(currentPeriodStr)}
              >
                Today
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Expense</button>
          <Link to="/budgets" className="btn-secondary">Set Budget</Link>
        </div>
      </div>

      {/* Facts Row */}
      <div className="facts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <SummaryCard
          label="TOTAL EXPENSES"
          value={`Rp${totalExpenses.toLocaleString('id-ID')}`}
          trend={`${Math.abs(expenseChange)}% from last month`}
          trendIcon={expenseChange >= 0 ? 'trending_up' : 'trending_down'}
          trendColor={expenseChange >= 0 ? 'var(--error)' : 'var(--on-secondary-container)'}
        />
        <SummaryCard
          label={isCurrentPeriod ? 'THIS MONTH' : formatPeriodLabel(selectedPeriod).toUpperCase()}
          value={`Rp${totalSpent.toLocaleString('id-ID')}`}
          valueClass="text-secondary"
          subtext={`Rp${remainingBudget.toLocaleString('id-ID')} remaining`}
        >
          <div className="progress-bar">
            <div className="progress-fill bg-secondary" style={{ width: `${expenseProgress}%` }} />
          </div>
        </SummaryCard>
        <SummaryCard
          label="DAILY AVERAGE"
          value={`Rp${dailyAverage.toLocaleString('id-ID')}`}
          valueClass="text-tertiary"
          trend={isCurrentPeriod ? 'Based on days elapsed this month' : 'Based on full month length'}
          trendIcon="info"
          trendColor="var(--on-surface-variant)"
        />
      </div>

      <div className="dashboard-grid">
        <div className="chart-card col-span-4">
          <h4 className="chart-title">Expense Categories</h4>
          <div className="doughnut-container">
            <div
              className="doughnut"
              style={{ background: doughnutGradient, position: 'relative' }}
            >
              <div className="doughnut-center">
                <span className="doughnut-value">
                  {categoryBreakdown.length > 0 ? `${categoryBreakdown[0].pct}%` : '0%'}
                </span>
                <p className="doughnut-label">{categoryBreakdown[0]?.label || 'Breakdown'}</p>
              </div>
            </div>
          </div>
          <div className="category-list">
            {displayCategories.map((c, index) => (
              <div key={c.label} className="category-item">
                <span
                  className="category-dot"
                  style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                />
                <span>{c.label}</span>
                <span className="category-pct">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card col-span-8">
          <div className="chart-header">
            <h4 className="chart-title">Recent Expenses</h4>
            <Link to="/transactions" className="chart-link">View All</Link>
          </div>
          <TransactionTable
            transactions={periodTxns}
            showActions={false}
            limit={5}
          />
        </div>

        <div className="chart-card" style={{ gridColumn: 'span 12' }}>
          <div className="chart-header">
            <h4 className="chart-title">Budget Health</h4>
            <Link to="/budgets" className="chart-link">Manage</Link>
          </div>
          <div className="budget-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {calculatedBudgets.length === 0 ? (
              <p style={{ gridColumn: 'span 12', fontSize: 13, color: 'var(--on-surface-variant)', textAlign: 'center', padding: '16px 0' }}>
                No active budgets set. Go to manage budgets to get started.
              </p>
            ) : (
              calculatedBudgets.map(b => (
                <div key={b.budget_id || b.id} className="budget-item" style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                  <div className="budget-header">
                    <span className="budget-label">{b.category_name?.toUpperCase() || b.name?.toUpperCase()}</span>
                    <span className={`budget-amount ${b.warning ? 'text-tertiary' : ''}`}>
                      Rp{b.spent.toLocaleString('id-ID')} / Rp{b.limit.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: '8px' }}>
                    <div className={`progress-fill ${b.warning ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                  </div>
                  <div className="budget-header" style={{ marginTop: 8 }}>
                    <span className="text-on-surface-variant" style={{ fontSize: 10 }}>{b.type?.toUpperCase()}</span>
                    <span className={b.statusClass} style={{ fontSize: 11, fontWeight: 600 }}>{b.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card" style={{ gridColumn: 'span 12' }}>
          <div className="chart-header">
            <h4 className="chart-title">Spending Trends</h4>
            <div className="chart-legend">
              <span className="legend-dot bg-primary" />
              <span className="legend-label">Monthly Spending</span>
            </div>
          </div>
          <div className="bar-chart">
            {trendBars.map((v, i) => (
              <div key={i} className="bar-item">
                <div className={`bar ${trendMonths[i] === currentPeriodStr ? 'bar-active' : ''}`} style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {trendMonths.map(p => (
              <span key={p}>{getShortMonthLabel(p)}</span>
            ))}
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={showModal}
        editingItem={null}
        categories={categories}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </Layout>
  );
}