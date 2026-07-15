import { useState, useEffect } from 'react';
import Modal from './Modal';

// Helper function to format number string as Rupiah thousands (e.g. 1.000.000)
const formatRupiah = (value) => {
  if (!value) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return parseInt(clean, 10).toLocaleString('id-ID');
};

export default function BudgetModal({
  isOpen,
  editingItem,
  categories,
  onClose,
  onSave,
  error
}) {
  const [form, setForm] = useState({
    category_id: '',
    limit: '',
    type: 'monthly'
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        category_id: editingItem.category_id,
        limit: formatRupiah(editingItem.limit.toString()),
        type: editingItem.type || 'monthly'
      });
    } else {
      setForm({
        category_id: categories[0]?.category_id || categories[0]?.id || '',
        limit: '',
        type: 'monthly'
      });
    }
  }, [editingItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanLimit = form.limit.toString().replace(/\D/g, '');
    onSave({
      ...form,
      limit: parseFloat(cleanLimit) || 0
    });
  };

  return (
    <Modal 
      title={editingItem ? 'Edit Budget' : 'New Budget'} 
      onClose={onClose}
    >
      {error && <p style={{ color: 'var(--error)', padding: '0 24px', margin: '8px 0 0 0', fontSize: 13 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Budget Name (Category)</label>
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
          <div className="form-group">
            <label className="form-label">Period</label>
            <select 
              className="form-input" 
              value={form.type} 
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label className="form-label">Limit (Rp)</label>
          <input 
            className="form-input" 
            type="text" 
            inputMode="numeric"
            value={form.limit} 
            onChange={e => {
              const formatted = formatRupiah(e.target.value);
              setForm(f => ({ ...f, limit: formatted }));
            }} 
            required 
          />
        </div>
        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">{editingItem ? 'UPDATE' : 'CREATE'}</button>
        </div>
      </form>
    </Modal>
  );
}
