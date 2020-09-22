const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Product = require("../models/Product");
const productController = {};

productController.getProducts = catchAsync(async (req, res, next) => {
  let { page, limit, sortBy, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const totalProducts = await Product.countDocuments({
    ...filter,
    isDeleted: false,
  });
  const totalPages = Math.ceil(totalProducts / limit);
  const offset = limit * (page - 1);

  const products = await Product.find(filter)
    .sort({ ...sortBy, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(res, 200, true, { products, totalPages }, null, "");
});

productController.getSingleProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id).populate("author");
  if (!product)
    return next(
      new AppError(404, "product not found", "Get Single product Error")
    );
  product = product.toJSON();
  return sendResponse(res, 200, true, product, null, null);
});

productController.createNewProduct = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const { brand, productName, price } = req.body;
  let { image } = req.body;
  // if (req.files) {
  //   images = req.files.map((file) => {
  //     return file.path.split("public")[1].split("\\").join("/");
  //   });
  // }

  const product = await Product.create({
    brand,
    productName,
    author,
    price,
    image,
  });

  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Create new product successful"
  );
});

productController.updateSingleProduct = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const productId = req.params.id;
  const { brand, productName, price } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: productId, author: author },
    { brand, productName, price },
    { new: true }
  );
  if (!product)
    return next(
      new AppError(
        400,
        "Product not found or User not authorized",
        "Update product Error"
      )
    );
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Update product successful"
  );
});

productController.deleteSingleProduct = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const productId = req.params.id;

  const product = await Product.findOneAndUpdate(
    { _id: productId, author: author },
    { isDeleted: true },
    { new: true }
  );
  if (!product)
    return next(
      new AppError(
        400,
        "Product not found or User not authorized",
        "Delete product Error"
      )
    );
  return sendResponse(res, 200, true, null, null, "Delete product successful");
});

module.exports = productController;
