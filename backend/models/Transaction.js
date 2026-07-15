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
    required: true,
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
    required: [true, 'Merchant name is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
