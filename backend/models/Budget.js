import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
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
  limit: {
    type: Number,
    required: [true, 'Limit is required'],
    min: [0, 'Limit cannot be negative'],
  },
  monthly: {
    type: Boolean,
    default: false,
  },
  daily: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

budgetSchema.index({ user_id: 1, category_id: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
