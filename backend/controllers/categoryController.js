import * as categoryService from '../services/categoryService.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.fetchAllCategories();
    res.json({
      status: 'success',
      data: categories,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
  }
};
