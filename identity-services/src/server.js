require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("../utils/loggers");
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');  
const routes = require("../routes/identity-service");
const errorHandler = require("../middlewares/errorHandlers");
const PORT = process.env.PORT || 5000;

//connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("Error connecting to MongoDB", error.message);
  });

//redis client for rate limiting
const redisClient = new Redis(process.env.REDIS_URL);

//midllewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.info("Body:", req.body);
  next();
});
//DDOS protection and rate limiting
const ratelimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefex: "middleware",
  points: 100, //100 requests
  duration: 60, //per 60 seconds
});

app.use((req, res, next) => {
  ratelimiter
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.warn("Rate limit exceeded for IP:", req.ip);
      res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    });
});
//IP based rate limiting for sensitive endpoints

const sensitiveEndpoints = rateLimit({
    windowMs:15*60*1000, //15 minutes
    max:20, //limit each IP to 20 requests per windowMs
    standardHeaders:true,
    legacyHeaders:false,
    handeler : (req,res) =>{
        logger.warn(`IP rate limit exceeded for ${req.ip}`);
        res.status(429).json({
            success : false,
            message : "Too many requests from this IP, please try again later."
        })
    },
    store: new RedisStore({
        sendCommand : (...args) => redisClient.call(...args)
    })
})

// apply sensitive endpoint rate limiting to registration and login routes
app.use('/api/auth/register',sensitiveEndpoints);

//routes
app.use('/api/auth',routes)

//global error handler
app.use(errorHandler);

app.listen(PORT,()=>{
logger.info(`Identity Service running on port ${PORT}`);
})

process.on('unhandledRejection',(reason,promise)=>{
    logger.error('Unhandled Rejection at:',promise,'reason:',reason);
})