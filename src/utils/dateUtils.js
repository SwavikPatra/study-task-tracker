function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getToday() {
  return toDateStr(new Date());
}

export function getWeekDates(baseDate) {
  const [y, m, d] = baseDate.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(d - day + (day === 0 ? -6 : 1));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nd = new Date(monday);
    nd.setDate(monday.getDate() + i);
    dates.push(toDateStr(nd));
  }
  return dates;
}

export function isOverdue(dateStr) {
  return dateStr < getToday();
}

export function getDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getShortDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getDayNumber(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}
