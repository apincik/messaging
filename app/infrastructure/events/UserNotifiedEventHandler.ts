import {IEventPublisher} from "../IEventPublisher";
import {EventPublisher} from "../EventPublisher";
import {IUserNotifiedEvent} from "./IUserNotifiedEvent";

export class UserNotifiedEventHandler implements IEventPublisher
{
    private eventPublisher: EventPublisher;

    constructor(eventPublisher: EventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    async publish(notification: IUserNotifiedEvent)
    {
        await this.eventPublisher.publish(notification);
    }
}