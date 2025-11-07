const express = require('express')
require("dotenv").config();
const cors = require("cors");
const helmet  = require("helmet")
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const ioredis = require('ioredis');
const errorHandler = require('./middlewares/errorHandlers');
const mediaRoutes = require('./routes/media-route');
const PORT = process.env.PORT || 3003;



const app = express();
app.use(helmet())
app.use(cors())
app.use(express.json());
app.use(errorHandler);

app.use((req,res,next) => {
    logger.info(`${req.method} ${req.url}`);
    logger.info("Body:", req.body);
    next();
});

app.use('/api/media', mediaRoutes);
mongoose.connect(process.env.MONGODB_URI).then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
}); 
const redisClient = new ioredis(process.env.REDIS_URL);

app.listen(PORT, () => {
    logger.info(`Media Service is running on port ${PORT}`);
});

//unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});




