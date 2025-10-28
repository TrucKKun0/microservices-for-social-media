require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const logger = require('./utils/loggers');
const proxy = require('express-http-proxy');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.info("Body:", req.body);
  next();
});

//rate limiting 
const ratelimit =  rateLimit({
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

app.use(ratelimit);

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/,"/api")
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error("Proxy error:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error in proxy."
        });
    }
    }
//setting up proxy for our identity service 
app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json"
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes,proxyResData, userReq, userRes) => {
        logger.info(`Response from identity service for ${userReq.method} ${userReq.url}: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}));

app.use(errorHandler);
console.log(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
console.log(`Redis URL: ${process.env.REDIS_URL}`);


app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Redis URL: ${process.env.REDIS_URL}`);
});