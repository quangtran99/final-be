const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const { emailHelper } = require("../helpers/email.helper");
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

userController.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const allows = ["name", "password", "avatarUrl"];
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(404, "Account not found", "Update Profile Error"));
  }

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update Profile successfully"
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
      // $unset: { emailVerificationCode: 1 },
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
  const user = await User.findById(userId).populate("cart.productID");
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
  ).populate("cart.productID");

  return sendResponse(
    res,
    200,
    true,
    user.cart,
    null,
    "Add to cart successful"
  );
});

userController.deleteItem = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const productID = req.params.id;

  let user = await User.findById(userId);

  user = user.toJSON();
  user.cart = user.cart.filter(
    (product) => !product.productID.equals(productID)
  );

  console.log(user.cart);
  user = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { cart: user.cart },
    },
    { new: true }
  );

  return sendResponse(res, 200, true, null, null, "Remove item successful");
});

userController.updateQuantity = catchAsync(async (req, res, next) => {
  let cart = req.body;
  const userId = req.userId;

  cart = cart.map((product) => ({
    ...product,
    productID: product.productID._id,
  }));
  console.log(cart);
  // let user = await User.findById(userId);
  // user = user.toJSON();
  // const item = user.cart.find((product) => product._id.equals(cart._id));
  // // if (item) {
  // //   user.cart = user.cart.map((product) => {
  // //     console.log("product", product);
  // //     if (product._id.equals(cart._id)) return product;
  // //     return { ...product, quantity: product.quantity };
  // //   });
  // // }
  // // console.log(user.cart);
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: { cart: cart },
    },
    { new: true }
  );
  if (!user)
    return next(new AppError(400, "Update cart failed", "Update Cart Error"));

  return sendResponse(res, 200, true, null, null, "Update quantity successful");
});

module.exports = userController;
