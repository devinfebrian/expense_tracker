const CATEGORY_STYLES = {
  food: { icon: 'restaurant', color: '#f59e0b', bg: '#fff4e6' },
  drinks: { icon: 'restaurant', color: '#f59e0b', bg: '#fff4e6' },
  meals: { icon: 'restaurant', color: '#f59e0b', bg: '#fff4e6' },
  restaurant: { icon: 'restaurant', color: '#f59e0b', bg: '#fff4e6' },
  transport: { icon: 'directions_car', color: '#3b82f6', bg: '#eff6ff' },
  taxi: { icon: 'local_taxi', color: '#3b82f6', bg: '#eff6ff' },
  bus: { icon: 'directions_bus', color: '#3b82f6', bg: '#eff6ff' },
  car: { icon: 'directions_car', color: '#3b82f6', bg: '#eff6ff' },
  education: { icon: 'school', color: '#8b5cf6', bg: '#f3efff' },
  books: { icon: 'book', color: '#8b5cf6', bg: '#f3efff' },
  school: { icon: 'school', color: '#8b5cf6', bg: '#f3efff' },
  living: { icon: 'home', color: '#14b8a6', bg: '#e0f2fe' },
  rent: { icon: 'home', color: '#14b8a6', bg: '#e0f2fe' },
  dorm: { icon: 'home', color: '#14b8a6', bg: '#e0f2fe' },
  housing: { icon: 'home', color: '#14b8a6', bg: '#e0f2fe' },
  personal: { icon: 'celebration', color: '#ec4899', bg: '#fce7f3' },
  entertainment: { icon: 'movie', color: '#ec4899', bg: '#fce7f3' },
  shopping: { icon: 'shopping_bag', color: '#ec4899', bg: '#fce7f3' },
  movie: { icon: 'movie', color: '#ec4899', bg: '#fce7f3' },
  games: { icon: 'sports_esports', color: '#ec4899', bg: '#fce7f3' },
  salary: { icon: 'payments', color: '#f43f5e', bg: '#fdf2f8' },
  income: { icon: 'payments', color: '#f43f5e', bg: '#fdf2f8' },
  wage: { icon: 'payments', color: '#f43f5e', bg: '#fdf2f8' },
  freelance: { icon: 'payments', color: '#f43f5e', bg: '#fdf2f8' },
  bills: { icon: 'receipt', color: '#14b8a6', bg: '#e0f2fe' },
  utilities: { icon: 'bolt', color: '#14b8a6', bg: '#e0f2fe' },
  electricity: { icon: 'bolt', color: '#14b8a6', bg: '#e0f2fe' },
};

const DEFAULT_STYLE = { icon: 'account_balance_wallet', color: '#6b7280', bg: '#f3f4f6' };

const findCategoryStyle = (cat) => {
  const c = cat?.toLowerCase() || '';
  for (const key of Object.keys(CATEGORY_STYLES)) {
    if (c.includes(key)) return CATEGORY_STYLES[key];
  }
  return DEFAULT_STYLE;
};

export const getCategoryIcon = (cat) => findCategoryStyle(cat).icon;
export const getCategoryColor = (cat) => findCategoryStyle(cat).color;
export const getCategoryBg = (cat) => findCategoryStyle(cat).bg;
export const getCategoryStyle = (cat) => findCategoryStyle(cat);

export default getCategoryIcon;
