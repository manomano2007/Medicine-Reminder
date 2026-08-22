const mongoose = require("mongoose");

// One record per (medicine, calendar day). Created only when the user
// taps "Confirm Taken" - never when a reminder just fires.
const takenLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },

  // "YYYY-MM-DD" - the local calendar day this dose belongs to
  date: {
    type: String,
    required: true,
  },

  taken: {
    type: Boolean,
    default: true,
  },

  takenAt: {
    type: Date,
    default: Date.now,
  },
});

// A medicine can only be confirmed once per day - this is what
// prevents duplicate deductions.
takenLogSchema.index({ medicineId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("TakenLog", takenLogSchema);
