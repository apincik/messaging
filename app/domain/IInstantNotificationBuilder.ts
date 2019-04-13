import {IPushNotification} from "./IPushNotification";
import {IInstantNotification} from "./IInstantNotification";

export interface IInstantNotificationBuilder
{
    build(notification: IInstantNotification) : IPushNotification;
}