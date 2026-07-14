const summary = {
  totalExpenses: 8210.45,
  totalSpent: 4697.45,
  monthlyExpenses: 8210.45,
  expenseProgress: 66,
  spendingData: [40, 55, 45, 70, 90, 65, 50, 40, 80, 35, 60, 75],
  expenseChange: 4.2,
  remainingBudget: 302.55
};

const transactions = [
  { id: 1, date: 'Oct 24, 2023', merchant: 'Apple Store', description: 'MacBook Pro', category: 'Electronics', categoryClass: 'surface-container-highest text-primary', notes: 'Buying new laptop for work', amount: 1299.00, icon: 'shopping_bag' },
  { id: 2, date: 'Oct 23, 2023', merchant: 'The Green Bistro', description: 'Dinner', category: 'Dining Out', categoryClass: 'bg-secondary-container text-on-secondary-fixed-variant', notes: 'Dinner with client', amount: 84.50, icon: 'restaurant' },
  { id: 3, date: 'Oct 22, 2023', merchant: 'General Electric', description: 'Electric Bill', category: 'Utilities', categoryClass: 'surface-container-highest text-primary', notes: 'Monthly electricity', amount: 142.10, icon: 'electric_bolt' },
  { id: 4, date: 'Oct 21, 2023', merchant: 'Delta Air Lines', description: 'Flight Tickets', category: 'Travel', categoryClass: 'surface-container-highest text-primary', notes: 'Business trip to Jakarta', amount: 450.00, icon: 'flight' },
  { id: 5, date: 'Oct 24, 2023', merchant: 'Whole Foods Market', description: 'Weekly groceries', category: 'Groceries', categoryClass: 'bg-secondary-container/30 text-on-secondary-container', notes: 'Weekly grocery run', amount: 184.20, icon: 'shopping_cart' },
  { id: 6, date: 'Oct 22, 2023', merchant: 'Skyline Apartments', description: 'Rent Payment', category: 'Housing', categoryClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', notes: 'Monthly rent October', amount: 2100.00, icon: 'house' },
  { id: 7, date: 'Oct 21, 2023', merchant: 'Blue Bottle Coffee', description: 'Dining', category: 'Leisure', categoryClass: 'bg-surface-variant text-on-surface-variant', notes: 'Coffee with friends', amount: 6.50, icon: 'coffee' },
  { id: 8, date: 'Oct 20, 2023', merchant: 'Netflix', description: 'Monthly plan', category: 'Entertainment', categoryClass: 'bg-surface-variant text-on-surface-variant', notes: 'Netflix subscription', amount: 15.99, icon: 'movie' },
  { id: 9, date: 'Oct 19, 2023', merchant: 'SPBU Pertamina', description: 'Bensin', category: 'Transport', categoryClass: 'surface-container-highest text-primary', notes: 'Fill up gas', amount: 350.00, icon: 'local_gas_station' },
  { id: 10, date: 'Oct 18, 2023', merchant: 'Indomaret', description: 'Daily needs', category: 'Groceries', categoryClass: 'bg-secondary-container/30 text-on-secondary-container', notes: 'Snacks and drinks', amount: 45.50, icon: 'local_grocery_store' }
];

const budgets = [
  { id: 1, name: 'Food & Groceries', icon: 'restaurant', period: 'daily', spent: 45000, limit: 150000, percentage: 30, status: 'ON TRACK', statusClass: 'text-secondary' },
  { id: 2, name: 'Transport', icon: 'directions_car', period: 'weekly', spent: 350000, limit: 500000, percentage: 70, status: 'ON TRACK', statusClass: 'text-secondary' },
  { id: 3, name: 'Entertainment', icon: 'movie', period: 'monthly', spent: 645000, limit: 600000, percentage: 100, status: 'EXCEEDED', statusClass: 'text-error', warning: true },
  { id: 4, name: 'Housing', icon: 'home', period: 'monthly', spent: 2800000, limit: 2800000, percentage: 100, status: 'REACHED', statusClass: 'text-on-primary-fixed-variant' }
];

const budgetAdjustments = [
  { date: 'Oct 24, 2023', category: 'Entertainment', previousLimit: 400000, newLimit: 550000, change: 150000, changeClass: 'text-secondary' },
  { date: 'Oct 20, 2023', category: 'Dining Out', previousLimit: 600000, newLimit: 400000, change: -200000, changeClass: 'text-error' }
];

const categoryBreakdown = [
  { label: 'Housing', percentage: 35, color: 'bg-primary' },
  { label: 'Food', percentage: 25, color: 'bg-secondary-container' },
  { label: 'Transport', percentage: 20, color: 'bg-surface-variant' },
  { label: 'Others', percentage: 20, color: 'bg-on-tertiary-container' }
];

module.exports = { summary, transactions, budgets, budgetAdjustments, categoryBreakdown };
