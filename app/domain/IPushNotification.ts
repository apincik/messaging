import {NotificationType} from "./NotificationType";

export interface IPushNotification
{
    uuid: string;
    type: NotificationType;
    title: string;
    icon: string;
    image: string;
    body: string;
    url: string;
    duration: number;
}
