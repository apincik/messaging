import {IUserNotifiedEvent} from "./IUserNotifiedEvent";

export class UserNotifiedEvent implements IUserNotifiedEvent
{
    event_name: string = 'USER_NOTIFIED';
    data: object = {};
    username: string;
    uuid: string;
    constructor(username: string, uuid: string)
    {
        this.username = username;
        this.uuid = uuid;
    }
}