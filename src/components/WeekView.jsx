import { getDayName, getDayNumber, formatDate, getToday } from '../utils/dateUtils';

export default function WeekView({ weekDates, tasksByDate, onSelectDate, selectedDate }) {
  const today = getToday();

  return (
    <div className="week-view">
      <h2 className="section-title">This Week</h2>
      <div className="week-list">
        {weekDates.map((date) => {
          const tasks = tasksByDate[date] || [];
          const isToday = date === today;
          const isSelected = date === selectedDate;

          return (
            <div
              key={date}
              className={`week-day ${isToday ? 'week-day-today' : ''} ${isSelected ? 'week-day-selected' : ''}`}
              onClick={() => onSelectDate(date)}
            >
              <div className="week-day-header">
                <div className="week-day-left">
                  <span className="week-day-name">{getDayName(date)}</span>
                  <span className="week-day-number">{getDayNumber(date)}</span>
                  <span className="week-day-date">{formatDate(date)}</span>
                </div>
                {tasks.length > 0 && (
                  <span className="week-task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="week-day-tasks">
                {tasks.length === 0 ? (
                  <span className="week-day-empty">No tasks</span>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`week-task-item ${task.completed && task.completedDate === date ? 'week-task-done' : ''}`}
                    >
                      <span className={`week-task-bullet ${task.type}`} />
                      <span className="week-task-name">{task.name}</span>
                      {task.originalDate && task.originalDate !== date && (
                        <span className="week-task-original" title={`Originally ${task.originalDate}`}>moved</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
