import * as amqp from "amqplib";
import {Channel, Connection} from "amqplib/callback_api";
import {Config} from "../../config";
import {NotificationType} from "../../domain/NotificationType";
import uuidv4 from "uuid/v4";
import {MessageEmitter} from "./messageEmitter";
import {QueueHelper} from "../../domain/QueueHelper";
import {Message} from "amqplib";
import {IBaseNotification} from "../../domain/IBaseNotification";
import {IUserNotification} from "../../domain/IUserNotification";

export class Rabbitmq
{

    private config: Config;
    private connection: Connection;
    private channel: Channel;
    private isConnected: boolean = false;
    private rabbitMqConnectionUid : string;

    queueExpireTimeMilliseconds: number = 60000;
    messageExpireTimeMilliseconds: number = 3600000;
    messageEmitter: MessageEmitter = new MessageEmitter();

    constructor(config: Config)
    {
        this.config = config;
        this.rabbitMqConnectionUid = uuidv4();
    }

    async connect()
    {
        const rabbitMq = this;
        this.connection = await amqp.connect(this.config.RabbitMq.CONNECTION_STRING);
        // @ts-ignore
        this.channel = await this.connection.createChannel();
        this.isConnected = true;

        await this.channel.assertExchange('instant', 'topic', {durable: false});
        await this.channel.assertExchange('notification', 'fanout', {durable: false});
    }

    async disconnect()
    {
        try {
            //already closed
            //await this.channel.close();
            //await this.connection.close();
            this.isConnected = false;
        }
        catch (e) {
            // already closed
        }
    }

    async sendMessageToExchange(exchangeName: string, routingKey: string, data: IBaseNotification)
    {
        await this.channel.assertExchange(exchangeName, 'topic', {durable: false});
        await this.channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data)));
    }

    async sendMessageToDistributedExchange(exchangeName: string, routingKey: string, data: IBaseNotification)
    {
        await this.channel.assertExchange(exchangeName, 'fanout', {durable: false});
        await this.channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data)));
    }

    async sendMessageToQueue(queueName: string, message: IBaseNotification)
    {
        if(!this.isConnected) {
            await this.connect();
        }

        await this.channel.assertQueue(queueName, {durable: true});
        await this.channel.prefetch(1, true);
        await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    }

    async sendMessageToUser(queueName: string, data: IUserNotification)
    {
        if(!this.isConnected) {
            await this.connect();
        }

        // Expire after one hour if not consumed
        await this.channel.assertQueue(queueName, {durable: false, expires: this.queueExpireTimeMilliseconds, autoDelete: true});
        await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {expiration: this.messageExpireTimeMilliseconds});
    }

    // Consume from single queue
    async consumeMessages(queueName: string)
    {
        await this.channel.assertQueue(queueName, {durable: true});
        // @ts-ignore
        const channel = await this.connection.createChannel();
        return this.consume(queueName, false, channel);
    }

    async consumeDistributedMessages(queueName: string)
    {
        const uQueueName = queueName + '-' + this.rabbitMqConnectionUid;
        this.channel.assertQueue(uQueueName, {durable: false, autoDelete: true, expires: this.queueExpireTimeMilliseconds});
        this.channel.bindQueue(uQueueName, QueueHelper.getNotificationDistributedExchangeName(), '');
        // @ts-ignore
        const channel = await this.connection.createChannel();
        return this.consume(uQueueName, false, channel, queueName);
    }

    async consumeSiteMessages(root: string, category: string, subCategory: string)
    {
        const routingKey: string = QueueHelper.getQueueRoutingKey(root, category, subCategory);
        const queueName = QueueHelper.getCategoryQueueName() + root + category + subCategory;
        const uQueueName = queueName + '-' + this.rabbitMqConnectionUid;
        await this.channel.assertQueue(uQueueName, {durable: false, autoDelete: true, expires: this.queueExpireTimeMilliseconds});
        this.channel.bindQueue(uQueueName, QueueHelper.getInstantExchangeName(), routingKey);

        // add site consume event listener
        const rabbitMq = this;
        this.messageEmitter.on(MessageEmitter.getEventNameByQueue(queueName), function(notification) {
            rabbitMq.messageEmitter.emit(MessageEmitter.getSiteEventName(root, category, subCategory), notification);
        });

        // @ts-ignore
        const channel = await this.connection.createChannel();
        return this.consume(uQueueName, false, channel, MessageEmitter.getEventNameByQueue(queueName));  //@TODO let consume call right event
    }

    async consumeUserMessages(username: string)
    {
        const queueName: string = QueueHelper.getQueueNameByUsername(username);
        await this.channel.assertQueue(queueName, {durable: false, expires: this.queueExpireTimeMilliseconds, autoDelete: true});

        // Cleanup previous existing...
        // Case user uses some other tabs, refreshed connection...
        this.messageEmitter.removeAllListeners(MessageEmitter.getEventNameByQueue(queueName));

        const rabbitMq = this;
        this.messageEmitter.on(MessageEmitter.getEventNameByQueue(queueName), function(notification) {
            rabbitMq.messageEmitter.emit(MessageEmitter.getEventNameByUsername(username), notification);
        });

        // @ts-ignore
        const channel = await this.connection.createChannel();
        return this.consume(queueName, false, channel);
    }

    private async consume(queueName: string, isAck: boolean, channel: Channel, optionalEventName: string = '')
    {
        if(!this.isConnected) {
            await this.connect();
        }

        console.log('consuming messages... for ' + queueName);

        const rabbitMq = this;
        const eventName = optionalEventName == '' ? MessageEmitter.getEventNameByQueue(queueName) : optionalEventName;
        try {
            await channel.consume(queueName, function (msg) {

                // @TODO uncomment for testing receiving...
                console.log(" [x] Received %s", msg.content.toString());
                setTimeout(function () {
                    //console.log(" [x] Done");
                    if(isAck) {
                        channel.ack(msg);
                    }
                    rabbitMq.messageEmitter.emit(eventName, JSON.parse(msg.content.toString()));

                }, 0);
            }, {noAck: !isAck});
        }
        catch (e) {
            return false;
        }

    }

}