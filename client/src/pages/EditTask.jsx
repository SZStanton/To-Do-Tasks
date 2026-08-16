import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useTasks from '../context/useTasks';

const MAX_CHARS = 140;

//=== EDIT TASK FORM ===
// Only mounted once the task exists, so the initial title is always right
function EditTaskForm({ task }) {
  const navigate = useNavigate();
  const { updateTask } = useTasks();

  const [title, setTitle] = useState(task.title);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    const result = await updateTask(task.id, { title });
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Failed to update task.');
      return;
    }

    navigate('/');
  };

  const remaining = MAX_CHARS - title.length;

  return (
    <div className="container py-5">
      {/* Page heading */}
      <div className="mb-4">
        <h2>Edit Task</h2>
        <p className="text-muted mb-0">Update your task</p>
      </div>

      <div className="card p-4 shadow-sm task-form">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="title">
              Task Title
            </label>
            <textarea
              id="title"
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

//=== EDIT TASK PAGE ===
// Waits for the task before rendering the form. Reaching the form directly on a
// refresh used to give an empty box, because the tasks had not arrived yet
function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, loading } = useTasks();

  const task = getTask(id);

  // Only give up once the tasks have actually loaded
  useEffect(() => {
    if (!loading && !task) navigate('/');
  }, [loading, task, navigate]);

  if (loading) return <div className="container py-5">Loading task...</div>;
  if (!task) return null;

  return <EditTaskForm task={task} />;
}

export default EditTask;
