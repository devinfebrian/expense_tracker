import mongoose from 'mongoose';
import crypto from 'crypto';

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  category_name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
