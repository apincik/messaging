
import {ICommandHandler} from "../ICommandHandler";
import {Rabbitmq} from "../rabbitmq/rabbitmq";
import {INotifyUser} from "./INotifyUser";
import {NotificationType} from "../../domain/NotificationType";
import uuidv4 from "uuid/v4";
import {EventPublisher} from "../EventPublisher";
import {Mongo} from "../mongo/mongo";
import {IEventPublisher} from "../IEventPublisher";
import {UserNotifiedEventHandler} from "../events/UserNotifiedEventHandler";
import {IUserNotifiedEvent} from "../events/IUserNotifiedEvent";
import {UserNotifiedEvent} from "../events/UserNotifiedEvent";
import {QueueHelper} from "../../domain/QueueHelper";
import {IUserNotification} from "../../domain/IUserNotification";

export class NotifyUserHandler implements ICommandHandler<INotifyUser>
{
    rabbitMq: Rabbitmq;
    userNotifiedEventHandler: IEventPublisher;

    constructor(rabbitmq: Rabbitmq, mongo: Mongo)
    {
        this.rabbitMq = rabbitmq;
        this.userNotifiedEventHandler = new UserNotifiedEventHandler(new EventPublisher(mongo));
    }

    async execute(command: INotifyUser)
    {
        const queueName: string = QueueHelper.getQueueNameByUsername(command.username);
        const uuid = uuidv4();
        const data: IUserNotification = {
            type: NotificationType.USER_NOTIFICATION,
            uuid: uuid,
            site: {},
            payload: {
                username: command.username,
                message: command.message
            }
        };

        await this.rabbitMq.sendMessageToUser(queueName, data);
        const notification: IUserNotifiedEvent = new UserNotifiedEvent(command.username, uuid);
        this.userNotifiedEventHandler.publish(notification);
    }
}