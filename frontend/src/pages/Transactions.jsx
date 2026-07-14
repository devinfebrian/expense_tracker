import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';
import TransactionModal from '../components/TransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';

export default function Transactions() {
  const transactions = useTransactionStore(state => state.transactions);
  const categories = useTransactionStore(state => state.categories);
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const loadCategories = useTransactionStore(state => state.loadCategories);
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const editTransaction = useTransactionStore(state => state.editTransaction);
  const deleteTransaction = useTransactionStore(state => state.deleteTransaction);
  const loading = useTransactionStore(state => state.loading);

  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [loadTransactions, loadCategories]);

  const filtered = transactions.filter(t => {
    if (filterCat !== 'all' && t.category_id !== filterCat) return false;
    
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

  useEffect(() => { setCurrentPage(1); }, [filterPeriod, filterCat, searchQuery]); // eslint-disable-line react-hooks/set-state-in-effect

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setShowModal(true);
  };

  const handleSave = async (formPayload) => {
    try {
      if (editing) {
        await editTransaction(editing.transaction_id, formPayload);
      } else {
        await addTransaction(formPayload);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      alert(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (transaction_id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteTransaction(transaction_id);
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

      {loading && transactions.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading expenses...</div>
      ) : (
        <>
          <div className="txn-summary">
            <SummaryCard label="TOTAL EXPENSES" value={`Rp${total.toLocaleString('id-ID')}`} />
            <SummaryCard label="TRANSACTIONS" value={count} />
            <SummaryCard label="AVERAGE" value={`Rp${average.toLocaleString('id-ID')}`} />
          </div>

          <div className="table-card">
            <TransactionTable 
              transactions={paginated} 
              showActions={true} 
              onEdit={openEdit} 
              onDelete={handleDelete} 
            />
          </div>

          {filtered.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={count}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <TransactionModal 
        isOpen={showModal}
        editingItem={editing}
        categories={categories}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </Layout>
  );
}
