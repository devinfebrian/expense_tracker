import Category from '../models/Category.js';

export const fetchAllCategories = async () => {
  const categories = await Category.find().sort({ category_name: 1 });
  return categories.map(c => ({
    id: c.category_id,
    category_id: c.category_id,
    category_name: c.category_name,
    name: c.category_name
  }));
};
