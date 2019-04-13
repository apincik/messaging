import {IAdNotificationBuilder} from "../domain/IAdNotificationBuilder";
import {IAd} from "../domain/adModel/IAd";
import {IPushNotification} from "../domain/IPushNotification";
import {NotificationType} from "../domain/NotificationType";

export class AdNotificationBuilder implements IAdNotificationBuilder
{
    build(ad: IAd): IPushNotification {
        return {
            uuid: '',
            type: NotificationType.NEW_AD,
            title: ad.title,
            body: !ad.description ? '' : ad.description.substring(0, 20),
            icon: ad.image.url,
            image: ad.image.url,
            duration: 10,
            url: 'http://google.sk'   // Custom URL
        };
    }

}