import {IBaseNotification} from "./IBaseNotification";
import {ISiteMessageCategory} from "./ISiteMessageCategory";

export interface IUserNotification extends IBaseNotification
{
    payload: {
        username: string;
        message: string;
    }
}