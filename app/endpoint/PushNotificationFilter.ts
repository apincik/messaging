import {IPushNotificationFilter} from "../domain/IPushNotificationFilter";
import {IEndpointUser} from "../domain/IEndpointUser";
import {IPushNotification} from "../domain/IPushNotification";

export class PushNotificationFilter implements IPushNotificationFilter
{
    apply(user: IEndpointUser, notification: IPushNotification): IPushNotification {
        // logic for push notifications...
        return notification;
    }

}