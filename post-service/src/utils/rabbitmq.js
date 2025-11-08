const amqp = require('amqplib');
const logger = require('./logger');


let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_event';

async function connectRabbitMQ() {

    try{
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME,'topic',{ durable: true });
        logger.info('Connected to RabbitMQ successfully');
        return { connection, channel };
    }catch (error) {
        logger.error('Failed to connect to RabbitMQ', { error });
        throw error;
    }
}

module.exports = { connectRabbitMQ };