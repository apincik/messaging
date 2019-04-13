import {INotification} from "../INotification";

export interface IUserNotifiedEvent extends INotification
{
    username: string;
    uuid: string;
}