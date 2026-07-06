import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import AddTaskForm from './components/AddTaskForm';
import BackupRestore from './components/BackupRestore';
import RecurringCompleteModal from './components/RecurringCompleteModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import { getAllTasks, addTask, updateTask, deleteTask } from './utils/db';
import { getToday, getWeekDates } from './utils/dateUtils';
import './App.css';

function expandRecurringForDate(task, date) {
  return date >= task.startDate && date <= task.endDate;
}

function getTasksForDate(tasks, date) {
  return tasks.filter((t) => {
    if (t.type === 'one-time') {
      return t.startDate === date;
    }
    return expandRecurringForDate(t, date);
  }).map((t) => ({ ...t }));
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('studyDarkMode') === 'true');
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [recurringModal, setRecurringModal] = useState(null);
  const [detailsModalTask, setDetailsModalTask] = useState(null);
  const [viewMode, setViewMode] = useState('week');

  const loadTasks = useCallback(async () => {
    try {
      const all = await getAllTasks();
      setTasks(all);
    } catch {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (tasks.length === 0) return;
    const today = getToday();
    let changed = false;
    const updated = tasks.map((t) => {
      if (t.type === 'one-time' && !t.completed && t.endDate < today && t.originalDate !== t.endDate) {
        const moved = { ...t, startDate: today, endDate: today };
        if (!moved.originalDate) {
          moved.originalDate = t.startDate;
        }
        changed = true;
        updateTask(moved).catch(console.error);
        return moved;
      }
      return t;
    });
    if (changed) setTasks(updated);
  }, [tasks.length]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('studyDarkMode', darkMode);
  }, [darkMode]);

  const weekDates = getWeekDates(selectedDate);
  const tasksByDate = {};
  weekDates.forEach((d) => {
    tasksByDate[d] = getTasksForDate(tasks, d);
  });

  const [sy, sm] = selectedDate.split('-').map(Number);
  const monthTasksByDate = {};
  const daysInMonth = new Date(sy, sm, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${sy}-${pad(sm)}-${pad(d)}`;
    monthTasksByDate[dateStr] = getTasksForDate(tasks, dateStr);
  }

  const selectedTasks = getTasksForDate(tasks, selectedDate);

  function handleToggleDarkMode() {
    setDarkMode((prev) => !prev);
  }

  function handleJumpToToday() {
    setSelectedDate(getToday());
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
  }

  async function handleAdd(task) {
    try {
      await addTask(task);
      setTasks((prev) => [...prev, task]);
    } catch (err) {
      console.error('Add failed', err);
    }
  }

  async function handleToggleComplete(task, date, modalAction) {
    if (modalAction === 'show-modal') {
      setRecurringModal({ task, date });
      return;
    }
    const updated = { ...task };
    if (updated.type === 'one-time') {
      if (updated.completed && updated.completedDate === date) {
        updated.completed = false;
        updated.completedDate = null;
      } else {
        updated.completed = true;
        updated.completedDate = date;
      }
    } else {
      if (updated.completed && updated.completedDate === date) {
        updated.completed = false;
        updated.completedDate = null;
      } else {
        updated.completed = true;
        updated.completedDate = date;
      }
    }
    try {
      await updateTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error('Update failed', err);
    }
  }

  async function handleDoneToday(task, date) {
    setRecurringModal(null);
    const updated = { ...task };
    updated.completed = true;
    updated.completedDate = date;
    try {
      await updateTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error('Update failed', err);
    }
  }

  async function handleDonePermanently(task, date) {
    setRecurringModal(null);
    const updated = { ...task };
    const [y, m, d] = date.split('-').map(Number);
    const t = new Date(y, m - 1, d);
    t.setDate(d + 1);
    const yy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    const tomorrowStr = `${yy}-${mm}-${dd}`;
    if (tomorrowStr > updated.endDate) {
      updated.completed = true;
      updated.completedDate = date;
    } else {
      updated.startDate = tomorrowStr;
    }
    try {
      await updateTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error('Update failed', err);
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  async function handleReschedule(task, oldDate, newDate) {
    const updated = { ...task };
    if (!updated.originalDate) {
      updated.originalDate = task.startDate;
    }
    updated.startDate = newDate;
    if (updated.type === 'one-time') {
      updated.endDate = newDate;
    } else if (newDate > updated.endDate) {
      updated.endDate = newDate;
    }
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    try {
      await updateTask(updated);
    } catch (err) {
      console.error('Reschedule failed', err);
    }
  }

  function handleImportComplete() {
    loadTasks();
  }

  function handleOpenDetails(task) {
    setDetailsModalTask(task);
  }

  async function handleSaveDetails(task) {
    try {
      await updateTask(task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setDetailsModalTask(null);
    } catch (err) {
      console.error('Save details failed', err);
    }
  }

  return (
    <div className="app">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onMenuToggle={() => setMenuOpen((prev) => !prev)}
      />

      <div className={`side-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <aside className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <h3>Menu</h3>
          <button className="btn btn-icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="side-nav">
          <button className="side-nav-item" onClick={() => { setShowBackupModal(true); setMenuOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Backup & Restore</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <DayView
          selectedDate={selectedDate}
          tasks={selectedTasks}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onReschedule={handleReschedule}
          onOpenDetails={handleOpenDetails}
        />
        <div className="view-panel">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
          {viewMode === 'week' ? (
            <WeekView
              weekDates={weekDates}
              tasksByDate={tasksByDate}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
          ) : (
            <MonthView
              selectedDate={selectedDate}
              tasksByDate={monthTasksByDate}
              onSelectDate={handleSelectDate}
            />
          )}
        </div>
      </main>

      {selectedDate !== getToday() && (
        <button className="fab fab-jump" onClick={handleJumpToToday} title="Jump to Today" aria-label="Jump to Today">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none" />
          </svg>
        </button>
      )}
      <button
        className="fab"
        onClick={() => setShowAddModal(true)}
        title="Add Task"
        aria-label="Add Task"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-add" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Task</h3>
              <button className="btn btn-icon" onClick={() => setShowAddModal(false)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <AddTaskForm
              onAdd={handleAdd}
              selectedDate={selectedDate}
              onClose={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {showBackupModal && (
        <div className="modal-overlay" onClick={() => setShowBackupModal(false)}>
          <div className="modal modal-backup" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Backup & Restore</h3>
              <button className="btn btn-icon" onClick={() => setShowBackupModal(false)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <BackupRestore onImportComplete={handleImportComplete} />
          </div>
        </div>
      )}

      {recurringModal && (
        <RecurringCompleteModal
          task={recurringModal.task}
          date={recurringModal.date}
          onDoneToday={handleDoneToday}
          onDonePermanently={handleDonePermanently}
          onCancel={() => setRecurringModal(null)}
        />
      )}

      {detailsModalTask && (
        <TaskDetailsModal
          task={detailsModalTask}
          onSave={handleSaveDetails}
          onClose={() => setDetailsModalTask(null)}
        />
      )}
    </div>
  );
}
