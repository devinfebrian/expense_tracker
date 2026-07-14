import mongoose from 'mongoose';
import crypto from 'crypto';

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  user_id: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  category_id: {
    type: String,
    required: [true, 'Category ID is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  merchant: {
    type: String,
    required: [true, 'Merchant is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
