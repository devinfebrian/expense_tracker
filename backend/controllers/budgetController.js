import * as budgetService from '../services/budgetService.js';

const sendError = (res, err) => {
  const clientErrors = new Set(['CastError', 'ValidationError']);
  const status = err.statusCode || (clientErrors.has(err.name) ? 400 : 500);
  const expose = err.statusCode || clientErrors.has(err.name);
  if (!expose) console.error('Budget controller error:', err);
  res.status(status).json({
    status: 'error',
    message: expose ? err.message : 'Internal server error',
  });
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.fetchBudgetsByUserId(req.user.user_id, {
      period: req.query.period,
    });
    res.json({
      status: 'success',
      data: budgets,
    });
  } catch (err) {
    sendError(res, err);
  }
};

export const createBudget = async (req, res) => {
  try {
    const result = await budgetService.createBudget(req.user.user_id, req.body);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    sendError(res, err);
  }
};

export const updateBudget = async (req, res) => {
  try {
    const result = await budgetService.updateBudget(req.user.user_id, req.params.id, req.body);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    sendError(res, err);
  }
};

export const deleteBudget = async (req, res) => {
  try {
    await budgetService.deleteBudget(req.user.user_id, req.params.id);
    res.json({
      status: 'success',
      message: 'Budget deleted successfully',
    });
  } catch (err) {
    sendError(res, err);
  }
};