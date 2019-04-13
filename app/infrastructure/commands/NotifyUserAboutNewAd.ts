
import { INotifyUserAboutNewAd } from "./INotifyUserAboutNewAd";

export class NotifyUserAboutNewAd implements INotifyUserAboutNewAd
{
    id: number;
    constructor(id: number)
    {
        this.id = id;
    }
}