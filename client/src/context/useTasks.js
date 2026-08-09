import { useContext } from 'react';
import { TasksContext } from './TasksContext';

function useTasks() {
  const context = useContext(TasksContext);
  // Prevent using the hook outside the provider
  if (!context) {
    throw new Error('useTasks must be used inside an TasksProvider');
  }
  return context;
}

export default useTasks;
