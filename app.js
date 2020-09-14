var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors")
const mongoose = require('mongoose')
const mongoURI = process.env.MONGODB_URI
// const passport = require("passport");
// require("./helpers/passport");

const multer = require("multer");
const upload = multer();

var indexRouter = require('./routes/index');
const utilsHelper = require("./helpers/utils.helper");
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* DB Connections */
mongoose
  .connect(mongoURI, {
    // some options to deal with deprecated warning
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Mongoose connected to ${mongoURI}`))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


/* Initialize Routes */
app.use("/api", indexRouter);

// catch 404 and forard to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.statusCode = 404;
  next(err);
});

/* Initialize Error Handling */
app.use((err, req, res, next) => {
  console.log("ERROR", err.message);
  return utilsHelper.sendResponse(
    res,
    err.statusCode ? err.statusCode : 500,
    false,
    null,
    [{ message: err.message }],
    null
  );
});


module.exports = app;
