import {IPushNotification} from "../domain/IPushNotification";
import {IUserNotificationBuilder} from "../domain/IUserNotificationBuilder";
import {IUserNotification} from "../domain/IUserNotification";
import {NotificationType} from "../domain/NotificationType";
import {IInstantNotificationBuilder} from "../domain/IInstantNotificationBuilder";
import {IInstantNotification} from "../domain/IInstantNotification";

export class InstantNotificationBuilder implements IInstantNotificationBuilder
{
    build(notification: IInstantNotification): IPushNotification {
        return {
            uuid: '',
            type: NotificationType.USER_NOTIFICATION,
            title: notification.payload.title,
            body: !notification.payload.message ? '' : notification.payload.message.substring(0, 20),
            icon: notification.payload.image,
            image: notification.payload.image,
            duration: 5,
            url: 'http://google.sk'
        };

    }

}