/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios.js';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    merchant: '',
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const getCategoryClass = (cat) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('food') || c.includes('drinks')) return 'bg-secondary-container text-on-secondary-fixed-variant';
    if (c.includes('living') || c.includes('rent') || c.includes('housing') || c.includes('dorm')) return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
    return 'surface-container-highest text-primary';
  };

  const getCategoryIcon = (cat) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('food') || c.includes('drinks') || c.includes('meals')) return 'restaurant';
    if (c.includes('transport') || c.includes('taxi') || c.includes('bus') || c.includes('car')) return 'directions_car';
    if (c.includes('education') || c.includes('books') || c.includes('school')) return 'school';
    if (c.includes('living') || c.includes('rent') || c.includes('dorm') || c.includes('housing')) return 'home';
    if (c.includes('personal') || c.includes('entertainment') || c.includes('shopping') || c.includes('movie') || c.includes('games')) return 'celebration';
    return 'account_balance_wallet';
  };

  const loadData = useCallback(async () => {
    try {
      const [catRes, txRes] = await Promise.all([
        api.get('/categories'),
        api.get('/transactions')
      ]);
      setCategories(catRes.data.data.categories);
      setTransactions(txRes.data.data.transactions);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = transactions.filter(t => {
    if (filterCat !== 'all' && t.category_id !== filterCat) return false;
    if (filterPeriod === 'all') return true;
    const d = new Date(t.date);
    const now = new Date();
    if (filterPeriod === 'daily') return d.toDateString() === now.toDateString();
    if (filterPeriod === 'weekly') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      return d >= w;
    }
    if (filterPeriod === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filterPeriod === 'last7') {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      return d >= w;
    }
    if (filterPeriod === 'last30') {
      const w = new Date(now);
      w.setDate(w.getDate() - 30);
      return d >= w;
    }
    return true;
  });

  // Calculate summary on-the-fly during render to avoid synchronous state-updates in effects
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const count = filtered.length;
  const average = count > 0 ? Math.round(total / count) : 0;

  const openAdd = () => {
    setEditing(null);
    setForm({
      merchant: '',
      category_id: categories[0]?.category_id || '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      merchant: t.merchant,
      category_id: t.category_id,
      amount: t.amount.toString(),
      date: t.date,
      notes: t.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(form.amount);
    
    try {
      if (editing) {
        await api.put(`/transactions/${editing.transaction_id}`, {
          merchant: form.merchant,
          category_id: form.category_id,
          amount: amountVal,
          date: form.date,
          notes: form.notes
        });
      } else {
        await api.post('/transactions', {
          merchant: form.merchant,
          category_id: form.category_id,
          amount: amountVal,
          date: form.date,
          notes: form.notes
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (transaction_id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/transactions/${transaction_id}`);
        loadData();
      } catch (err) {
        console.error('Failed to delete transaction:', err);
        alert('Failed to delete transaction');
      }
    }
  };

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
  ];

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
            <button 
              key={p.value} 
              className={`filter-tab ${filterPeriod === p.value ? 'active' : ''}`} 
              onClick={() => setFilterPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select 
          className="filter-select" 
          value={filterCat} 
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>
      </div>

      <div className="txn-summary">
        <div className="summary-card mini">
          <p className="summary-label">TOTAL EXPENSES</p>
          <h3 className="summary-value">Rp{total.toLocaleString('id-ID')}</h3>
        </div>
        <div className="summary-card mini">
          <p className="summary-label">TRANSACTIONS</p>
          <h3 className="summary-value">{count}</h3>
        </div>
        <div className="summary-card mini">
          <p className="summary-label">AVERAGE</p>
          <h3 className="summary-value">Rp{average.toLocaleString('id-ID')}</h3>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px 0' }}>
                    No expenses found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(txn => (
                  <tr key={txn.transaction_id}>
                    <td>
                      <div className="merchant-cell">
                        <div className="merchant-icon">
                          <span className="material-symbols-outlined">{getCategoryIcon(txn.category_name)}</span>
                        </div>
                        <div>
                          <span>{txn.merchant}</span>
                          {txn.notes && <p className="merchant-notes">{txn.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td><span className={`category-chip ${getCategoryClass(txn.category_name)}`}>{txn.category_name}</span></td>
                    <td className="text-on-surface-variant">{txn.date}</td>
                    <td className="text-right text-tertiary">-Rp{txn.amount.toLocaleString('id-ID')}</td>
                    <td className="text-center">
                      <button className="icon-btn" onClick={() => openEdit(txn)} style={{ marginRight: '6px' }}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="icon-btn text-tertiary" onClick={() => handleDelete(txn.transaction_id)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Expense' : 'Add Expense'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Merchant</label>
                  <input 
                    className="form-input" 
                    value={form.merchant} 
                    onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={form.category_id} 
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  >
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (Rp)</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={form.amount} 
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    className="form-input" 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea 
                  className="form-input form-textarea" 
                  value={form.notes} 
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
                  placeholder="Optional notes..." 
                  rows={3} 
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'UPDATE' : 'ADD'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
