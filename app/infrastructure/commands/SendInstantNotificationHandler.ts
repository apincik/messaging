
import {ICommandHandler} from "../ICommandHandler";
import {Rabbitmq} from "../rabbitmq/rabbitmq";
import {ISendInstantNotification} from "./ISendInstantNotification";
import {NotificationType} from "../../domain/NotificationType";
import uuidv4 from "uuid/v4";
import {QueueHelper} from "../../domain/QueueHelper";

export class SendInstantNotificationHandler implements ICommandHandler<ISendInstantNotification>
{
    rabbitMq: Rabbitmq;

    constructor(rabbitmq: Rabbitmq)
    {
        this.rabbitMq = rabbitmq;
    }

    async execute(command: ISendInstantNotification)
    {
        command.instantNotification.uuid = uuidv4();
        let routingKey = QueueHelper.getQueueRoutingKey(command.instantNotification.site.root, command.instantNotification.site.category, command.instantNotification.site.subCategory);
        await this.rabbitMq.sendMessageToExchange(QueueHelper.getInstantExchangeName(), routingKey, command.instantNotification);
    }
}