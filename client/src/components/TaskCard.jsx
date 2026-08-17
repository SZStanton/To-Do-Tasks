import { Link } from 'react-router-dom';

//=== TASK CARD COMPONENT ===
// Displays a single task with complete/edit/delete actions
function TaskCard({ task, onDelete, onToggle }) {
  // The title is a label for the checkbox, so clicking the text toggles it
  // natively. No click handler needed and it still works from a keyboard
  const checkboxId = `task-${task.id}`;

  return (
    <div
      className={`task-card card shadow-sm${task.completed ? ' task-done' : ''}`}
    >
      <div className="task-row">
        {/* Checkbox and title share the padded area */}
        <div className="task-main">
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
            className={`task-title${task.completed ? ' text-decoration-line-through text-muted' : ''}`}
          >
            {task.title}
          </label>
        </div>

        {/* Full height actions, divided off from the title */}
        <div className="task-actions">
          <Link
            to={`/edit/${task.id}`}
            className="task-action task-action-edit"
            title="Edit task"
            /* it is a link, so without this you can drag it and see the url */
            draggable={false}
          >
            <i className="bi bi-pencil" aria-hidden="true" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            className="task-action task-action-delete"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            <i className="bi bi-trash3" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
