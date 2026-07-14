const INITIAL_TRANSACTIONS = [];

const INITIAL_BUDGETS = [];

const INITIAL_ADJUSTMENTS = [];

export const getTransactions = () => {
  const data = localStorage.getItem('duidku_transactions');
  if (!data) {
    localStorage.setItem('duidku_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  return JSON.parse(data);
};

export const saveTransactions = (txns) => {
  localStorage.setItem('duidku_transactions', JSON.stringify(txns));
};

export const getBudgets = () => {
  const data = localStorage.getItem('duidku_budgets');
  if (!data) {
    localStorage.setItem('duidku_budgets', JSON.stringify(INITIAL_BUDGETS));
    return INITIAL_BUDGETS;
  }
  return JSON.parse(data);
};

export const saveBudgets = (budgets) => {
  localStorage.setItem('duidku_budgets', JSON.stringify(budgets));
};

export const getAdjustments = () => {
  const data = localStorage.getItem('duidku_adjustments');
  if (!data) {
    localStorage.setItem('duidku_adjustments', JSON.stringify(INITIAL_ADJUSTMENTS));
    return INITIAL_ADJUSTMENTS;
  }
  return JSON.parse(data);
};

export const saveAdjustments = (adjustments) => {
  localStorage.setItem('duidku_adjustments', JSON.stringify(adjustments));
};
