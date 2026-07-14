import Budget from '../models/Budget.js';
import Category from '../models/Category.js';

const getCategoryMap = async () => {
  const categories = await Category.find();
  const catMap = {};
  categories.forEach(c => {
    catMap[c.category_id] = c.category_name;
  });
  return catMap;
};

export const fetchBudgetsByUserId = async (user_id) => {
  const budgets = await Budget.find({ user_id });
  const catMap = await getCategoryMap();

  return budgets.map(b => ({
    budget_id: b.budget_id,
    id: b.budget_id,
    user_id: b.user_id,
    category_id: b.category_id,
    category_name: catMap[b.category_id] || 'Others',
    name: catMap[b.category_id] || 'Others',
    limit: b.limit,
    type: b.type,
    period: b.type
  }));
};

export const createBudget = async (user_id, { name, category_name, category_id, limit, period, type }) => {
  let targetCategoryId = category_id;
  if (!targetCategoryId && (name || category_name)) {
    const found = await Category.findOne({ category_name: name || category_name });
    if (found) targetCategoryId = found.category_id;
  }

  const resolvedType = type || period || 'monthly';

  if (!targetCategoryId || limit === undefined) {
    const err = new Error('Category and limit are required');
    err.statusCode = 400;
    throw err;
  }

  const budget = await Budget.create({
    user_id,
    category_id: targetCategoryId,
    limit: parseFloat(limit),
    type: resolvedType,
  });

  const catMap = await getCategoryMap();
  return {
    budget_id: budget.budget_id,
    id: budget.budget_id,
    user_id: budget.user_id,
    category_id: budget.category_id,
    category_name: catMap[budget.category_id] || 'Others',
    name: catMap[budget.category_id] || 'Others',
    limit: budget.limit,
    type: budget.type,
    period: budget.type
  };
};

export const updateBudget = async (user_id, budget_id, { name, category_name, category_id, limit, period, type }) => {
  const budget = await Budget.findOne({ budget_id, user_id });
  if (!budget) {
    const err = new Error('Budget not found');
    err.statusCode = 404;
    throw err;
  }

  let targetCategoryId = category_id;
  if (!targetCategoryId && (name || category_name)) {
    const found = await Category.findOne({ category_name: name || category_name });
    if (found) targetCategoryId = found.category_id;
  }

  const resolvedType = type || period;

  if (targetCategoryId) budget.category_id = targetCategoryId;
  if (limit !== undefined) budget.limit = parseFloat(limit);
  if (resolvedType) budget.type = resolvedType;

  await budget.save();

  const catMap = await getCategoryMap();
  return {
    budget_id: budget.budget_id,
    id: budget.budget_id,
    user_id: budget.user_id,
    category_id: budget.category_id,
    category_name: catMap[budget.category_id] || 'Others',
    name: catMap[budget.category_id] || 'Others',
    limit: budget.limit,
    type: budget.type,
    period: budget.type
  };
};

export const deleteBudget = async (user_id, budget_id) => {
  const budget = await Budget.findOneAndDelete({ budget_id, user_id });
  if (!budget) {
    const err = new Error('Budget not found');
    err.statusCode = 404;
    throw err;
  }
  return true;
};
