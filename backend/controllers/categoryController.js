import * as categoryService from '../services/categoryService.js';

const sendError = (res, err) => {
  const clientErrors = new Set(['CastError', 'ValidationError']);
  const status = err.statusCode || (clientErrors.has(err.name) ? 400 : 500);
  const expose = err.statusCode || clientErrors.has(err.name);
  if (!expose) console.error('Category controller error:', err);
  res.status(status).json({
    status: 'error',
    message: expose ? err.message : 'Internal server error',
  });
};

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.fetchAllCategories();
    res.json({
      status: 'success',
      data: categories,
    });
  } catch (err) {
    sendError(res, err);
  }
};
