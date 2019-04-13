import {NotificationType} from "./NotificationType";

export interface IBaseNotification
{
    type: NotificationType;
    uuid: string;
    site: object;
    payload: object;
}