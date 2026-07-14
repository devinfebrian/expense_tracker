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
    required: [true, 'User ID is required'],
  },
  category_id: {
    type: String,
    required: [true, 'Category ID is required'],
  },
  limit: {
    type: Number,
    required: [true, 'Limit is required'],
    min: [0, 'Limit cannot be negative'],
  },
  type: {
    type: String,
    enum: ['monthly', 'daily', 'weekly'],
    required: [true, 'Type is required'],
  },
}, {
  timestamps: true,
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
