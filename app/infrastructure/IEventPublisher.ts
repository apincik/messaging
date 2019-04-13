import {INotification} from "./INotification";

export interface IEventPublisher
{
    publish(notification: INotification): void;
}