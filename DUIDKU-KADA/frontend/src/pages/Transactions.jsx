import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ merchant: '', category: 'Food', amount: '', date: '', notes: '' })
  const [summary, setSummary] = useState({ total: 0, count: 0 })
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Housing', 'Others']

  const fetchTxns = () => {
    fetch('/api/transactions').then(r => r.json()).then(setTransactions)
  }
  useEffect(() => { fetchTxns() }, [])

  const filtered = transactions.filter(t => {
    if (filterCat !== 'all' && t.category !== filterCat) return false
    if (filterPeriod === 'all') return true
    const d = new Date(t.date)
    const now = new Date()
    if (filterPeriod === 'daily') return d.toDateString() === now.toDateString()
    if (filterPeriod === 'weekly') { const w = new Date(now); w.setDate(w.getDate()-7); return d >= w }
    if (filterPeriod === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (filterPeriod === 'last7') { const w = new Date(now); w.setDate(w.getDate()-7); return d >= w }
    if (filterPeriod === 'last30') { const w = new Date(now); w.setDate(w.getDate()-30); return d >= w }
    return true
  })

  useEffect(() => {
    setSummary({ total: filtered.reduce((s,t) => s + t.amount, 0), count: filtered.length })
  }, [filtered])

  const openAdd = () => {
    setEditing(null)
    setForm({ merchant: '', category: 'Food', amount: '', date: '', notes: '' })
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({ merchant: t.merchant, category: t.category, amount: t.amount.toString(), date: t.date, notes: t.notes || '' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const body = { ...form, amount: parseFloat(form.amount) }
    if (editing) {
      await fetch(`/api/transactions/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setShowModal(false)
    fetchTxns()
  }

  const handleDelete = async (id) => {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    fetchTxns()
  }

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
  ]

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">History Expense</h1>
          <p className="page-subtitle">View and manage all your recorded expenses.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Expense</button>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          {periods.map(p => (
            <button key={p.value} className={`filter-tab ${filterPeriod === p.value ? 'active' : ''}`} onClick={() => setFilterPeriod(p.value)}>{p.label}</button>
          ))}
        </div>
        <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="txn-summary">
        <div className="summary-card mini">
          <p className="summary-label">TOTAL EXPENSES</p>
          <h3 className="summary-value">Rp{summary.total.toLocaleString('id-ID')}</h3>
        </div>
        <div className="summary-card mini">
          <p className="summary-label">TRANSACTIONS</p>
          <h3 className="summary-value">{summary.count}</h3>
        </div>
        <div className="summary-card mini">
          <p className="summary-label">AVERAGE</p>
          <h3 className="summary-value">Rp{summary.count > 0 ? Math.round(summary.total/summary.count).toLocaleString('id-ID') : 0}</h3>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>MERCHANT</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th className="text-right">AMOUNT</th>
                <th className="text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id}>
                  <td>
                    <div className="merchant-cell">
                      <div className="merchant-icon"><span className="material-symbols-outlined">{txn.icon}</span></div>
                      <div>
                        <span>{txn.merchant}</span>
                        {txn.notes && <p className="merchant-notes">{txn.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td><span className={`category-chip ${txn.categoryClass}`}>{txn.category}</span></td>
                  <td className="text-on-surface-variant">{txn.date}</td>
                  <td className="text-right text-tertiary">-Rp{txn.amount.toLocaleString('id-ID')}</td>
                  <td className="text-center">
                    <button className="icon-btn" onClick={() => openEdit(txn)}><span className="material-symbols-outlined">edit</span></button>
                    <button className="icon-btn text-tertiary" onClick={() => handleDelete(txn.id)}><span className="material-symbols-outlined">delete</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Expense' : 'Add Expense'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Merchant</label>
                  <input className="form-input" value={form.merchant} onChange={e => setForm(f => ({...f, merchant: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (Rp)</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input form-textarea" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Optional notes..." rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'UPDATE' : 'ADD'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
