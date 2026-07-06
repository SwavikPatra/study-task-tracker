import { useState, useRef } from 'react';
import { getAllTasks, importTasks } from '../utils/db';
import { getToday } from '../utils/dateUtils';

export default function BackupRestore({ onImportComplete }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReplaceOption, setShowReplaceOption] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const fileRef = useRef(null);

  async function handleBackup() {
    setLoading(true);
    try {
      const tasks = await getAllTasks();
      const json = JSON.stringify(tasks, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-tasks-backup-${getToday()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Backup downloaded successfully');
    } catch (err) {
      setMessage('Backup failed: ' + err.message);
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data)) {
          setMessage('Invalid JSON: expected an array of tasks');
          return;
        }
        setPendingData(data);
        setShowReplaceOption(true);
      } catch {
        setMessage('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  async function doImport(replace) {
    if (!pendingData) return;
    setLoading(true);
    try {
      const count = await importTasks(pendingData, replace);
      setMessage(`Tasks imported successfully. ${count} tasks loaded.`);
      setShowReplaceOption(false);
      setPendingData(null);
      if (fileRef.current) fileRef.current.value = '';
      onImportComplete();
    } catch (err) {
      setMessage('Import failed: ' + err.message);
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <div className="backup-restore">
      <h3 className="section-title">Backup & Restore</h3>
      <div className="backup-actions">
        <button className="btn btn-secondary" onClick={handleBackup} disabled={loading}>
          {loading ? 'Processing...' : 'Backup'}
        </button>
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={loading}>
          Restore
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      {showReplaceOption && (
        <div className="import-options">
          <p>Import {pendingData?.length || 0} tasks?</p>
          <button className="btn btn-sm btn-primary" onClick={() => doImport(false)}>Merge</button>
          <button className="btn btn-sm btn-danger" onClick={() => doImport(true)}>Replace All</button>
          <button className="btn btn-sm" onClick={() => { setShowReplaceOption(false); setPendingData(null); }}>Cancel</button>
        </div>
      )}
      {message && <p className="form-message">{message}</p>}
    </div>
  );
}
