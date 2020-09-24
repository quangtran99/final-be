const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const transactionController = {};

transactionController.createOrder = catchAsync(async (req, res, next) => {
  let { name, email, address } = req.body;
  const userId = req.userId;
  let user = await User.findById(userId).populate(
    "cart.productID",
    "productName price brand"
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
  let totalPrice = 0;

  for (let i = 0; i < user.cart.length; i++) {
    totalPrice += user.cart[i].quantity * user.cart[i].productID.price;
  }

  const transaction = await Transaction.create({
    user: user._id,
    products: user.cart,
    totalPrice,
    shipping: {
      fullName: name,
      address: address,
      email: email,
    },
  });

  await User.findByIdAndUpdate(userId, {
    $set: { cart: [] },
  });

  return sendResponse(
    res,
    200,
    true,
    transaction,
    null,
    "Create Order successful"
  );
});

transactionController.getOrder = catchAsync(async (req, res, next) => {
  let { page, limit, sortBy, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const totalOrders = await Transaction.countDocuments({
    ...filter,
  });
  const totalPages = Math.ceil(totalOrders / limit);
  const offset = limit * (page - 1);

  const orders = await Transaction.find(filter)
    .sort({ ...sortBy, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(res, 200, true, { orders, totalPages }, null, "");
});

transactionController.updateStatus = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Transaction.findOneAndUpdate(
    { _id: orderId, status: "Pending" },
    { $set: { status: "Done" } },
    { new: true }
  );
  if (!order)
    return next(
      new AppError(
        400,
        "Order not found or User not authorized",
        "Update order Error"
      )
    );
  return sendResponse(res, 200, true, order, null, "Update order successful");
});

module.exports = transactionController;
