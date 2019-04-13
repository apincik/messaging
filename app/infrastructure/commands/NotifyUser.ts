
import { INotifyUserAboutNewAd } from "./INotifyUserAboutNewAd";
import {INotifyUser} from "./INotifyUser";

export class NotifyUser implements INotifyUser
{
    username: string;
    message: string;

    constructor(username: string, message: string)
    {
        this.username = username;
        this.message = message;
    }
}