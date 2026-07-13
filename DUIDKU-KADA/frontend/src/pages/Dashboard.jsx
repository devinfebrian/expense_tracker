import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [data, setData] = useState({ summary: {}, transactions: [], budgets: [] })

  useEffect(() => {
    Promise.all([
      fetch('/api/summary').then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/budgets').then(r => r.json()),
    ]).then(([summary, transactions, budgets]) => setData({ summary, transactions, budgets }))
  }, [])

  const { summary, transactions, budgets } = data

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
      <div className="dashboard-grid">
        <div className="summary-card">
          <p className="summary-label">TOTAL EXPENSES</p>
          <h3 className="summary-value">Rp8,210,450</h3>
          <div className="summary-trend">
            <span className="material-symbols-outlined">trending_up</span>
            <span className="summary-trend-text">{summary.expenseChange || 4.2}% from last month</span>
          </div>
        </div>
        <div className="summary-card">
          <p className="summary-label">THIS MONTH</p>
          <h3 className="summary-value text-secondary">Rp4,697,450</h3>
          <div className="progress-bar">
            <div className="progress-fill bg-secondary" style={{ width: '66%' }} />
          </div>
          <p className="summary-trend-text" style={{ marginTop: 4 }}>Rp302,550 remaining</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">DAILY AVERAGE</p>
          <h3 className="summary-value text-tertiary">Rp156,582</h3>
          <div className="summary-trend">
            <span className="material-symbols-outlined">info</span>
            <span className="summary-trend-text">Based on last 30 days</span>
          </div>
        </div>

        <div className="chart-card col-span-8">
          <div className="chart-header">
            <h4 className="chart-title">Spending Trends</h4>
            <div className="chart-legend">
              <span className="legend-dot bg-primary" />
              <span className="legend-label">Monthly Spending</span>
            </div>
          </div>
          <div className="bar-chart">
            {[40,55,45,70,90,65,50,40,80,35,60,75].map((v,i) => (
              <div key={i} className="bar-item">
                <div className={`bar ${v === 90 ? 'bar-active' : ''}`} style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        <div className="chart-card col-span-4">
          <h4 className="chart-title">Expense Categories</h4>
          <div className="doughnut-container">
            <div className="doughnut">
              <div className="doughnut-center">
                <span className="doughnut-value">100%</span>
                <p className="doughnut-label">Total</p>
              </div>
            </div>
          </div>
          <div className="category-list">
            {[
              { label: 'Housing', pct: 35, color: 'bg-primary' },
              { label: 'Food', pct: 25, color: 'bg-secondary-container' },
              { label: 'Transport', pct: 20, color: 'bg-surface-variant' },
              { label: 'Others', pct: 20, color: 'bg-on-tertiary-container' },
            ].map(c => (
              <div key={c.label} className="category-item">
                <span className={`category-dot ${c.color}`} />
                <span>{c.label}</span>
                <span className="category-pct">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card col-span-5">
          <div className="chart-header">
            <h4 className="chart-title">Budget Health</h4>
            <Link to="/budgets" className="chart-link">Manage</Link>
          </div>
          <div className="budget-list">
            {budgets.map(b => (
              <div key={b.id} className="budget-item">
                <div className="budget-header">
                  <span className="budget-label">{b.name.toUpperCase()}</span>
                  <span className={`budget-amount ${b.warning ? 'text-tertiary' : ''}`}>
                    Rp{b.spent.toLocaleString('id-ID')} / Rp{b.limit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${b.warning ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                </div>
                <div className="budget-header" style={{ marginTop: 2 }}>
                  <span className="text-on-surface-variant" style={{ fontSize: 10 }}>{b.period.toUpperCase()}</span>
                  <span className={b.statusClass} style={{ fontSize: 11, fontWeight: 600 }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card col-span-7">
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
                {transactions.slice(0, 5).map(txn => (
                  <tr key={txn.id}>
                    <td>
                      <div className="merchant-cell">
                        <div className="merchant-icon">
                          <span className="material-symbols-outlined">{txn.icon}</span>
                        </div>
                        <span>{txn.merchant}</span>
                      </div>
                    </td>
                    <td><span className={`category-chip ${txn.categoryClass}`}>{txn.category}</span></td>
                    <td className="text-on-surface-variant">{txn.date}</td>
                    <td className="text-right text-tertiary">-Rp{txn.amount.toFixed(2).replace('.', ',')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <button className="fab">+</button>
    </Layout>
  )
}
