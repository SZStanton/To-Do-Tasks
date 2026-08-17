import Task from '../models/Task.js';

// The shared account a visitor can try without handing over an email. Its tasks
// are wiped and rebuilt on every sign in, so nobody inherits the last person's mess.

// Enough to show the filters and the completed styling doing something
const DEMO_TASKS = [
  { title: 'Try editing this task', completed: false },
  { title: 'Tick one off to see it move to Completed', completed: false },
  { title: 'Add a task of your own', completed: false },
  { title: 'Delete anything you like, it all resets', completed: false },
  { title: 'This one is already done', completed: true },
];

// No expiresAt on these, the demo is never swept up by the retention TTL
async function resetDemoTasks(userId) {
  await Task.deleteMany({ user: userId });
  // Explicit order, they are inserted in the same millisecond so createdAt
  // cannot be relied on to break the tie
  await Task.insertMany(
    DEMO_TASKS.map((task, order) => ({ ...task, user: userId, order })),
  );
}

export { DEMO_TASKS, resetDemoTasks };
