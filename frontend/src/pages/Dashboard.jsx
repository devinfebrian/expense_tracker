import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import TransactionModal from '../components/TransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAuthStore } from '../store/useAuthStore';
import { getPeriodRange, getCurrentPeriod, getPrevPeriod, getNextPeriod, formatPeriodLabel } from '../utils/period';
import { getCategoryStyle } from '../utils/categoryIcon';

const formatCurrency = (n) => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

const formatPeriodRange = (period) => {
  const range = getPeriodRange(period);
  if (!range) return formatPeriodLabel(period);
  const end = new Date(range.end);
  end.setUTCDate(end.getUTCDate() - 1);
  const opts = { month: 'short', day: 'numeric' };
  return `${range.start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}, ${end.getUTCFullYear()}`;
};

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
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: 0, label: '' });

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
    transactionCount,
    topCategory,
    remainingBudget,
    budgetLimit,
    budgetUtilization,
    expenseChange,
    transactionCountChange,
    categoryBreakdown,
    recentTransactions,
    budgetOverview,
    dailyLabels,
    dailyTotals,
  } = useMemo(() => {
    const range = getPeriodRange(selectedPeriod);
    const prevRange = getPeriodRange(getPrevPeriod(selectedPeriod, 'monthly'));

    const periodTxns = transactions.filter(t => {
      if (!range) return false;
      const d = new Date(t.date);
      return d >= range.start && d < range.end;
    });
    const totalExpenses = periodTxns.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = periodTxns.length;

    const prevPeriodTxns = transactions.filter(t => {
      if (!prevRange) return false;
      const d = new Date(t.date);
      return d >= prevRange.start && d < prevRange.end;
    });
    const prevTotalExpenses = prevPeriodTxns.reduce((sum, t) => sum + t.amount, 0);
    const prevTransactionCount = prevPeriodTxns.length;

    const pctChange = (curr, prev) => {
      if (prev > 0) return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
      if (curr > 0) return 100;
      return 0;
    };

    const expenseChange = pctChange(totalExpenses, prevTotalExpenses);
    const transactionCountChange = pctChange(transactionCount, prevTransactionCount);

    // Budget totals across monthly budgets for selected period
    const monthlyBudgets = budgets.filter(b => b.type === 'monthly' && b.period === selectedPeriod);
    const budgetLimit = monthlyBudgets.reduce((sum, b) => sum + b.limit, 0);

    // Aggregate spending by category to avoid double-counting duplicate budgets
    const spentByCategory = {};
    monthlyBudgets.forEach(b => {
      const bRange = getPeriodRange(b.period);
      const spent = transactions
        .filter(t => {
          if (t.category_id !== b.category_id) return false;
          if (!bRange) return false;
          const d = new Date(t.date);
          return d >= bRange.start && d < bRange.end;
        })
        .reduce((s, t) => s + t.amount, 0);
      spentByCategory[b.category_id] = Math.max(spentByCategory[b.category_id] || 0, spent);
    });
    const budgetSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0);
    const remainingBudget = Math.max(budgetLimit - budgetSpent, 0);
    const budgetUtilization = budgetLimit > 0 ? Math.round((budgetSpent / budgetLimit) * 100) : 0;

    // Category breakdown
    const categoriesMap = {};
    periodTxns.forEach(t => {
      const key = t.category || 'Others';
      categoriesMap[key] = (categoriesMap[key] || 0) + t.amount;
    });
    const totalCategoryAmount = Object.values(categoriesMap).reduce((s, v) => s + v, 0);
    const categoryBreakdown = Object.keys(categoriesMap).map(cat => {
      const amt = categoriesMap[cat];
      const pct = totalCategoryAmount > 0 ? Math.round((amt / totalCategoryAmount) * 100) : 0;
      const style = getCategoryStyle(cat);
      return { label: cat, amount: amt, pct, ...style };
    }).sort((a, b) => b.pct - a.pct);

    // Recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Budget overview — only monthly budgets for selected period
    const budgetOverview = monthlyBudgets
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
        const style = getCategoryStyle(b.category_name);
        return {
          ...b,
          spent,
          percentage,
          ...style,
        };
      })
      .slice(0, 4);

    // Daily totals for spending overview
    const dailyLabels = [];
    const dailyTotals = [];
    if (range) {
      const cur = new Date(range.start);
      while (cur < range.end) {
        const dayStart = new Date(cur);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const daySpent = periodTxns
          .filter(t => {
            const d = new Date(t.date);
            return d >= dayStart && d < dayEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);
        dailyLabels.push(dayStart.getUTCDate());
        dailyTotals.push(daySpent);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }

    // Top spending category
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    return {
      totalExpenses,
      transactionCount,
      topCategory,
      remainingBudget,
      budgetLimit,
      budgetUtilization,
      expenseChange,
      transactionCountChange,
      categoryBreakdown,
      recentTransactions,
      budgetOverview,
      dailyLabels,
      dailyTotals,
    };
  }, [transactions, budgets, selectedPeriod]);

  const isCurrentPeriod = selectedPeriod === getCurrentPeriod('monthly');

  const goPrev = () => {
    const prev = getPrevPeriod(selectedPeriod, 'monthly');
    if (prev) setSelectedPeriod(prev);
  };

  const goNext = () => {
    const next = getNextPeriod(selectedPeriod, 'monthly');
    if (next) setSelectedPeriod(next);
  };

  // Spending overview line chart (daily)
  const maxDaily = Math.max(...dailyTotals, 1);
  const dailyPoints = dailyTotals.map((v, i) => {
    const x = dailyTotals.length > 1 ? (i / (dailyTotals.length - 1)) * 100 : 50;
    const y = 50 - (v / maxDaily) * 40;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaPoints = dailyPoints
    ? `0,50 ${dailyPoints} 100,50`
    : '';

  const handleLineHover = (e, value, label) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      value,
      label,
    });
  };

  const handleLineLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const doughnutGradient = useMemo(() => {
    if (categoryBreakdown.length === 0) {
      return 'conic-gradient(var(--border-light) 0% 100%)';
    }
    let acc = 0;
    const stops = categoryBreakdown.map(c => {
      const start = acc;
      acc += c.pct;
      return `${c.color} ${start}% ${acc}%`;
    });
    if (acc < 100) {
      stops.push(`var(--border-light) ${acc}% 100%`);
    }
    return `conic-gradient(${stops.join(', ')})`;
  }, [categoryBreakdown]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && transactions.length === 0) {
    return (
      <Layout>
        <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>
          Loading dashboard insights...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="page-subtitle">Here&apos;s what&apos;s happening with your expenses today.</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 10px' }}>
            <button className="icon-btn" onClick={goPrev} aria-label="Previous month">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span style={{ fontWeight: 600, fontSize: 14, minWidth: 140, textAlign: 'center', color: 'var(--text-primary)' }}>
              {formatPeriodRange(selectedPeriod)}
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
          </div>
          <button className="btn-icon">
            <span className="material-symbols-outlined">filter_list</span>
            Filters
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="facts-grid">
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon="credit_card"
          iconBg="var(--danger-light)"
          iconColor="var(--danger)"
          trend={`${expenseChange >= 0 ? '+' : ''}${expenseChange}%`}
          trendDirection={expenseChange >= 0 ? 'down' : 'up'}
          trendText="from last month"
        />
        <SummaryCard
          label="Transactions"
          value={transactionCount}
          icon="receipt_long"
          iconBg="var(--info-light)"
          iconColor="var(--info)"
          trend={`${transactionCountChange >= 0 ? '+' : ''}${transactionCountChange}%`}
          trendDirection={transactionCountChange >= 0 ? 'up' : 'down'}
          trendText="from last month"
        />
        <SummaryCard
          label="Top Category"
          value={topCategory ? topCategory.label : 'No expenses'}
          icon="category"
          iconBg="var(--tertiary-light)"
          iconColor="var(--tertiary)"
          trend={topCategory ? `${topCategory.pct}%` : ''}
          trendText={topCategory ? `${formatCurrency(topCategory.amount)} spent` : ''}
        />
        <SummaryCard
          label="Remaining Budget"
          value={formatCurrency(remainingBudget)}
          icon="account_balance_wallet"
          iconBg="var(--primary-light)"
          iconColor="var(--primary)"
          trend={`${budgetUtilization}% used`}
          trendText={`of ${formatCurrency(budgetLimit)} limit`}
        />
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--gutter)' }}>
        <div className="chart-card col-span-8">
          <div className="chart-header">
            <div>
              <div className="chart-subtitle">{formatCurrency(totalExpenses)}</div>
              <div className="chart-subtitle-label">Spending Overview</div>
            </div>
            <div className="chart-legend">
              <span className="legend-dot bg-primary" />
              <span className="legend-label">Daily Spending</span>
            </div>
          </div>
          <div className="line-chart-container" onMouseLeave={handleLineLeave}>
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="line-chart-svg">
              {areaPoints && (
                <>
                  <polygon points={areaPoints} className="line-chart-area" />
                  <polyline points={dailyPoints} className="line-chart-line" />
                  {dailyTotals.map((v, i) => {
                    const x = dailyTotals.length > 1 ? (i / (dailyTotals.length - 1)) * 100 : 50;
                    const y = 50 - (v / maxDaily) * 40;
                    const label = `${dailyLabels[i]} ${formatPeriodLabel(selectedPeriod).split(' ')[0]}`;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="1.2"
                        className="line-chart-dot"
                        onMouseEnter={(e) => handleLineHover(e, v, label)}
                        onMouseMove={(e) => handleLineHover(e, v, label)}
                      />
                    );
                  })}
                </>
              )}
            </svg>
            <div className="line-chart-labels">
              {dailyLabels.filter((_, i) => i === 0 || i === dailyLabels.length - 1 || (i + 1) % 7 === 0 || dailyLabels.length <= 10).map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
            {tooltip.visible && (
              <div className="chart-tooltip visible" style={{ left: tooltip.x, top: tooltip.y }}>
                {tooltip.label}: {formatCurrency(tooltip.value)}
              </div>
            )}
          </div>
        </div>

        <div className="chart-card col-span-4">
          <div className="chart-header">
            <h4 className="chart-title">Expense by Category</h4>
          </div>
          <div className="doughnut-container">
            <div className="doughnut" style={{ background: doughnutGradient }}>
              <div className="doughnut-center">
                <span className="doughnut-value">{formatCurrency(totalExpenses)}</span>
                <p className="doughnut-label">Total</p>
              </div>
            </div>
          </div>
          <div className="category-list">
            {categoryBreakdown.length === 0 ? (
              <div className="category-item" style={{ color: 'var(--text-secondary)', justifyContent: 'center' }}>
                No expenses this period
              </div>
            ) : (
              categoryBreakdown.map((c, index) => (
                <div key={c.label + index} className="category-item">
                  <span className="category-dot" style={{ background: c.color }} />
                  <span>{c.label}</span>
                  <span className="category-amount">{formatCurrency(c.amount)}</span>
                  <span className="category-pct">{c.pct}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-grid">
        <div className="chart-card col-span-7">
          <div className="chart-header">
            <h4 className="chart-title">Recent Transactions</h4>
            <Link to="/transactions" className="chart-link">
              View all <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </Link>
          </div>
          <div className="transaction-list">
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                No transactions yet.
              </div>
            ) : (
              recentTransactions.map(txn => {
                const style = getCategoryStyle(txn.category);
                return (
                  <div key={txn.transaction_id || txn.id} className="transaction-item">
                    <div className="transaction-icon" style={{ background: style.bg, color: style.color }}>
                      <span className="material-symbols-outlined">{style.icon}</span>
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-name">{txn.merchant}</div>
                      <div className="transaction-category">{txn.category}</div>
                    </div>
                    <div className="transaction-date">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="transaction-amount expense">
                      -{formatCurrency(txn.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="chart-card col-span-5">
          <div className="chart-header">
            <h4 className="chart-title">Budget Overview</h4>
            <Link to="/budgets" className="chart-link">
              View all <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </Link>
          </div>
          <div className="budget-list">
            {budgetOverview.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                No active budgets set.
                <br />
                <Link to="/budgets" className="chart-link" style={{ marginTop: 8, display: 'inline-block' }}>
                  Set a budget
                </Link>
              </div>
            ) : (
              budgetOverview.map(b => (
                <div key={b.budget_id || b.id} className="budget-item">
                  <div className="budget-header">
                    <span className="budget-label">
                      <span className="category-dot" style={{ background: b.color }} />
                      {b.category_name || b.name}
                    </span>
                    <span className="budget-amount">
                      <strong>{formatCurrency(b.spent)}</strong> / {formatCurrency(b.limit)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(b.percentage, 100)}%`,
                        background: b.percentage > 90 ? 'var(--danger)' : b.percentage > 70 ? 'var(--tertiary)' : b.color,
                      }}
                    />
                  </div>
                  <div className="budget-footer">
                    <span>{b.percentage}% used</span>
                    <span style={{ color: b.percentage > 100 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {b.percentage > 100 ? 'Exceeded' : b.percentage > 90 ? 'Almost reached' : 'On track'}
                    </span>
                  </div>
                </div>
              ))
            )}
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
