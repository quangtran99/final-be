const express = require("express");
const router = express.Router();
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route post api/transaction
 * @description Update transaction
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  transactionController.createOrder
);

/**
 * @route GET api/transaction?page=1&limit=10
 * @description Get transaction with pagination
 * @access Public
 */
router.get("/", authMiddleware.loginRequired, transactionController.getOrder);

/**
 * @route UPDATE api/transaction/:id
 * @description Get transaction with pagination
 * @access Public
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  transactionController.updateStatus
);

module.exports = router;
