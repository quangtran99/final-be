var express = require('express');
var router = express.Router();

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// productApi
const productApi = require("./product.api.js");
router.use("/products", productApi);

// cartApi
const cartApi = require("./cart.api")
router.use("/cart", cartApi)

module.exports = router;
