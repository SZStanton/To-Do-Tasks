import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useTasks from '../context/useTasks';

const MAX_CHARS = 140;

//=== ADD TASK PAGE ===
// Allows users to create a new task
function AddTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); // Clear old errors

    // Validation
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (title.length > MAX_CHARS) {
      setError(`Title must be ${MAX_CHARS} characters or less.`);
      return;
    }

    setSubmitting(true);
    const result = await addTask(title);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Failed to create task.');
      return;
    }

    // Redirect back to dashboard
    navigate('/');
  };

  const remaining = MAX_CHARS - title.length;

  return (
    <div className="container py-5">
      {/* Page heading */}
      <div className="mb-4">
        <h2>Add Task</h2>
        <p className="text-muted mb-0">Create a new to-do item</p>
      </div>

      <div className="card p-4 shadow-sm task-form">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Task Title</label>
            <textarea
              rows="3"
              className={`form-control${title.length > MAX_CHARS ? ' is-invalid' : ''}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
            <div
              className={`form-text text-end${remaining < 0 ? ' text-danger' : remaining < 20 ? ' text-warning' : ''}`}
            >
              {remaining} characters remaining
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
            <Link to="/" className="btn btn-outline-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTask;
