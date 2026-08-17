import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

//=== TASK CARD COMPONENT ===
// Displays a single task with complete/edit/delete actions
function TaskCard({ task, onDelete, onToggle, sortable = false }) {
  // The title is a label for the checkbox, so clicking the text toggles it
  // natively. No click handler needed and it still works from a keyboard
  const checkboxId = `task-${task.id}`;

  // Always called, hooks cannot be conditional. Disabled turns dragging off
  // while a filter is on, where a new order would be invisible and confusing
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    // The card being dragged follows the cursor with no easing. The others keep
    // the library's transition so they slide out of the way smoothly
    transition: isDragging ? 'none' : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card card shadow-sm${task.completed ? ' task-done' : ''}${isDragging ? ' is-dragging' : ''}`}
    >
      <div className="task-row">
        {sortable && (
          <button
            type="button"
            className="task-grip"
            aria-label={`Reorder ${task.title}`}
            {...attributes}
            {...listeners}
          >
            <i className="bi bi-grip-vertical" aria-hidden="true" />
          </button>
        )}

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
          {/* No confirmation, it goes to the bin and can be put back */}
          <button
            type="button"
            className="task-action task-action-delete"
            onClick={() => onDelete(task.id)}
            title="Move to the bin"
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
