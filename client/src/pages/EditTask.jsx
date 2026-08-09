import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useTasks from '../context/useTasks';

const MAX_CHARS = 140;

//=== EDIT TASK PAGE ===
// Allows users to edit existing task
function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, updateTask, loading } = useTasks();

  const task = getTask(id);
  // Initialize title from task to avoid setting state synchronously in an effect
  const [title, setTitle] = useState(() => (task ? task.title : ''));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if task not found
  useEffect(() => {
    if (!loading && !task) {
      navigate('/');
    }
  }, [loading, task, navigate]);

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (title.length > MAX_CHARS) {
      setError(`Title must be ${MAX_CHARS} characters or less.`);
      return;
    }

    setSubmitting(true);
    const result = await updateTask(id, { title });
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Failed to update task.');
      return;
    }

    // Return to dashboard
    navigate('/');
  };

  // Loading State
  if (loading) return <div className="container py-4">Loading task...</div>;

  const remaining = MAX_CHARS - title.length;

  return (
    <div className="container py-4">
      {/* Page heading */}
      <div className="mb-4">
        <h2>Edit Task</h2>
        <p className="text-muted mb-0">Update your task</p>
      </div>

      <div className="card p-4 shadow-sm  task-form">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Task Title</label>
            <textarea
              rows="3"
              className={`form-control${title.length > MAX_CHARS ? ' is-invalid' : ''}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="what needs to be done?"
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
              {submitting ? 'Saving...' : 'Update Task'}
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

export default EditTask;
