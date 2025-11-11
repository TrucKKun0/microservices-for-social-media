require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandlers');
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const searchRoutes = require('./routes/searchRouter');
const { handlePostCreated } = require('./eventHandlers/search-event-handlers');
const app = express();
const PORT = process.env.PORT || 3004
//const Redis = require('ioredis');


// const redisClient = new Redis(process.env.REDIS_URL);




mongoose.connect(process.env.MONGODB_URI).then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
});

app.use(helmet())
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});
app.use('/api/search', searchRoutes);
app.use(errorHandler);

async function startServer() {
    try{
        await connectRabbitMQ();
        await consumeEvent('post.created',handlePostCreated);
        app.listen(PORT, () => {
            logger.info(`Search Service running on port ${PORT}`);
        });
    }catch(error){
        logger.error("Error starting  search server", error);
    }
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});