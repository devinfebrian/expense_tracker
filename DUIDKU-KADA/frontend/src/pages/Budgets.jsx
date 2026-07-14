import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

export default function Budgets({ onLogout }) {
  const [budgets, setBudgets] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'Food', limit: '', period: 'monthly' })
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Housing', 'Others']

  const fetchData = () => {
    fetch('/api/budgets').then(r => r.json()).then(setBudgets)
    fetch('/api/budgets/adjustments').then(r => r.json()).then(setAdjustments)
  }
  useEffect(() => { fetchData() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', category: 'Food', limit: '', period: 'monthly' })
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({ name: b.name, category: b.category, limit: b.limit.toString(), period: b.period })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const body = { ...form, limit: parseFloat(form.limit) }
    if (editing) {
      await fetch(`/api/budgets/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const isOverBudget = budgets.some(b => b.percentage >= 100)
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <Layout onLogout={onLogout}>
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
          <h3 className={`summary-value ${totalBudget - totalSpent < 0 ? 'text-tertiary' : ''}`}>Rp{(totalBudget - totalSpent).toLocaleString('id-ID')}</h3>
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
          const pct = Math.min(b.percentage, 100)
          const warn = b.percentage >= 100
          return (
            <div key={b.id} className={`budget-card ${warn ? 'card-warning' : ''}`}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-name">{b.name}</h3>
                  <p className="budget-card-period">{b.period.toUpperCase()}</p>
                </div>
                <div className="budget-card-actions">
                  <button className="icon-btn" onClick={() => openEdit(b)}><span className="material-symbols-outlined">edit</span></button>
                  <button className="icon-btn text-tertiary" onClick={() => handleDelete(b.id)}><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
              <div className="budget-card-amounts">
                <span className={`budget-card-spent ${warn ? 'text-tertiary' : 'text-secondary'}`}>Rp{b.spent.toLocaleString('id-ID')}</span>
                <span className="budget-card-limit">/ Rp{b.limit.toLocaleString('id-ID')}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${warn ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="budget-card-status">
                <span>{b.category}</span>
                <span className={warn ? 'text-tertiary' : ''}>{b.status}</span>
              </div>
            </div>
          )
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
                {adjustments.map(a => (
                  <tr key={a.id}>
                    <td className="text-on-surface-variant">{a.date}</td>
                    <td>{a.budgetName}</td>
                    <td><span className={`text-${a.type === 'increase' ? 'tertiary' : 'secondary'}`}>{a.type === 'increase' ? '+' : '-'}Rp{Math.abs(a.amount).toLocaleString('id-ID')}</span></td>
                    <td className="text-on-surface-variant">{a.reason}</td>
                  </tr>
                ))}
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
              <button className="icon-btn" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Budget Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Limit (Rp)</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.limit} onChange={e => setForm(f => ({...f, limit: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select className="form-input" value={form.period} onChange={e => setForm(f => ({...f, period: e.target.value}))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'UPDATE' : 'CREATE'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
