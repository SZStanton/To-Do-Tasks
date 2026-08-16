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

    // Mongo deletes the document once this passes. No date means never, which
    // is exactly how the demo account is exempt without a special case
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },

    // The shared account whose tasks reset on login. Never expires
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
