import { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/axios.js';

// Helper function to format number string as Rupiah thousands (e.g. 1.000.000)
const formatRupiah = (value) => {
  if (!value) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return parseInt(clean, 10).toLocaleString('id-ID');
};

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

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAi, setShowAi] = useState(false);

  const handleAiParse = async (file) => {
    setAiLoading(true);
    setAiError('');
    try {
      let payload = {};
      if (file) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;
        payload = {
          image: base64Data,
          mimeType: file.type
        };
      } else {
        if (!aiInput.trim()) {
          throw new Error('Please enter text or select a receipt photo first.');
        }
        payload = { text: aiInput };
      }

      const res = await api.post('/ai/parse-expense', payload);
      if (res.data.status === 'success') {
        const data = res.data.data;
        
        // Find matching category_id
        const matchedCategory = categories.find(
          c => c.category_name.toLowerCase().includes(data.category.toLowerCase()) || 
               data.category.toLowerCase().includes(c.category_name.toLowerCase())
        );

        setForm({
          merchant: data.merchant || '',
          category_id: matchedCategory ? (matchedCategory.category_id || matchedCategory.id) : (categories[0]?.category_id || categories[0]?.id || ''),
          amount: data.amount ? formatRupiah(data.amount.toString()) : '',
          date: data.date || new Date().toISOString().split('T')[0],
          notes: data.notes || ''
        });

        setAiInput('');
        setShowAi(false);
      } else {
        throw new Error(res.data.message || 'Failed to parse inputs');
      }
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.message || err.message || 'AI parsing failed. Please check inputs.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (editingItem) {
      setForm({
        merchant: editingItem.merchant,
        category_id: editingItem.category_id,
        amount: formatRupiah(editingItem.amount.toString()),
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
    const cleanAmount = form.amount.toString().replace(/\D/g, '');
    onSave({
      ...form,
      amount: parseFloat(cleanAmount) || 0
    });
  };

  return (
    <Modal 
      title={editingItem ? 'Edit Expense' : 'Add Expense'} 
      onClose={onClose}
    >
      {/* AI Quick Fill Section */}
      {!editingItem && (
        <div className="ai-quickfill" style={{ marginBottom: '16px', background: 'var(--surface-container-low)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
              AI Quick Fill (Gemini)
            </span>
            <button 
              type="button" 
              onClick={() => setShowAi(!showAi)} 
              className="btn-secondary" 
              style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px' }}
            >
              {showAi ? 'Close' : 'Use AI'}
            </button>
          </div>
          
          {showAi && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                className="form-input form-textarea"
                style={{ fontSize: '12px', padding: '8px' }}
                placeholder="e.g. Spent Rp 50.000 at Indomaret for snacks yesterday afternoon"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                rows={2}
                disabled={aiLoading}
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label 
                    htmlFor="receipt-upload" 
                    className="btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>photo_camera</span>
                    Upload Receipt
                  </label>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) handleAiParse(file);
                    }}
                    disabled={aiLoading}
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '4px 12px', fontSize: '11px' }}
                  onClick={() => handleAiParse(null)}
                  disabled={aiLoading || !aiInput.trim()}
                >
                  {aiLoading ? 'Parsing...' : 'Parse Text'}
                </button>
              </div>
              
              {aiError && <p style={{ color: 'var(--error)', fontSize: '11px', margin: '4px 0 0 0' }}>{aiError}</p>}
            </div>
          )}
        </div>
      )}

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
              type="text" 
              inputMode="numeric"
              value={form.amount} 
              onChange={e => {
                const formatted = formatRupiah(e.target.value);
                setForm(f => ({ ...f, amount: formatted }));
              }} 
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
