const express = require("express");
const router = express.Router();
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
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

module.exports = router;
