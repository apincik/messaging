import {IAd} from "./adModel/IAd";
import {IPushNotification} from "./IPushNotification";
import {IUserNotification} from "./IUserNotification";

export interface IUserNotificationBuilder {

    build(notification: IUserNotification) : IPushNotification;
}