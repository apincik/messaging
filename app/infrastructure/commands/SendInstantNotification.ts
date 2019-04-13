import {ISendInstantNotification} from "./ISendInstantNotification";
import {IInstantNotification} from "../../domain/IInstantNotification";
import {NotificationType} from "../../domain/NotificationType";

export class SendInstantNotification implements ISendInstantNotification
{
    instantNotification: IInstantNotification;

    constructor(
        title: string,
        message: string,
        image: string,
        url: string,
        rootSite: string,
        siteCategory: string,
        siteSubcategory: string)
    {

        this.instantNotification = {
            type: NotificationType.INSTANT_NOTIFICATION,
            uuid: '',
            site: {
                root: rootSite,
                category: siteCategory,
                subCategory: siteSubcategory
            },
            payload: {
                title: title,
                message: message,
                image: image,
                url: url
            }
        };
    }
}