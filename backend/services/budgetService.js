import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import { getCurrentPeriod } from '../utils/period.js';

let catMapCache = null;
let catMapAt = 0;
const getCategoryMap = async () => {
  if (catMapCache && Date.now() - catMapAt < 60_000) return catMapCache;
  const categories = await Category.find();
  catMapCache = {};
  categories.forEach(c => {
    catMapCache[c.category_id] = c.category_name;
  });
  catMapAt = Date.now();
  return catMapCache;
};

const shapeBudget = (b, catMap) => ({
  budget_id: b.budget_id,
  id: b.budget_id,
  user_id: b.user_id,
  category_id: b.category_id,
  category_name: catMap[b.category_id] || 'Others',
  name: catMap[b.category_id] || 'Others',
  limit: b.limit,
  type: b.type,
  period: b.period,
});

// Default-period resolution: 'current' means each budget type uses its own
// current-period string. Since one response may mix types, we cannot use a
// single string filter for 'current'. Instead when period='current', we
// resolve to the set of current-period strings across all types.
const resolveCurrentPeriods = () => ({
  daily: getCurrentPeriod('daily'),
  weekly: getCurrentPeriod('weekly'),
  monthly: getCurrentPeriod('monthly'),
});

export const fetchBudgetsByUserId = async (user_id, { period = 'current' } = {}) => {
  let query = { user_id };
  if (period === 'current') {
    const cur = resolveCurrentPeriods();
    query.period = { $in: [cur.daily, cur.weekly, cur.monthly] };
  } else if (period && period !== 'all') {
    query.period = period;
  }

  const budgets = await Budget.find(query).sort({ createdAt: -1 });
  const catMap = await getCategoryMap();
  return budgets.map(b => shapeBudget(b, catMap));
};

export const createBudget = async (user_id, { category_id, limit, type, period }) => {
  const resolvedType = type || 'monthly';
  const resolvedPeriod = period || getCurrentPeriod(resolvedType);

  if (!category_id || limit === undefined) {
    const err = new Error('Category and limit are required');
    err.statusCode = 400;
    throw err;
  }

  // Collision pre-check ( belt + braces; second line of defense is the
  // compound unique index added in a follow-up commit ).
  const existing = await Budget.exists({
    user_id,
    category_id,
    type: resolvedType,
    period: resolvedPeriod,
  });
  if (existing) {
    const err = new Error('Budget for this category + period already exists');
    err.statusCode = 409;
    throw err;
  }

  let budget;
  try {
    budget = await Budget.create({
      user_id,
      category_id,
      limit: parseFloat(limit),
      type: resolvedType,
      period: resolvedPeriod,
    });
  } catch (e) {
    if (e.code === 11000) {
      const err = new Error('Budget for this category + period already exists');
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }

  const catMap = await getCategoryMap();
  return shapeBudget(budget, catMap);
};

export const updateBudget = async (user_id, budget_id, { category_id, limit, type }) => {
  const budget = await Budget.findOne({ budget_id, user_id });
  if (!budget) {
    const err = new Error('Budget not found');
    err.statusCode = 404;
    throw err;
  }

  const resolvedType = type || budget.type;
  const resolvedCategoryId = category_id || budget.category_id;
  // Period is locked: a budget always lives in the period it was created in.
  // To move it, delete + recreate. Ignoring any incoming `period` payload.
  const resolvedPeriod = budget.period;

  if (resolvedType !== budget.type || resolvedCategoryId !== budget.category_id) {
    const conflict = await Budget.exists({
      user_id,
      category_id: resolvedCategoryId,
      type: resolvedType,
      period: resolvedPeriod,
      budget_id: { $ne: budget.budget_id },
    });
    if (conflict) {
      const err = new Error('Budget for this category + period already exists');
      err.statusCode = 409;
      throw err;
    }
  }

  budget.category_id = resolvedCategoryId;
  budget.type = resolvedType;
  if (limit !== undefined) budget.limit = parseFloat(limit);

  await budget.save();

  const catMap = await getCategoryMap();
  return shapeBudget(budget, catMap);
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