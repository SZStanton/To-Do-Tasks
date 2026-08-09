import mongoose from 'mongoose';

// Stores each user's tasks
const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Task', taskSchema);
