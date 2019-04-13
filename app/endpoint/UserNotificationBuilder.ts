import {IPushNotification} from "../domain/IPushNotification";
import {IUserNotificationBuilder} from "../domain/IUserNotificationBuilder";
import {IUserNotification} from "../domain/IUserNotification";
import {NotificationType} from "../domain/NotificationType";

export class UserNotificationBuilder implements IUserNotificationBuilder
{
    build(notification: IUserNotification): IPushNotification {
        return {
            uuid: '',
            type: NotificationType.USER_NOTIFICATION,
            title: notification.payload.username,
            body: !notification.payload.message ? '' : notification.payload.message.substring(0, 20),
            icon: 'https://fajnaostrava.cz/wp-content/uploads/2018/12/V%C5%A0B-Technick%C3%A1-univerzita-Ostrava-nov%C3%A9-logo.png',
            image: 'https://fajnaostrava.cz/wp-content/uploads/2018/12/V%C5%A0B-Technick%C3%A1-univerzita-Ostrava-nov%C3%A9-logo.png',
            duration: 10,
            url: 'http://google.sk'
        };

    }

}