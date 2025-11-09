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
const { connectRabbitMQ } = require('./utils/rabbitmq');
const{handlePostDeleted} = require('./eventHandlers/media-event-handlers');
const { consumeEvent } = require('./utils/rabbitmq');

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

async function startServer(){
    try{
        await connectRabbitMQ();

        //consume events 

        await consumeEvent('post.deleted', handlePostDeleted);


        app.listen(PORT, () => {
            logger.info(`Media Service is running on port ${PORT}`);
        });
    }catch(err){
        logger.error('Failed to connect to RabbitMQ', err);
    }
}

startServer();

//unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});




