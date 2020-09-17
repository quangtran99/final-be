const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const User = require("../models/User");
//   const Friendship = require("../models/Friendship");
const bcrypt = require("bcryptjs");
//   const Conversation = require("../models/Conversation");
//   const { emailHelper } = require("../helpers/email.helper");
const utilsHelper = require("../helpers/utils.helper");
const FRONTEND_URL = process.env.FRONTEND_URL;
const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, avatarUrl, password } = req.body;
  let user = await User.findOne({ email });
  if (user)
    return next(new AppError(409, "User already exists", "Register Error"));

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  const emailVerificationCode = utilsHelper.generateRandomHexString(20);
  // const emailVerificationCode = await bcrypt.hash(email, salt);
  user = await User.create({
    name,
    email,
    password,
    avatarUrl,
    emailVerificationCode,
    emailVerified: false,
  });
  const accessToken = await user.generateToken();

  const verificationURL = `${FRONTEND_URL}/verify/${emailVerificationCode}`;
  const emailData = await emailHelper.renderEmailTemplate(
    "verify_email",
    { name, code: verificationURL },
    email
  );
  if (!emailData.error) {
    emailHelper.send(emailData);
  } else {
    return next(new AppError(500, emailData.error, "Create Email Error"));
  }

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successful"
  );
});

userController.verifyEmail = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  let user = await User.findOne({
    emailVerificationCode: code,
  });
  console.log(code);
  if (!user) {
    return next(
      new AppError(400, "Invalid Verification Code", "Verify Email Error")
    );
  }
  user = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { emailVerified: true },
      $unset: { emailVerificationCode: 1 },
    },
    { new: true }
  );
  const accessToken = await user.generateToken();
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successful"
  );
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successful"
  );
});

userController.addToCart = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { productID, quantity } = req.body;

  let user = await User.findById(userId);
  user = user.toJSON();
  const item = user.cart.find((product) => product.productID.equals(productID));
  if (item) {
    user.cart = user.cart.map((product) => {
      if (!product.productID.equals(productID)) return product;
      return { ...product, quantity: product.quantity + quantity };
    });
  } else {
    user.cart = [...user.cart, { productID, quantity }];
  }
  console.log(user.cart);
  user = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { cart: user.cart },
    },
    { new: true }
  );
  return sendResponse(
    res,
    200,
    true,
    user.cart,
    null,
    "Add to cart successful"
  );
});

module.exports = userController;
