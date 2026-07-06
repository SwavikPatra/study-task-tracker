import { getToday } from '../utils/dateUtils';

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const pad = (n) => String(n).padStart(2, '0');
  const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const weeks = [];
  let day = 1;
  for (let row = 0; row < 6; row++) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < startDayOfWeek) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
      } else {
        week.push(toStr(year, month, day));
        day++;
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }
  return weeks;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensityClass(count, max) {
  if (count === 0 || max === 0) return '';
  const level = Math.ceil((count / max) * 4);
  return `intensity-${level}`;
}

export default function MonthView({ selectedDate, tasksByDate, onSelectDate }) {
  const [y, m] = selectedDate.split('-').map(Number);
  const year = y;
  const month = m - 1;

  const weeks = getMonthGrid(year, month);
  const today = getToday();

  let maxCount = 0;
  weeks.forEach((week) => {
    week.forEach((date) => {
      if (date) {
        const count = (tasksByDate[date] || []).length;
        if (count > maxCount) maxCount = count;
      }
    });
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  function handlePrevMonth() {
    const d = new Date(year, month - 1, 1);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    onSelectDate(`${yy}-${mm}-01`);
  }

  function handleNextMonth() {
    const d = new Date(year, month + 1, 1);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    onSelectDate(`${yy}-${mm}-01`);
  }

  return (
    <div className="month-view">
      <div className="month-nav">
        <button className="btn btn-sm" onClick={handlePrevMonth}>&lt;</button>
        <h3 className="month-title">{monthNames[month]} {year}</h3>
        <button className="btn btn-sm" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="month-grid">
        {DAY_LABELS.map((label) => (
          <div key={label} className="month-day-label">{label}</div>
        ))}
        {weeks.map((week, wi) =>
          week.map((date, di) => (
            <div
              key={`${wi}-${di}`}
              className={`month-day ${date ? '' : 'month-day-empty'} ${
                date && date === today ? 'month-day-today' : ''
              } ${
                date && date === selectedDate ? 'month-day-selected' : ''
              } ${
                date ? getIntensityClass((tasksByDate[date] || []).length, maxCount) : ''
              }`}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <span className="month-day-num">{date.split('-')[2].replace(/^0/, '')}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
