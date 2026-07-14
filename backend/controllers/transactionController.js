import * as transactionService from '../services/transactionService.js';

const sendError = (res, err) => {
  const clientErrors = new Set(['CastError', 'ValidationError']);
  const status = err.statusCode || (clientErrors.has(err.name) ? 400 : 500);
  const expose = err.statusCode || clientErrors.has(err.name);
  if (!expose) console.error('Transaction controller error:', err);
  res.status(status).json({
    status: 'error',
    message: expose ? err.message : 'Internal server error',
  });
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.fetchTransactionsByUserId(req.user.user_id);
    res.json({
      status: 'success',
      data: transactions,
    });
  } catch (err) {
    sendError(res, err);
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
    sendError(res, err);
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
    sendError(res, err);
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
    sendError(res, err);
  }
};
