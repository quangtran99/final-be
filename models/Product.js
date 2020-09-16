const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    title: { type: String, required: true }, //model
    content: { type: String, required: true }, // name
    author: {                                   //userPosted
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    price: [Number],
    images: [String],
    stock: [Number],
    size:[Number],
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

productSchema.plugin(require("./plugins/isDeletedFalse"));

const Product = mongoose.model("Product", productSchema);
module.exports = Product;