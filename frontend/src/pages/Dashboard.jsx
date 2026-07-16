import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
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
  const opts = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  return `${range.start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}, ${end.getUTCFullYear()}`;
};

function SpendingTrendsChart({ labels, totals }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const scrollRef = useRef(null);

  const maxDaily = Math.max(...totals, 1000);
  const today = new Date().getUTCDate();
  const todayIndex = labels.indexOf(today);
  const barW = 52;
  const gap = 12;
  const slotW = barW + gap;
  const visibleDays = 7;
  const chartH = 260;

  useEffect(() => {
    if (scrollRef.current && todayIndex >= 0) {
      const containerWidth = scrollRef.current.clientWidth;
      const scrollTo = todayIndex * slotW + barW / 2 - containerWidth / 2;
      scrollRef.current.scrollLeft = Math.max(0, scrollTo);
    }
  }, [todayIndex, labels.length]);

  const formatAmountLabel = (val) => {
    if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `Rp${Math.round(val / 1000)}k`;
    return `Rp${val}`;
  };

  const getBarColor = (isToday, isHovered) => {
    if (isHovered) return isToday ? 'var(--tertiary)' : 'var(--primary-dark)';
    if (isToday) return 'var(--tertiary)';
    return 'var(--primary)';
  };

  const getTrackColor = (isToday) => {
    if (isToday) return 'var(--tertiary-light)';
    return 'var(--primary-light)';
  };

  const gridPcts = [100, 75, 50, 25];

  return (
    <>
      <div className="chart-header">
        <div>
          <div className="chart-subtitle" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatCurrency(totals.reduce((s, t) => s + t, 0))}
          </div>
          <div className="chart-subtitle-label">Spending Overview</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', flex: 1 }}>
        <div style={{ width: '60px', height: `${chartH}px`, position: 'relative', flexShrink: 0, zIndex: 2, background: 'var(--surface)' }}>
          {[100, 75, 50, 25, 0].map(pct => (
            <span
              key={pct}
              style={{
                position: 'absolute',
                right: 0,
                top: pct === 100 ? '0' : pct === 0 ? `${chartH}px` : `${chartH * (1 - pct / 100)}px`,
                transform: 'translateY(-50%)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatAmountLabel(maxDaily * pct / 100)}
            </span>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: `${visibleDays * slotW}px` }}>
          <div
            ref={scrollRef}
            className="chart-scroll-container"
            style={{ overflowX: 'auto', overflowY: 'hidden' }}
          >
            <div style={{ width: `${labels.length * slotW}px` }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: `${chartH}px`,
                position: 'relative',
              }}>
                {gridPcts.map(pct => (
                  <div
                    key={pct}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${chartH * (1 - pct / 100)}px`,
                      height: '1px',
                      background: 'var(--border-light)',
                      zIndex: 0,
                    }}
                  />
                ))}

                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: 'var(--border-light)', zIndex: 0 }} />

                {totals.map((v, i) => {
                  const pct = maxDaily > 0 ? (v / maxDaily) * 100 : 0;
                  const isHovered = hoveredIndex === i;
                  const isToday = i === todayIndex;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        width: `${slotW}px`,
                        height: '100%',
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: 1,
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseMove={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onTouchStart={() => setHoveredIndex(i)}
                      onTouchMove={() => setHoveredIndex(i)}
                      onTouchEnd={() => setHoveredIndex(null)}
                    >
                      {v > 0 && isHovered && (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'var(--primary)',
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                        }}>
                          {formatAmountLabel(v)}
                        </div>
                      )}

                      <div style={{
                        width: `${barW}px`,
                        height: `${Math.max(pct, v > 0 ? 4 : 0)}%`,
                        minHeight: v > 0 ? '4px' : '0',
                        background: v > 0 ? getBarColor(isToday, isHovered) : getTrackColor(isToday),
                        borderRadius: '6px 6px 2px 2px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                        boxShadow: isHovered && v > 0 ? `0 4px 12px ${isToday ? 'rgba(245,158,11,0.4)' : 'rgba(91,108,245,0.4)'}` : 'none',
                      }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', marginTop: '6px' }}>
                {labels.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${slotW}px`,
                      flexShrink: 0,
                      fontSize: '11px',
                      fontWeight: '700',
                      color: i === todayIndex ? 'var(--tertiary)' : 'var(--text-secondary)',
                      textAlign: 'center',
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [chartMounted, setChartMounted] = useState(false);

  useEffect(() => {
    setChartMounted(true);
  }, []);

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

    // Transactions for selected period
    const recentTransactions = [...periodTxns]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Budget overview — all budgets for selected period
    const budgetOverview = budgets
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
      });

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

    return {
      totalExpenses,
      transactionCount,
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
          <div className="period-picker">
            <button className="icon-btn" onClick={goPrev} aria-label="Previous month">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="period-picker-label">
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
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Add Expense
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--gutter)', alignItems: 'stretch' }}>
        <div className="chart-card col-span-8" style={{ display: 'flex', flexDirection: 'column' }}>
          <SpendingTrendsChart
            labels={dailyLabels}
            totals={dailyTotals}
          />
        </div>

        <div className="chart-card col-span-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-header">
            <h4 className="chart-title">Budget Overview</h4>
            <Link to="/budgets" className="chart-link">
              View all <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </Link>
          </div>
          <div className="scrollable-container budget-scrollable" style={{ maxHeight: '430px', flex: 1 }}>
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

      {/* Bottom Row */}
      <div className="dashboard-grid" style={{ alignItems: 'stretch' }}>
        <div className="chart-card col-span-8" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-header">
            <h4 className="chart-title">Transactions</h4>
            <Link to="/transactions" className="chart-link">
              View all <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </Link>
          </div>
          <div className="scrollable-container" style={{ maxHeight: '430px', flex: 1 }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                No transactions this period.
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
                    <div className="transaction-date">{new Date(txn.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="transaction-amount expense">
                      -{formatCurrency(txn.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="chart-card col-span-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-header">
            <h4 className="chart-title">Expense by Category</h4>
          </div>
          <div className="doughnut-container" style={{ position: 'relative', minHeight: '220px' }}>
            <svg
              viewBox="-100 -100 200 200"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '220px',
                transform: chartMounted ? 'scale(1)' : 'scale(0.9)',
                opacity: chartMounted ? 1 : 0,
                transition: 'transform 0.4s ease, opacity 0.4s ease',
              }}
            >
              {categoryBreakdown.length === 0 ? (
                <circle cx="0" cy="0" r="90" fill="var(--border-light)" />
              ) : (
                categoryBreakdown.map((c, i) => {
                  const startAngle = categoryBreakdown.slice(0, i).reduce((sum, cat) => sum + cat.pct, 0) * 3.6;
                  const endAngle = startAngle + c.pct * 3.6;
                  const largeArc = c.pct * 3.6 > 180 ? 1 : 0;
                  const r = 90;
                  const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * r;
                  const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * r;
                  const x2 = Math.cos((endAngle - 90) * Math.PI / 180) * r;
                  const y2 = Math.sin((endAngle - 90) * Math.PI / 180) * r;
                  const path = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const midAngle = startAngle + (c.pct * 3.6 / 2);
                  const labelR = 60;
                  const lx = Math.cos((midAngle - 90) * Math.PI / 180) * labelR;
                  const ly = Math.sin((midAngle - 90) * Math.PI / 180) * labelR;
                  const getClientPos = (e) => e.touches && e.touches.length > 0 ? e.touches[0] : e;
                  return (
                    <g key={`${c.label}-${i}`}>
                      <path
                        d={path}
                        fill={c.color}
                        stroke="#fff"
                        strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                        opacity={hoveredSlice === null || hoveredSlice === i ? 1 : 0.5}
                        onMouseEnter={() => setHoveredSlice(i)}
                        onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onTouchStart={(e) => { setHoveredSlice(i); setTooltipPos({ x: getClientPos(e).clientX, y: getClientPos(e).clientY }); }}
                        onTouchMove={(e) => { setHoveredSlice(i); setTooltipPos({ x: getClientPos(e).clientX, y: getClientPos(e).clientY }); }}
                        onTouchEnd={() => setHoveredSlice(null)}
                      />
                      {c.pct >= 5 && (
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="12"
                          fontWeight="700"
                          fill="#fff"
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth="3"
                          paintOrder="stroke"
                          style={{ pointerEvents: 'none' }}
                        >
                          {c.pct}%
                        </text>
                      )}
                    </g>
                  );
                })
              )}
            </svg>
            {hoveredSlice !== null && categoryBreakdown[hoveredSlice] && (
              <div
                style={{
                  position: 'fixed',
                  left: tooltipPos.x + 10,
                  top: tooltipPos.y + 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 10px',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {categoryBreakdown[hoveredSlice].label}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {formatCurrency(categoryBreakdown[hoveredSlice].amount)}
                </div>
              </div>
            )}
          </div>
          <div className="category-list">
            {categoryBreakdown.length === 0 ? (
              <div className="category-item" style={{ color: 'var(--text-secondary)', justifyContent: 'center' }}>
                No expenses this period
              </div>
            ) : (
              categoryBreakdown.map((c, index) => (
                <div key={c.label + index} className="category-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span className="category-dot" style={{ background: c.color }} />
                    <span>{c.label}</span>
                  </div>
                  <span className="category-amount">{formatCurrency(c.amount)}</span>
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
