import mongoose from 'mongoose';

// Stores login details
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Kept exactly as typed so it reads as a name. Uniqueness is checked
    // case-insensitively in the register route, this index only catches exact clashes
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 30,
    },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
