import { useState, useEffect, useRef } from 'react';
import { getToday } from '../utils/dateUtils';

export default function AddTaskForm({ onAdd, selectedDate, onClose }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('one-time');
  const [startDate, setStartDate] = useState(selectedDate || getToday());
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Task name cannot be empty');
      return;
    }
    if (type === 'recurring' && (!endDate || endDate < startDate)) {
      setError('End date must be on or after start date');
      return;
    }
    setError('');
    const task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: trimmed,
      note: note.trim() || '',
      type,
      startDate,
      endDate: type === 'one-time' ? startDate : endDate,
      completed: false,
      completedDate: null,
      originalDate: null,
      isOverdue: false,
      createdAt: new Date().toISOString(),
    };
    onAdd(task);
    setName('');
    if (type === 'recurring') {
      setEndDate('');
    }
    onClose?.();
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          ref={inputRef}
          type="text"
          className="input"
          placeholder="Task name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Task name"
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-options">
        <label className="radio-label">
          <input
            type="radio"
            name="taskType"
            value="one-time"
            checked={type === 'one-time'}
            onChange={() => setType('one-time')}
          />
          One-time
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="taskType"
            value="recurring"
            checked={type === 'recurring'}
            onChange={() => setType('recurring')}
          />
          Recurring
        </label>
        <label className="date-label">
          Start:
          <input
            type="date"
            className="input input-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        {type === 'recurring' && (
          <label className="date-label">
            End:
            <input
              type="date"
              className="input input-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        )}
      </div>
      <textarea
        className="input input-note"
        placeholder="Notes (optional)..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        aria-label="Task notes"
      />
    </form>
  );
}
