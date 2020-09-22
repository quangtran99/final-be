const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route POST api/users
 * @description Register new user
 * @access Public
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

/**
 * @route POST api/users/verify_email
 * @description Verify email of a new user
 * @access Public
 */
router.post(
  "/verify_email",
  validators.validate([
    body("code", "Invalid Verification Code").exists().notEmpty(),
  ]),
  userController.verifyEmail
);

/**
 * @route PUT api/users/
 * @description Update user profile
 * @access Login required
 */
router.put("/", authMiddleware.loginRequired, userController.updateProfile);

/**
 * @route GET api/users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", authMiddleware.loginRequired, userController.getCurrentUser);

/**
 * @route post api/users/cart
 * @description Add to cart
 * @access Login required
 */
router.post("/cart", authMiddleware.loginRequired, userController.addToCart);

/**
 * @route delete api/users/cart/:id
 * @description Delete from cart
 * @access Login required
 */
router.delete(
  "/cart/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.deleteItem
);

/**
 * @route post api/users/cart
 * @description Update Quantity
 * @access Login required
 */
router.post(
  "/update-quantity",
  authMiddleware.loginRequired,
  userController.updateQuantity
);

module.exports = router;
