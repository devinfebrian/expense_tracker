import { useState } from 'react';

const ExpenseForm = ({ onAddExpense }) => {
  const [formData, setFormData] = useState({
    merchant: '',
    category: 'Food', // Default sesuai gambar
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExpense(formData); 
    alert("Expense added successfully!");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Merchant */}
      <label>Merchant</label>
      <input name="merchant" type="text" onChange={handleChange} required />

      {/* Category */}
      <label>Category</label>
      <select name="category" value={formData.category} onChange={handleChange} required>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Shopping">Shopping</option>
        <option value="Bills">Bills</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Housing">Housing</option>
        <option value="Others">Others</option>
      </select>
      
      {/* Amount */}
      <label>Amount (Rp)</label>
      <input name="amount" type="number" onChange={handleChange} required />

      {/* Date */}
      <label>Date</label>
      <input name="date" type="date" value={formData.date} onChange={handleChange} required />
      
      {/* Notes */}
      <label>Notes</label>
      <textarea name="notes" placeholder="Optional notes..." onChange={handleChange} />
      
      {/* Buttons */}
      <button type="button">CANCEL</button>
      <button type="submit">ADD</button>
    </form>
  );
};

export default ExpenseForm;