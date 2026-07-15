import mongoose from 'mongoose';
import crypto from 'crypto';

const budgetSchema = new mongoose.Schema({
  budget_id: {
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
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Limit cannot be negative'],
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'monthly',
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    trim: true,
    index: true,
  },
}, {
  timestamps: true,
});

budgetSchema.index(
  { user_id: 1, category_id: 1, type: 1, period: 1 },
  { unique: true }
);

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
