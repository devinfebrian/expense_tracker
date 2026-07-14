import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios.js';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txnRes, budgetRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/budgets')
        ]);
        setTransactions(txnRes.data.data || []);
        setBudgets(budgetRes.data.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Dynamic summary calculations
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Transactions in current month
  const monthlyTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalSpent = monthlyTxns.reduce((sum, t) => sum + t.amount, 0);

  // Previous month spent
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
  const prevMonthSpent = prevMonthTxns.reduce((sum, t) => sum + t.amount, 0);

  // Month-on-month trend
  let expenseChange = 0;
  if (prevMonthSpent > 0) {
    expenseChange = parseFloat((((totalSpent - prevMonthSpent) / prevMonthSpent) * 100).toFixed(1));
  } else if (totalSpent > 0) {
    expenseChange = 100.0;
  }

  // Budgets total limit & progress
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const expenseProgress = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
  const remainingBudget = Math.max(totalLimit - totalSpent, 0);

  // Daily average spending
  const currentDay = now.getDate();
  const dailyAverage = Math.round(totalSpent / currentDay);

  // 2. Spending Trends: group by month for the current year
  const monthlyTotals = Array(12).fill(0);
  transactions.forEach(t => {
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

  // 3. Category shares calculations
  const categoriesMap = {};
  transactions.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });
  const totalCategoryAmount = Object.values(categoriesMap).reduce((s, v) => s + v, 0);
  const categoryBreakdown = Object.keys(categoriesMap).map(cat => {
    const amt = categoriesMap[cat];
    const pct = totalCategoryAmount > 0 ? Math.round((amt / totalCategoryAmount) * 100) : 0;
    return { label: cat, pct };
  }).sort((a, b) => b.pct - a.pct).slice(0, 4);

  const categoryColors = ['bg-primary', 'bg-secondary-container', 'bg-surface-variant', 'bg-on-tertiary-container'];
  const displayCategories = categoryBreakdown.length > 0 ? categoryBreakdown : [
    { label: 'No expenses yet', pct: 0 }
  ];

  // 4. Budget Health calculations
  const getPeriodStart = (period) => {
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

  const getBudgetIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('housing') || n.includes('rent') || n.includes('living')) return 'home';
    if (n.includes('dining') || n.includes('restaurant') || n.includes('food') || n.includes('grocery') || n.includes('groceries')) return 'restaurant';
    if (n.includes('transport') || n.includes('car')) return 'directions_car';
    if (n.includes('entertainment') || n.includes('movie') || n.includes('netflix')) return 'movie';
    if (n.includes('education')) return 'school';
    return 'account_balance_wallet';
  };

  const calculatedBudgets = budgets.map(b => {
    const startOfPeriod = getPeriodStart(b.period);
    const categoryTxns = transactions.filter(t => 
      t.category.toLowerCase() === b.name.toLowerCase() && 
      new Date(t.date) >= startOfPeriod
    );
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
      icon: b.icon || getBudgetIcon(b.name)
    };
  });

  if (loading) {
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
        <div className="page-actions">
          <button className="btn-secondary">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="btn-text">This Month</span>
          </button>
          <Link to="/budgets" className="btn-primary">Set Budget</Link>
        </div>
      </div>

      {/* Facts Row: Small horizontal cards for key metrics */}
      <div className="facts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="summary-card">
          <p className="summary-label">TOTAL EXPENSES</p>
          <h3 className="summary-value">Rp{totalExpenses.toLocaleString('id-ID')}</h3>
          <div className="summary-trend">
            <span className="material-symbols-outlined" style={{ color: expenseChange >= 0 ? 'var(--error)' : 'var(--on-secondary-container)' }}>
              {expenseChange >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className="summary-trend-text" style={{ color: expenseChange >= 0 ? 'var(--error)' : 'var(--on-secondary-container)' }}>
              {Math.abs(expenseChange)}% from last month
            </span>
          </div>
        </div>
        <div className="summary-card">
          <p className="summary-label">THIS MONTH</p>
          <h3 className="summary-value text-secondary">Rp{totalSpent.toLocaleString('id-ID')}</h3>
          <div className="progress-bar">
            <div className="progress-fill bg-secondary" style={{ width: `${expenseProgress}%` }} />
          </div>
          <p className="summary-trend-text" style={{ marginTop: 4, color: 'var(--on-surface-variant)' }}>
            Rp{remainingBudget.toLocaleString('id-ID')} remaining
          </p>
        </div>
        <div className="summary-card">
          <p className="summary-label">DAILY AVERAGE</p>
          <h3 className="summary-value text-tertiary">Rp{dailyAverage.toLocaleString('id-ID')}</h3>
          <div className="summary-trend">
            <span className="material-symbols-outlined">info</span>
            <span className="summary-trend-text" style={{ color: 'var(--on-surface-variant)' }}>Based on current month days</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards Grid */}
      <div className="dashboard-grid">
        {/* Row 1: Expense Categories & Recent Expenses */}
        <div className="chart-card col-span-4">
          <h4 className="chart-title">Expense Categories</h4>
          <div className="doughnut-container">
            <div className="doughnut" style={{ border: '16px solid var(--surface-container-high)', position: 'relative' }}>
              <div className="doughnut-center">
                <span className="doughnut-value">
                  {categoryBreakdown.length > 0 ? 'Share' : '0%'}
                </span>
                <p className="doughnut-label">Breakdown</p>
              </div>
            </div>
          </div>
          <div className="category-list">
            {displayCategories.map((c, index) => (
              <div key={c.label} className="category-item">
                <span className={`category-dot ${categoryColors[index % categoryColors.length]}`} />
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
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>MERCHANT</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th className="text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px 0' }}>
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map(txn => (
                    <tr key={txn.id}>
                      <td>
                        <div className="merchant-cell">
                          <div className="merchant-icon">
                            <span className="material-symbols-outlined">{txn.icon}</span>
                          </div>
                          <span>{txn.merchant}</span>
                        </div>
                      </td>
                      <td><span className={`category-chip ${txn.categoryClass || 'surface-container-highest text-primary'}`}>{txn.category}</span></td>
                      <td className="text-on-surface-variant">{txn.date}</td>
                      <td className="text-right text-tertiary">-Rp{txn.amount.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 2: Budget Health (Full Width) */}
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
                <div key={b.id} className="budget-item" style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                  <div className="budget-header">
                    <span className="budget-label">{b.name.toUpperCase()}</span>
                    <span className={`budget-amount ${b.warning ? 'text-tertiary' : ''}`}>
                      Rp{b.spent.toLocaleString('id-ID')} / Rp{b.limit.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: '8px' }}>
                    <div className={`progress-fill ${b.warning ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                  </div>
                  <div className="budget-header" style={{ marginTop: 8 }}>
                    <span className="text-on-surface-variant" style={{ fontSize: 10 }}>{b.period.toUpperCase()}</span>
                    <span className={b.statusClass} style={{ fontSize: 11, fontWeight: 600 }}>{b.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Row 3: Spending Trends Chart (Full Width) */}
        <div className="chart-card" style={{ gridColumn: 'span 12' }}>
          <div className="chart-header">
            <h4 className="chart-title">Spending Trends</h4>
            <div className="chart-legend">
              <span className="legend-dot bg-primary" />
              <span className="legend-label">Monthly Spending</span>
            </div>
          </div>
          <div className="bar-chart">
            {spendingData.map((v, i) => (
              <div key={i} className="bar-item">
                <div className={`bar ${i === currentMonth ? 'bar-active' : ''}`} style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
