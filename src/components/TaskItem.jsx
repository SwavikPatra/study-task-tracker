import { useState } from 'react';
import { isOverdue, formatDate } from '../utils/dateUtils';
import RescheduleModal from './RescheduleModal';

function getTomorrow(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date(y, m - 1, d);
  t.setDate(d + 1);
  const yy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const dd = String(t.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export default function TaskItem({ task, date, onToggleComplete, onDelete, onReschedule, onOpenDetails, reorderMode, isFirst, isLast, onMoveUp, onMoveDown }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const overdue = !task.completed && (task.originalDate ? isOverdue(task.originalDate) : isOverdue(date));
  const completed = task.completed && task.completedDate === date;

  function handleCheckbox() {
    if (task.type === 'recurring' && !completed) {
      onToggleComplete(task, date, 'show-modal');
    } else {
      onToggleComplete(task, date);
    }
  }

  function handleRescheduleTomorrow() {
    const tomorrow = getTomorrow(date);
    onReschedule(task, date, tomorrow);
  }

  function handleDelete() {
    setShowConfirm(true);
  }

  function confirmDelete() {
    onDelete(task.id);
    setShowConfirm(false);
  }

  return (
    <div
      className={`task-item ${completed ? 'task-completed' : ''} ${overdue ? 'task-overdue' : ''}`}
      role="listitem"
      onClick={(e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'svg' || e.target.tagName === 'path' || e.target.tagName === 'polyline' || e.target.tagName === 'line' || e.target.tagName === 'rect') return;
        onOpenDetails?.(task);
      }}
    >
      <div className="task-main">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={completed}
          onChange={handleCheckbox}
          aria-label={`Mark "${task.name}" as done`}
        />
        <div className="task-content">
          <span className={`task-name ${completed ? 'task-done' : ''}`}>
            {task.name}
            {!!task.note && (
              <span className="task-has-note" title="Has notes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
            )}
          </span>
          <div className="task-meta">
            {task.type === 'recurring' && (
              <span className="task-type-badge recurring">Recurring</span>
            )}
            {task.originalDate && task.originalDate !== date && (
              <span className="task-original-date">Originally: {formatDate(task.originalDate)}</span>
            )}
            {overdue && <span className="task-overdue-badge">Overdue</span>}
          </div>
        </div>
        <div className="task-actions">
          {reorderMode && (
            <>
              <button
                className="btn btn-icon"
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                disabled={isFirst}
                title="Move up"
                aria-label="Move up"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
              <button
                className="btn btn-icon"
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                disabled={isLast}
                title="Move down"
                aria-label="Move down"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </>
          )}
          {!completed && (
            <>
              <button
                className="btn btn-icon"
                onClick={(e) => { e.stopPropagation(); handleRescheduleTomorrow(); }}
                title="Move to tomorrow"
                aria-label="Move to tomorrow"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
              <button
                className="btn btn-icon"
                onClick={(e) => { e.stopPropagation(); setShowReschedule(true); }}
                title="Pick a date"
                aria-label="Pick a date"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                </svg>
              </button>
            </>
          )}
          <button
            className="btn btn-icon btn-danger"
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            title="Delete"
            aria-label="Delete task"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
              <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118z" />
            </svg>
          </button>
        </div>
      </div>
      {showReschedule && (
        <RescheduleModal
          task={task}
          date={date}
          onReschedule={onReschedule}
          onCancel={() => setShowReschedule(false)}
        />
      )}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Delete this task?</p>
            <div className="confirm-actions">
              <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); confirmDelete(); }}>Delete</button>
              <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
