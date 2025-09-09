const mongoose = require('mongoose');
// mongoose.set('debug', true);
const bcrypt = require('bcrypt');
const { Messages } = require('../constants/messages');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes whitespace
    lowercase: true, // Converts to lowercase
    match: [/.+\@.+\..+/, Messages.InvalidEmailAddress], // Basic email validation
  },
  username: {
    type: String,
    trim: true,
    default: "",
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Optional: Ensure password has a minimum length
  },
  is_premium: {
    type: Boolean,
    required: true,
    default: false, // Default to not premium
  },
  is_verified: {
    type: Boolean,
    required: true,
    default: false, // Default to not verified initially
  },
  is_deleted: {
    type: Boolean,
    required: true,
    default: false, // Default to not verified initially
  },
  is_therapist: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  wallet_amount: {
    type: Number,
    default: 0,
  }
});

// Pre-save hook to encrypt password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // Hash the password with a salt round of 10
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('user', userSchema);

module.exports = User;
