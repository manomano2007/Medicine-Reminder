const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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

  paymentMethod: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "Requested",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);