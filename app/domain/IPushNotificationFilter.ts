import {IEndpointUser} from "./IEndpointUser";
import {IPushNotification} from "./IPushNotification";

export interface IPushNotificationFilter {
    apply(user: IEndpointUser, notification: IPushNotification) : IPushNotification;
}