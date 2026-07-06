import { useState, useRef } from 'react';
import TaskItem from './TaskItem';
import { formatDate, getToday } from '../utils/dateUtils';

export default function DayView({
  selectedDate,
  tasks,
  onToggleComplete,
  onDelete,
  onReschedule,
  onOpenDetails,
}) {
  const today = getToday();
  const isToday = selectedDate === today;
  const [taskOrder, setTaskOrder] = useState(() => tasks.map(t => t.id));
  const [reorderMode, setReorderMode] = useState(false);
  const prevTaskIds = useRef('');

  const taskIds = tasks.map((t) => t.id).join(',');
  if (taskIds !== prevTaskIds.current) {
    prevTaskIds.current = taskIds;
    setTaskOrder(tasks.map(t => t.id));
  }

  const orderedTasks = taskOrder
    .map(id => tasks.find(t => t.id === id))
    .filter(Boolean);

  function handleMoveUp(index) {
    if (index === 0) return;
    setTaskOrder(prev => {
      const items = [...prev];
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
      return items;
    });
  }

  function handleMoveDown(index) {
    if (index === orderedTasks.length - 1) return;
    setTaskOrder(prev => {
      const items = [...prev];
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
      return items;
    });
  }

  return (
    <div className="day-view">
      <div className="day-view-header">
        <h2 className={`day-view-date ${isToday ? 'day-today' : ''}`}>
          {formatDate(selectedDate)}
          {isToday && <span className="today-badge">Today</span>}
        </h2>
        {orderedTasks.length > 1 && (
          <button
            className={`btn btn-sm ${reorderMode ? 'btn-primary' : ''}`}
            onClick={() => setReorderMode((p) => !p)}
          >
            {reorderMode ? 'Done' : 'Reorder'}
          </button>
        )}
      </div>

      <div className="task-list" role="list">
        {orderedTasks.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14l1.5 1.5L16 9" />
            </svg>
            <p>No tasks for this day</p>
          </div>
        ) : (
          orderedTasks.map((task, index) => (
            <TaskItem
              key={task.id + '_' + selectedDate}
              task={task}
              date={selectedDate}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onReschedule={onReschedule}
              onOpenDetails={onOpenDetails}
              reorderMode={reorderMode}
              isFirst={index === 0}
              isLast={index === orderedTasks.length - 1}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}
