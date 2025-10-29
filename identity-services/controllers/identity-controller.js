const logger = require("../utils/loggers");
const { validateRegistration,validatelogin } = require("../utils/validation");
const User = require("../models/users");
const { generateToken } = require("../utils/generateToken");
const RefreshToken = require("../models/refreshToken");

//user registration
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit");
  try {
    //validate schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { username, email, password } = req.body;
    logger.info("Body:", req.body);
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: "User with given email or username already exists",
      });
    }
    user = await User.create({ username, email, password });
    logger.info("User registered successfully", user._id);
    const { accessToken, refreshToken } = await generateToken(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Error in user registration", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//user login
const loginUser = async (req,res)=>{
  logger.info("Login endpoint hit");
  try{
    const {error} = validatelogin(req.body);
    if(error){
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const {email, password} = req.body;
    let user = await User.findOne({email});
    logger.info("User found", user._id);
    if(!user){
      logger.warn("User not found", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    //user valid password or not
    const isValidPssword = await user.comparePassword(password);
    if(!isValidPssword){
      logger.warn("Invalid password attempt", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const {accessToken, refreshToken} = await generateToken(user);
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken,
        refreshToken,
        userId:user._id
      },
    });
   }catch(e){
    logger.error("Error in user login", e.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
//refresh token
const refreshTokenController = async (req,res)=>{
  logger.info("Refresh token endpoint hit");
  try{
    const { refreshToken } = req.body;
    if(!refreshToken){
      logger.warn("Refresh token not provided");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }
    const storedToken = await RefreshToken.findOne({token:refreshToken});

    if(!storedToken || storedToken.expiryDate < new Date()){
      logger.warn("Invalid refresh token");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const user = await User.findById(storedToken.user);
    if(!user){
      logger.warn("User not found for the given refresh token");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const {accessToken: newAccessToken, refreshToken: newRefreshToken} = await generateToken(user);
    //delete old refresh token
    await RefreshToken.deleteOne({_id:storedToken._id});
    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });

   }catch(error){
  logger.error("Error in refreshing token", error.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
}
//user logout
const logoutUser = async (req,res)=>{
  logger.info("Logout endpoint hit");
  try{
    const{refreshToken} = req.body;
    if(!refreshToken){
      logger.warn("Refresh token not provided for logout");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }
    logger.info("Deleting refresh token", refreshToken);
    await RefreshToken.deleteOne({token:refreshToken});
    logger.info("User logged out successfully");
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  }catch(error){
    logger.error("Error in user logout", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
module.exports = { registerUser , loginUser, refreshTokenController, logoutUser };
