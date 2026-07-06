import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function RescheduleModal({ task, date, onReschedule, onCancel }) {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(d + 1);
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  const [newDate, setNewDate] = useState(`${yy}-${mm}-${dd}`);

  function handleSubmit() {
    if (newDate && newDate !== date) {
      onReschedule(task, date, newDate);
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Reschedule Task</h3>
        <p className="modal-task-name">"{task.name}"</p>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <input
            type="date"
            className="input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Move
          </button>
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
