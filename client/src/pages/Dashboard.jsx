import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import useTasks from '../context/useTasks';
import TaskCard from '../components/TaskCard';

const FILTERS = ['All', 'Active', 'Completed'];

//=== DASHBOARD PAGE ===
// Displays all tasks with filter tabs
function Dashboard() {
  const { tasks, deleteTask, updateTask, reorderTasks, loading, error } =
    useTasks();
  const [filter, setFilter] = useState('All');

  // Memoised because a drag re-renders this on every pointer move, and a fresh
  // array each time makes the sortable list re-register its items
  const filtered = useMemo(
    () =>
      tasks.filter(task => {
        if (filter === 'Active') return !task.completed;
        if (filter === 'Completed') return task.completed;
        return true;
      }),
    [tasks, filter],
  );

  const itemIds = useMemo(() => filtered.map(task => task.id), [filtered]);

  const activeCount = tasks.filter(task => !task.completed).length;

  // Reordering a list that is hiding half its items produces an order you
  // cannot see, so dragging is only on when everything is shown
  const canReorder = filter === 'All' && filtered.length > 1;

  const sensors = useSensors(
    // A small distance first, or a click on the grip counts as a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const from = tasks.findIndex(task => task.id === active.id);
    const to = tasks.findIndex(task => task.id === over.id);
    if (from === -1 || to === -1) return;

    reorderTasks(arrayMove(tasks, from, to));
  };

  const list = (
    <div className="task-list">
      {filtered.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          sortable={canReorder}
          onDelete={deleteTask}
          onToggle={completed => updateTask(task.id, { completed })}
        />
      ))}
    </div>
  );

  return (
    <div className="container py-5">
      {/* Tasks heading */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">My Tasks</h2>
          <p className="text-muted mb-0">
            {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
        {/* Add task button */}
        <Link
          to="/add"
          className="btn btn-primary app-add-btn d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Add Task
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
      ) : canReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          /* Up and down only, and it cannot leave the list and float over
             the tabs above it */
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {list}
          </SortableContext>
        </DndContext>
      ) : (
        list
      )}
    </div>
  );
}

export default Dashboard;
