export default function RecurringCompleteModal({ task, date, onDoneToday, onDonePermanently, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Complete Recurring Task</h3>
        <p className="modal-task-name">"{task.name}"</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => onDoneToday(task, date)}>
            Done for today only
          </button>
          <button className="btn btn-secondary" onClick={() => onDonePermanently(task, date)}>
            Done permanently
          </button>
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
