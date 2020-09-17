const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const cartSchema = Schema ({
products: {
    quantity: { type: Number, default: 1},
    productID: { type: String}
}
})


module.exports = mongoose.model("Cart", cartSchema);