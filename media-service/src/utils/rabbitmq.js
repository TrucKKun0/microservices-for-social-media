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
async function publishEvent(routingKey, message){
    if(!channel){
        await connectRabbitMQ();
    }
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Event published to RabbitMQ`, { routingKey, message });
}
async function consumeEvent(routingKey, callback){
    if(!channel){
        await connectRabbitMQ();
    }
    const q = await channel.assertQueue("",{exclusive:true});
    await channel.bindQueue(q.queue,EXCHANGE_NAME,routingKey);
    channel.consume(q.queue,(msg)=>{
        if(msg!==null){
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });
    logger.info(`Event consumed from RabbitMQ`, { routingKey });
}

module.exports = { connectRabbitMQ, publishEvent, consumeEvent };