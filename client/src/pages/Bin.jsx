import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useTasks from '../context/useTasks';

// Rough is fine here, it only ever needs to say "about this long left"
const hoursLeft = deletedAt => {
  const gone = Date.now() - new Date(deletedAt).getTime();
  const left = Math.ceil((24 * 60 * 60 * 1000 - gone) / (60 * 60 * 1000));
  return Math.max(left, 0);
};

//=== BIN PAGE ===
// Deleted tasks wait here for a day, then clear themselves
function Bin() {
  const { bin, binLoading, fetchBin, restoreTask, deleteForever, emptyBin } =
    useTasks();

  useEffect(() => {
    fetchBin();
  }, [fetchBin]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Bin</h2>
          <p className="text-muted mb-0">
            Deleted tasks are removed automatically after 24 hours
          </p>
        </div>

        {bin.length > 0 && (
          <button
            className="btn btn-outline-danger d-flex align-items-center gap-2"
            onClick={emptyBin}
          >
            <i className="bi bi-trash3" aria-hidden="true" />
            Empty bin
          </button>
        )}
      </div>

      {binLoading ? (
        <div className="alert alert-secondary">Loading the bin...</div>
      ) : bin.length === 0 ? (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <i className="bi bi-trash3" aria-hidden="true" />
          <span>
            The bin is empty. <Link to="/">Back to your tasks</Link>
          </span>
        </div>
      ) : (
        <div className="task-list">
          {bin.map(task => (
            <div key={task.id} className="task-card card shadow-sm task-binned">
              <div className="task-row">
                <div className="task-main">
                  <span className="task-title text-muted">{task.title}</span>
                  <span className="bin-countdown">
                    {hoursLeft(task.deletedAt)}h left
                  </span>
                </div>

                <div className="task-actions">
                  <button
                    type="button"
                    className="task-action task-action-restore"
                    onClick={() => restoreTask(task.id)}
                    title="Put this back"
                  >
                    <i
                      className="bi bi-arrow-counterclockwise"
                      aria-hidden="true"
                    />
                    <span>Restore</span>
                  </button>
                  <button
                    type="button"
                    className="task-action task-action-delete"
                    onClick={() => deleteForever(task.id)}
                    title="Delete permanently"
                  >
                    <i className="bi bi-x-lg" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bin;
