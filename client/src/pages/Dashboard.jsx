import { useState } from 'react';
import { Link } from 'react-router-dom';
import useTasks from '../context/useTasks';
import TaskCard from '../components/TaskCard';

const FILTERS = ['All', 'Active', 'Completed'];

//=== DASHBOARD PAGE ===
// Displays all tasks with filter tabs
function Dashboard() {
  const { tasks, deleteTask, updateTask, loading, error } = useTasks();
  const [filter, setFilter] = useState('All');

  const filtered = tasks.filter(task => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const activeCount = tasks.filter(task => !task.completed).length;

  return (
    <div className="container py-4">
      {/* Tasks heading */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">My Tasks</h2>
          <p className="text-muted mb-0">
            {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
        {/* Add task button */}
        <Link to="/add" className="btn btn-primary">
          + Add Task
        </Link>
      </div>

      {/* Filter tabs */}
      <ul className="nav nav-tabs mb-4">
        {FILTERS.map(f => (
          <li className="nav-item" key={f}>
            <button
              className={`nav-link${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          </li>
        ))}
      </ul>

      {/* Content */}
      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : loading ? (
        <div className="alert alert-secondary">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">
          {filter === 'All'
            ? 'No tasks yet. Add one!'
            : `No ${filter.toLowerCase()} tasks.`}
        </div>
      ) : (
        <div className="task-list">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={deleteTask}
              onToggle={completed => updateTask(task.id, { completed })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
