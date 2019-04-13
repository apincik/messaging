import {Mongo} from "./mongo/mongo";
import {IEventPublisher} from "./IEventPublisher";
import {INotification} from "./INotification";

export class EventPublisher implements IEventPublisher
{
    private mongo: Mongo;
    constructor(mongo: Mongo)
    {
        this.mongo = mongo;
    }

    async publish(notification: INotification)
    {
        await this.mongo.connect();

        const data = {
            'event_name': notification.event_name,
            'guid': notification.uuid,
            'payload': notification.data
        };

        await this.mongo.insert('log', data);
    }
}