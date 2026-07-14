import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  category_name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
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
}, {
  timestamps: true,
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
