import {IBaseNotification} from "./IBaseNotification";
import {ISiteMessageCategory} from "./ISiteMessageCategory";

export interface IInstantNotification extends IBaseNotification
{
    site: ISiteMessageCategory
    payload: {
        message: string;
        image: string;
        title: string;
        url: string;
    }

    // rootSite: string;
    // siteCategory: string;
    // siteSubCategory: string;
}