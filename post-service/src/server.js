require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const postRoutes = require('./routes/post-route');
const logger = require('./utils/logger');
const { connectRabbitMQ } = require('./utils/rabbitmq');
const errorHandler = require('./middlewares/errorHandlers');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URL = process.env.REDIS_URL;

mongoose.connect(MONGODB_URI).then(() => { 
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('Error connecting to MongoDB:', err);
});
const redisClient = new Redis(REDIS_URL);
app.use(helmet())
app.use(cors())
app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request for ${req.url}`);
    logger.info('Request Body:', req.body);
    next();
})

//routs
app.use('/api/posts',(req,res,next)=>{
    req.redisClient = redisClient;
    next();
},postRoutes);
app.use(errorHandler);

async function startServer() {
    try{
        await connectRabbitMQ();
        app.listen(PORT, () => {
            logger.info(`Post Service is running on port ${PORT}`);
        });
    
    }catch (error) {
        logger.error('Failed to connect to RabbitMQ server:', error);
        process.exit(1);
    }
}
startServer()

//unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
