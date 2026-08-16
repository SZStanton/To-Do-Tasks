import { Router } from 'express';
import Task from '../models/Task.js';
import protect from '../middleware/auth.js';
import validEmail from '../middleware/validEmail.js';
import jsonOnly from '../middleware/jsonOnly.js';
import taskLength from '../middleware/taskLength.js';

const router = Router();

// Every task route requires a valid JWT
router.use(protect);

// Every task route requires the account to have a valid email
router.use(validEmail);

//== HELPERS ==
const toTask = task => ({
  id: task._id.toString(),
  user: task.user,
  title: task.title,
  completed: task.completed,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

//== GET ALL TASKS ==
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tasks.map(toTask));
  } catch {
    res.status(500).json({ message: 'Could not fetch tasks.' });
  }
});

//== GET ONE TASK ==
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(toTask(task));
  } catch {
    res.status(500).json({ message: 'Could not fetch task.' });
  }
});

//== CREATE TASK ==
// jsonOnly must be application/json, taskLength title must be <= 140 chars
router.post('/', jsonOnly, taskLength, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      // Inherit the owner's date rather than setting a later one of its own
      expiresAt: req.user.expiresAt,
    });

    res.status(201).json(toTask(task));
  } catch {
    res.status(500).json({ message: 'Could not create task.' });
  }
});

//== UPDATE TASK ==
// jsonOnly must be application/json, taskLength title must be <= 140 chars
router.put('/:id', jsonOnly, taskLength, async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Task title cannot be empty.' });
    }

    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (completed !== undefined) update.completed = Boolean(completed);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { returnDocument: 'after' },
    );

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    res.json(toTask(task));
  } catch {
    res.status(500).json({ message: 'Could not update task.' });
  }
});

//== DELETE TASK ==
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    res.json({ message: 'Task deleted successfully.' });
  } catch {
    res.status(500).json({ message: 'Could not delete task.' });
  }
});

export default router;
