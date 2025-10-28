const logger = require("../utils/loggers");
const { validateRegistration } = require("../utils/validation");
const User = require("../models/users");
const { generateToken } = require("../utils/generateToken");

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
    if(!user){
      logger.warn("User not found", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    //user valid password or not
    const isValidPssword = await User.comparePassword(password);
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

//user logout

module.exports = { registerUser , loginUser };
