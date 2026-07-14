const INITIAL_TRANSACTIONS = [
  { id: '1', date: '2023-10-24', merchant: 'Apple Store', description: 'MacBook Pro', category: '🎉 Personal & Entertainment', notes: 'Buying new laptop for work', amount: 12990000, icon: 'shopping_bag' },
  { id: '2', date: '2023-10-23', merchant: 'The Green Bistro', description: 'Dinner', category: '🍚 Food & Drinks', notes: 'Dinner with client', amount: 845000, icon: 'restaurant' },
  { id: '3', date: '2023-10-22', merchant: 'General Electric', description: 'Electric Bill', category: '🏠 Living Expenses', notes: 'Monthly electricity', amount: 1420000, icon: 'electric_bolt' },
  { id: '4', date: '2023-10-21', merchant: 'Delta Air Lines', description: 'Flight Tickets', category: '🚌 Transportation', notes: 'Business trip to Jakarta', amount: 4500000, icon: 'flight' },
  { id: '5', date: '2023-10-24', merchant: 'Whole Foods Market', description: 'Weekly groceries', category: '🍚 Food & Drinks', notes: 'Weekly grocery run', amount: 1842000, icon: 'shopping_cart' },
  { id: '6', date: '2023-10-22', merchant: 'Skyline Apartments', description: 'Rent Payment', category: '🏠 Living Expenses', notes: 'Monthly rent October', amount: 21000000, icon: 'home' }
];

const INITIAL_BUDGETS = [
  { id: '1', name: '🍚 Food & Drinks', icon: 'restaurant', period: 'monthly', limit: 15000000 },
  { id: '2', name: '🚌 Transportation', icon: 'directions_car', period: 'monthly', limit: 8000000 },
  { id: '3', name: '🎉 Personal & Entertainment', icon: 'shopping_bag', period: 'monthly', limit: 10000000 },
  { id: '4', name: '🏠 Living Expenses', icon: 'home', period: 'monthly', limit: 25000000 }
];

const INITIAL_ADJUSTMENTS = [
  { date: 'Oct 24, 2023', category: '🎉 Personal & Entertainment', previousLimit: 8000000, newLimit: 10000000, change: 2000000, changeClass: 'text-secondary' },
  { date: 'Oct 20, 2023', category: '🍚 Food & Drinks', previousLimit: 18000000, newLimit: 15000000, change: -3000000, changeClass: 'text-error' }
];

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
