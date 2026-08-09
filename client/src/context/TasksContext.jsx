import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
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
          return { success: false, message: data.message };
        }

        setTasks(prev => prev.map(task => (task.id === id ? data : task)));
        return { success: true };
      } catch {
        return { success: false, message: 'Could not update task.' };
      }
    },
    [token],
  );

  //=== DELETE TASK ===
  const deleteTask = useCallback(
    async id => {
      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json();
          return { success: false, message: data.message };
        }

        setTasks(prev => prev.filter(task => task.id !== id));
        return { success: true };
      } catch {
        return { success: false, message: 'Could not delete task.' };
      }
    },
    [token],
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
