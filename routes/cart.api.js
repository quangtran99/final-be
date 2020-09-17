const express = require("express");
const router = express.Router();
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");


module.exports = router;