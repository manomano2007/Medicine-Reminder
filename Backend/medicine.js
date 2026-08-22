const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  medicineName: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Medicine", medicineSchema);