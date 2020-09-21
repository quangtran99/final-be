const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const transactionController = {};

transactionController.createOrder = catchAsync(async (req, res, next) => {
  let { name, email, address, totalPrice } = req.body;
  const userId = req.userId;
  const user = await User.findById(userId).populate(
    "cart.productID",
    "productName price"
  );
  if (!user)
    return next(new AppError(400, "User not found", "Create Order Error"));
  console.log({
    cart: user.cart,
    product: user.cart[0].productID,
    name,
    email,
    address,
  });

  const transaction = await Transaction.create({
    user: user._id,
    products: user.cart,
    totalPrice: totalPrice,
    shipping: {
      fullName: name,
      address: address,
    },
  });

  await User.findByIdAndUpdate(userId, {
    $set: { cart: [] },
  });

  return sendResponse(res, 200, true, null, null, "Create Order successful");
});
module.exports = transactionController;
