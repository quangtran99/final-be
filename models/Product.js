const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    brand: { type: String, required: true }, //model
    productName: { type: String, required: true }, // name
    author: {
      //userPosted
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    price: { type: Number, required: true },
    images: { type: String },
    stock: { type: Number },
    size: { type: Number },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

productSchema.plugin(require("./plugins/isDeletedFalse"));

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
