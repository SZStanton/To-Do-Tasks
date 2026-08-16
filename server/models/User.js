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
    // The sign-in handle, not a display name. Lowercased so the unique index
    // catches every clash on its own. Use `name` for anything shown on screen
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 30,
    },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
