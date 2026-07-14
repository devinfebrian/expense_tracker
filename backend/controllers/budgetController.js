import * as budgetService from '../services/budgetService.js';

export const getBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.fetchBudgetsByUserId(req.user.user_id);
    res.json({
      status: 'success',
      data: budgets,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
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
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
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
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
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
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
};
