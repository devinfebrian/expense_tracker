import * as transactionService from '../services/transactionService.js';

export const getTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.fetchTransactionsByUserId(req.user.user_id);
    res.json({
      status: 'success',
      data: transactions,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const result = await transactionService.createTransaction(req.user.user_id, req.body);
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

export const updateTransaction = async (req, res) => {
  try {
    const result = await transactionService.updateTransaction(req.user.user_id, req.params.id, req.body);
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

export const deleteTransaction = async (req, res) => {
  try {
    await transactionService.deleteTransaction(req.user.user_id, req.params.id);
    res.json({
      status: 'success',
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  }
};
