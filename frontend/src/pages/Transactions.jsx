/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios.js';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [form, setForm] = useState({
    merchant: '',
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const getCategoryClass = (cat) => {
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
      const rawCategories = catRes.data.data.categories || catRes.data.data || [];
      const rawTxns = txRes.data.data.transactions || txRes.data.data || [];

      setCategories(rawCategories);
      
      const mapped = rawTxns.map(t => ({
        ...t,
        icon: getCategoryIcon(t.category),
        categoryClass: getCategoryClass(t.category)
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = transactions.filter(t => {
    if (filterCat !== 'all' && t.category_id !== filterCat) return false;
    
    // Search query matching merchant or notes
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const merchantMatch = t.merchant && t.merchant.toLowerCase().includes(q);
      const notesMatch = t.notes && t.notes.toLowerCase().includes(q);
      if (!merchantMatch && !notesMatch) return false;
    }

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

  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const count = filtered.length;
  const average = count > 0 ? Math.round(total / count) : 0;

  const totalPages = Math.max(1, Math.ceil(count / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pageNumbers = [];
  const range = 3;
  let start = Math.max(1, currentPage - range);
  let end = Math.min(totalPages, currentPage + range);
  if (start > 2) pageNumbers.push(1, '...');
  else if (start === 2) pageNumbers.push(1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);
  if (end < totalPages - 1) pageNumbers.push('...', totalPages);
  else if (end === totalPages - 1) pageNumbers.push(totalPages);

  useEffect(() => { setCurrentPage(1); }, [filterPeriod, filterCat, searchQuery]); // eslint-disable-line react-hooks/set-state-in-effect

  const openAdd = () => {
    setEditing(null);
    setForm({
      merchant: '',
      category_id: categories[0]?.category_id || categories[0]?.id || '',
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

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.action-dropdown')) setOpenDropdownId(null);
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

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

      <div className="search-bar" style={{ marginBottom: '16px' }}>
        <div className="search-input-wrapper" style={{ position: 'relative', maxWidth: '400px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', fontSize: '20px' }}>search</span>
          <input
            type="text"
            placeholder="Search by merchant or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div className="filter-section">
        <select
          className="filter-select"
          value={filterPeriod}
          onChange={e => setFilterPeriod(e.target.value)}
        >
          {periods.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select 
          className="filter-select" 
          value={filterCat} 
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.category_id || c.id} value={c.category_id || c.id}>{c.category_name}</option>)}
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
                <th className="text-center">AMOUNT</th>
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
                paginated.map(txn => (
                  <tr key={txn.transaction_id}>
                    <td>
                      <div className="merchant-cell">
                        <div className="merchant-icon">
                          <span className="material-symbols-outlined">{txn.icon || getCategoryIcon(txn.category)}</span>
                        </div>
                        <div>
                          <span>{txn.merchant}</span>
                          {txn.notes && <p className="merchant-notes">{txn.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td data-label="Category"><span className={`category-chip ${txn.categoryClass || getCategoryClass(txn.category)}`}>{txn.category}</span></td>
                    <td data-label="Date" className="text-on-surface-variant">{txn.date}</td>
                    <td data-label="Amount" className="text-center text-tertiary">-Rp{txn.amount.toLocaleString('id-ID')}</td>
                    <td data-label="Action" className="text-center">
                      <div className="action-dropdown">
                        <button className="icon-btn" onClick={() => setOpenDropdownId(openDropdownId === txn.transaction_id ? null : txn.transaction_id)}>
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {openDropdownId === txn.transaction_id && (
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { openEdit(txn); setOpenDropdownId(null); }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              Edit
                            </button>
                            <button className="dropdown-item danger" onClick={() => { handleDelete(txn.transaction_id); setOpenDropdownId(null); }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            <span className="text-on-surface-variant">Show</span>
            <select
              className="filter-select"
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ width: 'auto', padding: '4px 8px', fontSize: '13px' }}
            >
              {[10,15,20,25,30,35,40,45,50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-on-surface-variant">of {filtered.length} transactions</span>
          </div>
          <div className="pagination-controls">
            <button
              className="btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 10px', fontSize: '13px' }}
            >
              Previous
            </button>
            <div className="pagination-pages">
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={p}
                    className={`pagination-page-btn ${p === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <div className="pagination-jump">
              <span className="text-on-surface-variant" style={{ fontSize: '13px' }}>Go to</span>
              <input
                type="number"
                className="form-input"
                min={1}
                max={totalPages}
                placeholder="#"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                     const val = parseInt(e.target.value, 10);
                     if (!isNaN(val) && val >= 1 && val <= totalPages) {
                       setCurrentPage(val);
                       e.target.value = '';
                     }
                  }
                }}
                style={{ width: '48px', textAlign: 'center', padding: '4px', fontSize: '13px' }}
              />
              <span className="text-on-surface-variant" style={{ fontSize: '13px' }}>/ {totalPages}</span>
            </div>
            <button
              className="btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 10px', fontSize: '13px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
                    {categories.map(c => <option key={c.category_id || c.id} value={c.category_id || c.id}>{c.category_name}</option>)}
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
