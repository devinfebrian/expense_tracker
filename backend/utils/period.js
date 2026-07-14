// Period encoding (per Q-A=2 week-start date, Q-K monthly YYYY-MM):
//   daily   -> "YYYY-MM-DD"
//   weekly  -> "YYYY-MM-DD" (Monday of that ISO week)
//   monthly -> "YYYY-MM"
//
// All helpers are timezone-agnostic (use UTC) so periods are stable
// regardless of server locale. Input `ref` defaults to now.

const pad2 = (n) => String(n).padStart(2, '0');

const getMonthlyPeriod = (ref) => `${ref.getUTCFullYear()}-${pad2(ref.getUTCMonth() + 1)}`;

const getDailyPeriod = (ref) =>
  `${ref.getUTCFullYear()}-${pad2(ref.getUTCMonth() + 1)}-${pad2(ref.getUTCDate())}`;

// ISO week: Monday as first day. Returns the UTC Date of the Monday
// on or before `ref`.
const getWeekStartDate = (ref) => {
  const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun .. 6=Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
};

const getWeeklyPeriod = (ref) => {
  const monday = getWeekStartDate(ref);
  return getDailyPeriod(monday);
};

export const getCurrentPeriod = (type, ref = new Date()) => {
  switch (type) {
    case 'daily':
      return getDailyPeriod(ref);
    case 'weekly':
      return getWeeklyPeriod(ref);
    case 'monthly':
    default:
      return getMonthlyPeriod(ref);
  }
};

// Inverse: given a period string, return [start, end) UTC Date range.
// `end` is exclusive (start of next period) for easy `txn.date < end` filters.
export const getPeriodRange = (period) => {
  if (!period || typeof period !== 'string') return null;
  const parts = period.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);

  // monthly: "YYYY-MM"
  if (parts.length === 2) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end };
  }

  // daily / weekly: "YYYY-MM-DD"
  if (parts.length === 3) {
    const day = Number(parts[2]);
    const start = new Date(Date.UTC(year, month - 1, day));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }

  return null;
};