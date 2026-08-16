import mongoose from 'mongoose';

// Stores each user's tasks
const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    completed: { type: Boolean, default: false },

    // Copied from the owner so the two always expire together. Demo tasks have
    // no date, they are cleared and reseeded on login instead
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

export default mongoose.model('Task', taskSchema);
