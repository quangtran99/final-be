const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, require: false },
    emailVerificationCode: { type: String, select: false },
    emailVerified: { type: Boolean, require: true, default: false },
    password: { type: String, required: false },
    friendCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    cart: [
      Schema({
        quantity: { type: Number, default: 1 },
        productID: { type: Schema.Types.ObjectId, ref: "Product" },
      }),
    ],
  },
  { timestamps: true }
);

userSchema.plugin(require("./plugins/isDeletedFalse"));

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

//   const User = mongoose.model("User", userSchema);

module.exports = mongoose.model("User", userSchema);
