const {
    AppError,
    catchAsync,
    sendResponse,
  } = require("../helpers/utils.helper");
  const User = require("../models/User");
  const bcrypt = require("bcryptjs");
  const axios = require("axios");
  const authController = {};

  authController.loginWithEmail = catchAsync( async(req,res,next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }, "+password");
    if (!user)
      return next(new AppError(400, "Invalid credentials", "Login Error"));
  
    if (!user.emailVerified) {
      return next(new AppError(406, "Please verify your email", "Login Error"));
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError(400, "Wrong password", "Login Error"));
  
    accessToken = await user.generateToken();
    return sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Login successful"
    );
  });

  authController.loginWithFacebook = async (req, res, next) => {
    try {
      const accessToken = req.params.facebookToken;
      const responseFb = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}
        `);
      console.log(responseFb);
   // {name, email} = responseFb.data
      let user = await User.findOne({ email: responseFb.data.email });
      if (!user) {
        user = await User.create({
          name: responseFb.data.name,
          email: responseFb.data.email
        });
      } 
  
      
  
      dbAccessToken = await user.generateToken();
      return sendResponse(
        res,
        200,
        true,
        { user, accessToken: dbAccessToken },
        null,
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  };
  
  authController.loginWithGoogle = async (req, res, next) => {
    try {
      const accessToken = req.params.googleToken;
      const responseGg = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}
        `);
      console.log(responseGg);
   // {name, email} = responseGg.data
      let user = await User.findOne({ email: responseGg.data.email });
      if (!user) {
        user = await User.create({
          name: responseGg.data.name,
          email: responseGg.data.email
        });
      } 
  
      
  
      dbAccessToken = await user.generateToken();
      return sendResponse(
        res,
        200,
        true,
        { user, accessToken: dbAccessToken },
        null,
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  };

  
module.exports = authController;