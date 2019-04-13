
import {ICommandHandler} from "../ICommandHandler";
import {INotifyUserAboutNewAd} from "./INotifyUserAboutNewAd";
import {Rabbitmq} from "../rabbitmq/rabbitmq";
import {NotificationType} from "../../domain/NotificationType";
import uuidv4 from "uuid/v4";
import {QueueHelper} from "../../domain/QueueHelper";
import {IAdNotification} from "../../domain/IAdNotification";

export class NotifyUserAboutNewAdHandler implements ICommandHandler<INotifyUserAboutNewAd>
{
    rabbitMq: Rabbitmq;

    constructor(rabbitmq: Rabbitmq)
    {
        this.rabbitMq = rabbitmq;
    }

    async execute(command: INotifyUserAboutNewAd)
    {
        const notification: IAdNotification = {
            type: NotificationType.NEW_AD,
            uuid: uuidv4(),
            site: {},
            payload: {id: command.id}

        };
        await this.rabbitMq.sendMessageToDistributedExchange(QueueHelper.getNotificationDistributedExchangeName(), '', notification);
    }
}