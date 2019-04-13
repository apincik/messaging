import {EventEmitter} from "events";
import {IEndpointUser} from "../domain/IEndpointUser";
import {IPushNotification} from "../domain/IPushNotification";
import {IPushNotificationFilter} from "../domain/IPushNotificationFilter";

export class EndpointEventEmitter extends EventEmitter
{
    pushNotificationFilter: IPushNotificationFilter;

    emitNotification(client: any, user: IEndpointUser, notification: IPushNotification)
    {
        notification = this.pushNotificationFilter.apply(user, notification);
        if(notification != null) {
            client.emit('notification', notification);
        }
    }
}