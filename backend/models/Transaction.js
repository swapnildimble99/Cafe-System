const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true       // 🔴 Step 5: prevent duplicate payment
    },
    customer: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      required: true
    },
    tableNo: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      required: true,
      enum: ["CASH", "ONLINE"]
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true   // 🔴 auto creates createdAt & updatedAt
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
