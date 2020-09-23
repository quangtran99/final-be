const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must have a UserId"],
    },
    products: [
      Schema({
        quantity: { type: Number, default: 1 },
        productID: {
          _id: { type: Schema.Types.ObjectId },
          brand: String,
          productName: String,
          price: Number,
        },
      }),
    ],
    totalPrice: { type: Number },
    shipping: {
      fullName: {
        type: String,
        required: [true, "Shipping need a fullname for the bill"],
      },
      address: {
        type: String,
        required: [true, "Need address for the bill"],
      },
      email: {
        type: String,
        required: [true, "Need email for the bill"],
      },
    },
    paid: {
      type: Boolean,
      default: false,
    },
    status: { type: String, enum: ["Pending", "Done"], default: "Pending" },
    payment: { type: String, default: "COD" },
    delivery: { type: String, default: "Standard" },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
