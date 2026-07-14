// Mirror of backend/utils/period.js for client-side use.
// Period encoding:
//   daily   -> "YYYY-MM-DD"
//   weekly  -> "YYYY-MM-DD" (Monday of that ISO week)
//   monthly -> "YYYY-MM"

const pad2 = (n) => String(n).padStart(2, '0');

const getMonthlyPeriod = (ref) => `${ref.getUTCFullYear()}-${pad2(ref.getUTCMonth() + 1)}`;

const getDailyPeriod = (ref) =>
  `${ref.getUTCFullYear()}-${pad2(ref.getUTCMonth() + 1)}-${pad2(ref.getUTCDate())}`;

const getWeekStartDate = (ref) => {
  const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
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

export const getPeriodRange = (period) => {
  if (!period || typeof period !== 'string') return null;
  const parts = period.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (parts.length === 2) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end };
  }

  if (parts.length === 3) {
    const day = Number(parts[2]);
    const start = new Date(Date.UTC(year, month - 1, day));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }

  return null;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatPeriodLabel = (period) => {
  if (!period) return '';
  const parts = period.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (parts.length === 2) {
    return `${MONTH_LABELS[month - 1]} ${year}`;
  }

  if (parts.length === 3) {
    const day = Number(parts[2]);
    return `${day} ${MONTH_LABELS[month - 1]} ${year}`;
  }

  return period;
};

// Next period string for a given type. Returns null if would exceed
// current period (Q-L: prev unlimited, next capped at current).
export const getNextPeriod = (period, type) => {
  if (!period) return null;
  const cur = getCurrentPeriod(type);
  if (period === cur) return null;
  const range = getPeriodRange(period);
  if (!range) return null;
  return getCurrentPeriod(type, range.end);
};

// Previous period string for a given type. Always returns a valid string.
export const getPrevPeriod = (period, type) => {
  if (!period) return null;
  const range = getPeriodRange(period);
  if (!range) return null;
  const dayBeforeStart = new Date(range.start);
  dayBeforeStart.setUTCMinutes(dayBeforeStart.getUTCMinutes() - 1);
  return getCurrentPeriod(type, dayBeforeStart);
};