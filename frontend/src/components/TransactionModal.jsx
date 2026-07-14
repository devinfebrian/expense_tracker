import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function TransactionModal({
  isOpen,
  editingItem,
  categories,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    merchant: '',
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        merchant: editingItem.merchant,
        category_id: editingItem.category_id,
        amount: editingItem.amount.toString(),
        date: editingItem.date,
        notes: editingItem.notes || ''
      });
    } else {
      setForm({
        merchant: '',
        category_id: categories[0]?.category_id || categories[0]?.id || '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [editingItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal 
      title={editingItem ? 'Edit Expense' : 'Add Expense'} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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
              {categories.map(c => (
                <option key={c.category_id || c.id} value={c.category_id || c.id}>
                  {c.category_name}
                </option>
              ))}
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
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">{editingItem ? 'UPDATE' : 'ADD'}</button>
        </div>
      </form>
    </Modal>
  );
}
