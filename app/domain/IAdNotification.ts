import {NotificationType} from "./NotificationType";
import {IBaseNotification} from "./IBaseNotification";

export interface IAdNotification extends IBaseNotification
{
    payload: {
        id: number
    }
}