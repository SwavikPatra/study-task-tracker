import { useState, useEffect, useRef } from 'react';

export default function TaskDetailsModal({ task, onSave, onClose }) {
  const [name, setName] = useState(task.name);
  const [note, setNote] = useState(task.note || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ ...task, name: trimmed, note: note.trim() });
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-details" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Task Details</h3>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="details-field">
          <label className="details-label">Title</label>
          <input
            ref={inputRef}
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Task title"
          />
        </div>
        <div className="details-field">
          <label className="details-label">Note</label>
          <textarea
            className="input input-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Add a note..."
            aria-label="Task note"
          />
        </div>
        <div className="details-actions">
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
