import {IAd} from "./adModel/IAd";
import {IPushNotification} from "./IPushNotification";

export interface IAdNotificationBuilder {

    build(ad: IAd) : IPushNotification;
}