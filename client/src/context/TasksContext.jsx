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

  //=== REORDER ===
  const reorderTasks = useCallback(
    async ordered => {
      // The list has already moved under the cursor, so this only has to
      // persist it and put things back if the server disagrees
      const snapshot = tasks;
      setTasks(ordered);

      try {
        const response = await fetch(`${API_URL}/api/tasks/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: ordered.map(task => task.id) }),
        });

        const data = await response.json();

        if (!response.ok) {
          setTasks(snapshot);
          return { success: false, message: data.message };
        }

        setTasks(data);
        return { success: true };
      } catch {
        setTasks(snapshot);
        return { success: false, message: 'Could not save the new order.' };
      }
    },
    [token, tasks],
  );

  //=== THE BIN ===
  // Fetched on demand rather than kept in sync, nobody sits watching the bin
  const [bin, setBin] = useState([]);
  const [binLoading, setBinLoading] = useState(false);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const fetchBin = useCallback(async () => {
    if (!token) return;
    setBinLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tasks/bin`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      setBin(response.ok ? data : []);
    } catch {
      setBin([]);
    } finally {
      setBinLoading(false);
    }
  }, [token, authHeaders]);

  const restoreTask = useCallback(
    async id => {
      const snapshot = bin;
      setBin(prev => prev.filter(task => task.id !== id));

      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}/restore`, {
          method: 'PUT',
          headers: authHeaders(),
        });
        const data = await response.json();

        if (!response.ok) {
          setBin(snapshot);
          return { success: false, message: data.message };
        }

        // Straight back into the list, no refetch needed
        setTasks(prev => [data, ...prev]);
        return { success: true };
      } catch {
        setBin(snapshot);
        return { success: false, message: 'Could not restore the task.' };
      }
    },
    [bin, authHeaders],
  );

  const deleteForever = useCallback(
    async id => {
      const snapshot = bin;
      setBin(prev => prev.filter(task => task.id !== id));

      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}/permanent`, {
          method: 'DELETE',
          headers: authHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
          setBin(snapshot);
          return { success: false, message: data.message };
        }
        return { success: true };
      } catch {
        setBin(snapshot);
        return { success: false, message: 'Could not delete the task.' };
      }
    },
    [bin, authHeaders],
  );

  const emptyBin = useCallback(async () => {
    const snapshot = bin;
    setBin([]);

    try {
      const response = await fetch(`${API_URL}/api/tasks/bin`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        setBin(snapshot);
        return { success: false, message: data.message };
      }
      return { success: true };
    } catch {
      setBin(snapshot);
      return { success: false, message: 'Could not empty the bin.' };
    }
  }, [bin, authHeaders]);

  //=== GET SINGLE TASK ===
  const getTask = useCallback(
    id => tasks.find(task => task.id === id),
    [tasks],
  );

  //=== CONTEXT VALUES ===
  // Memorized context values
  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      addTask,
      updateTask,
      deleteTask,
      reorderTasks,
      getTask,
      bin,
      binLoading,
      fetchBin,
      restoreTask,
      deleteForever,
      emptyBin,
    }),
    [
      tasks,
      loading,
      error,
      addTask,
      updateTask,
      deleteTask,
      reorderTasks,
      getTask,
      bin,
      binLoading,
      fetchBin,
      restoreTask,
      deleteForever,
      emptyBin,
    ],
  );

  // Provide tasks data to the app
  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export { TasksContext, TasksProvider };
