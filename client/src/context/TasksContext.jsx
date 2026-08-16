import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useAuth from './useAuth';

//=== TASKS CONTEXT ===
// Handles all task CRUD using the backend API
const TasksContext = createContext(null);

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL;

//=== TASKS PROVIDER ===
function TasksProvider({ children }) {
  const { token } = useAuth();

  // Store all tasks
  const [tasks, setTasks] = useState([]);
  // Loading state while fetching tasks
  const [loading, setLoading] = useState(true);
  // Handles errors
  const [error, setError] = useState('');

  // Counts requests per task id. Ticking a box four times fast leaves four
  // replies racing back, and only the newest one should be allowed to land
  const latestRequest = useRef({});

  //=== FETCH TASKS ===
  // Load tasks when user logs in
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Could not fetch tasks.');
          setTasks([]);
        } else {
          setTasks(data);
          setError('');
        }
      } catch {
        setError('Could not fetch tasks.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  //=== TASK FUNCTIONS ===
  //=== ADD TASK ===
  const addTask = useCallback(
    async title => {
      try {
        const response = await fetch(`${API_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, message: data.message };
        }

        setTasks(prev => [data, ...prev]);
        return { success: true };
      } catch {
        return { success: false, message: 'Could not create task.' };
      }
    },
    [token],
  );

  //=== UPDATE TASK ===
  const updateTask = useCallback(
    async (id, updates) => {
      // Show the change immediately. A round trip to Frankfurt is not something
      // the person ticking a checkbox should have to sit through
      const seq = (latestRequest.current[id] ?? 0) + 1;
      latestRequest.current[id] = seq;
      const isCurrent = () => latestRequest.current[id] === seq;

      const snapshot = tasks;
      setTasks(prev =>
        prev.map(task => (task.id === id ? { ...task, ...updates } : task)),
      );

      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          if (isCurrent()) setTasks(snapshot);
          return { success: false, message: data.message };
        }

        // Take the server's copy, it owns updatedAt and any trimming. Skipped
        // if you have clicked again since, that reply is already out of date
        if (isCurrent()) {
          setTasks(prev => prev.map(task => (task.id === id ? data : task)));
        }
        return { success: true };
      } catch {
        if (isCurrent()) setTasks(snapshot);
        return { success: false, message: 'Could not update task.' };
      }
    },
    [token, tasks],
  );

  //=== DELETE TASK ===
  const deleteTask = useCallback(
    async id => {
      // Same reasoning as updateTask, it goes now and comes back if the server
      // refuses. Deleting something and watching it sit there feels broken
      const snapshot = tasks;
      setTasks(prev => prev.filter(task => task.id !== id));

      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json();
          setTasks(snapshot);
          return { success: false, message: data.message };
        }

        return { success: true };
      } catch {
        setTasks(snapshot);
        return { success: false, message: 'Could not delete task.' };
      }
    },
    [token, tasks],
  );

  //=== GET SINGLE TASK ===
  const getTask = useCallback(
    id => tasks.find(task => task.id === id),
    [tasks],
  );

  //=== CONTEXT VALUES ===
  // Memorized context values
  const value = useMemo(
    () => ({ tasks, loading, error, addTask, updateTask, deleteTask, getTask }),
    [tasks, loading, error, addTask, updateTask, deleteTask, getTask],
  );

  // Provide tasks data to the app
  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export { TasksContext, TasksProvider };
