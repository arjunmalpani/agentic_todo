const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("todoModel", todoSchema);
