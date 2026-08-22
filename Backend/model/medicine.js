const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  medicineName: {
    type: String,
    required: true,
  },

  dosage: {
    type: String,
    default: "",
  },

  // Current remaining quantity (decreases only on confirmed "Taken")
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },

  // The quantity the medicine was added/topped-up with, used only as a
  // reference point - never decremented directly.
  initialQuantity: {
    type: Number,
    required: true,
    min: 0,
  },

  // Daily reminder time in "HH:MM" (24hr) format
  time: {
    type: String,
    required: true,
  },

  startDate: {
    type: String,
    default: "",
  },

  endDate: {
    type: String,
    default: "",
  },

  lowStockThreshold: {
    type: Number,
    default: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Medicine", medicineSchema);
