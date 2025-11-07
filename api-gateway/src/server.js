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
const {validateToken} = require('./middleware/authMiddleware');

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
console.log(process.env.MEDIA_SERVICE_URL);

app.use(ratelimit);

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/,"/api")
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
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
//setting up proxy for our post service 

app.use('/v1/posts',validateToken,proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId; //forward user id to post service
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes,proxyResData, userReq, userRes) => {
        logger.info(`Response from post service for ${userReq.method} ${userReq.url}: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}))
// setting up proxy for our media service
app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId; // forward user id

        const contentType = proxyReqOpts.headers["content-type"] 
            || proxyReqOpts.headers["Content-Type"];

        if (!contentType || !contentType.startsWith("multipart/form-data")) {
            proxyReqOpts.headers["Content-Type"] = "application/json";
        }

        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response from media service for ${userReq.method} ${userReq.url}: ${proxyRes.statusCode}`
        );
        return proxyResData;
    },
    parseReqBody: false
}));


app.use(errorHandler);
console.log(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
console.log(`Redis URL: ${process.env.REDIS_URL}`);


app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service URL: ${process.env.POST_SERVICE_URL}`);
    logger.info(`Redis URL: ${process.env.REDIS_URL}`);
    logger.info(`Media Service URL: ${process.env.MEDIA_SERVICE_URL}`);
});