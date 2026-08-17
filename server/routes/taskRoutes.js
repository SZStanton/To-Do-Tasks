import { Router } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import protect from '../middleware/auth.js';
import validEmail from '../middleware/validEmail.js';
import jsonOnly from '../middleware/jsonOnly.js';
import taskLength from '../middleware/taskLength.js';
import { binExpiry } from '../config/retention.js';

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
  deletedAt: task.deletedAt,
  order: task.order,
});

// Lowest order first. createdAt breaks ties, so before anything has been
// dragged the list still reads newest first
const LIST_ORDER = { order: 1, createdAt: -1 };

// Live tasks only. Everything binned is filtered out unless asked for by name
const live = req => ({ user: req.user.id, deletedAt: null });
const binned = req => ({ user: req.user.id, deletedAt: { $ne: null } });

//== GET ALL TASKS ==
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find(live(req)).sort(LIST_ORDER);
    res.json(tasks.map(toTask));
  } catch {
    res.status(500).json({ message: 'Could not fetch tasks.' });
  }
});

//== GET THE BIN ==
// Must sit above /:id or express reads "bin" as an id
router.get('/bin', async (req, res) => {
  try {
    const tasks = await Task.find(binned(req)).sort({ deletedAt: -1 });
    res.json(tasks.map(toTask));
  } catch {
    res.status(500).json({ message: 'Could not fetch the bin.' });
  }
});

//== EMPTY THE BIN ==
router.delete('/bin', async (req, res) => {
  try {
    const { deletedCount } = await Task.deleteMany(binned(req));
    res.json({ message: 'Bin emptied.', deletedCount });
  } catch {
    res.status(500).json({ message: 'Could not empty the bin.' });
  }
});

//== REORDER ==
// Takes the whole list of ids in their new order and rewrites the positions.
// Above /:id, and it only ever touches ids that belong to this user
router.put('/reorder', jsonOnly, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'An array of ids is required.' });
    }

    if (!ids.every(id => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: 'One of the ids is not valid.' });
    }

    await Task.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: { _id: id, ...live(req) },
          update: { order: index },
        },
      })),
    );

    const tasks = await Task.find(live(req)).sort(LIST_ORDER);
    res.json(tasks.map(toTask));
  } catch {
    res.status(500).json({ message: 'Could not reorder the tasks.' });
  }
});

//== GET ONE TASK ==
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, ...live(req) });
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
      { _id: req.params.id, ...live(req) },
      update,
      { returnDocument: 'after' },
    );

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    res.json(toTask(task));
  } catch {
    res.status(500).json({ message: 'Could not update task.' });
  }
});

//== PUT A TASK BACK ==
router.put('/:id/restore', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ...binned(req) },
      // Back onto the account's own clock, off the 24 hour one. Null rather
      // than undefined, or mongoose strips it and the demo account's restored
      // tasks keep the 24 hour expiry and quietly disappear
      { deletedAt: null, expiresAt: req.user.expiresAt ?? null },
      { returnDocument: 'after' },
    );

    if (!task) return res.status(404).json({ message: 'Task not in the bin.' });

    res.json(toTask(task));
  } catch {
    res.status(500).json({ message: 'Could not restore the task.' });
  }
});

//== MOVE A TASK TO THE BIN ==
// Not a real delete. The TTL index clears it 24 hours later
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ...live(req) },
      { deletedAt: new Date(), expiresAt: binExpiry() },
      { returnDocument: 'after' },
    );

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    res.json(toTask(task));
  } catch {
    res.status(500).json({ message: 'Could not delete task.' });
  }
});

//== DELETE FOR GOOD ==
router.delete('/:id/permanent', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      ...binned(req),
    });

    if (!task) return res.status(404).json({ message: 'Task not in the bin.' });

    res.json({ message: 'Task deleted permanently.' });
  } catch {
    res.status(500).json({ message: 'Could not delete the task.' });
  }
});

export default router;
