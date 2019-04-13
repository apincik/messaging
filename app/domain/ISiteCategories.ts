import {ISiteMessageCategory} from "./SiteMessageCategory";

export interface ISiteCategories
{
    getCategories(): ISiteMessageCategory[];
}