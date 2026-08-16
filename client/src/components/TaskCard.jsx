import { Link } from 'react-router-dom';

//=== TASK CARD COMPONENT ===
// Displays a single task with complete/edit/delete actions
function TaskCard({ task, onDelete, onToggle }) {
  // The title is a label for the checkbox, so clicking the text toggles it
  // natively. No click handler needed and it still works from a keyboard
  const checkboxId = `task-${task.id}`;

  return (
    <div
      className={`task-card card mb-2 shadow-sm${task.completed ? ' task-done' : ''}`}
    >
      <div className="card-body d-flex align-items-center gap-3 py-3">
        {/* Completion Checkbox */}
        <input
          id={checkboxId}
          type="checkbox"
          className="form-check-input task-checkbox flex-shrink-0"
          checked={task.completed}
          onChange={e => onToggle(e.target.checked)}
          title={task.completed ? 'Mark as active' : 'Mark as complete'}
        />

        {/* Task title, doubles as the checkbox label */}
        <label
          htmlFor={checkboxId}
          className={`task-title flex-grow-1${task.completed ? ' text-decoration-line-through text-muted' : ''}`}
        >
          {task.title}
        </label>

        {/* Action buttons */}
        <div className="d-flex gap-2 flex-shrink-0">
          {/* Edit task */}
          <Link
            to={`/edit/${task.id}`}
            className="btn btn-warning btn-sm"
            title="Edit task"
          >
            Edit
          </Link>
          {/* Delete task */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
