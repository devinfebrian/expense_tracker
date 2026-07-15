const getCategoryIcon = (cat) => {
  const c = cat?.toLowerCase() || '';
  if (c.includes('food') || c.includes('drinks') || c.includes('meals') || c.includes('restaurant')) return 'restaurant';
  if (c.includes('transport') || c.includes('taxi') || c.includes('bus') || c.includes('car')) return 'directions_car';
  if (c.includes('education') || c.includes('books') || c.includes('school')) return 'school';
  if (c.includes('living') || c.includes('rent') || c.includes('dorm') || c.includes('housing')) return 'home';
  if (c.includes('personal') || c.includes('entertainment') || c.includes('shopping') || c.includes('movie') || c.includes('games')) return 'celebration';
  return 'account_balance_wallet';
};

export default getCategoryIcon;