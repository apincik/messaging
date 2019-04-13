import {ISiteCategories} from "../domain/ISiteCategories";
import {ISiteMessageCategory} from "../domain/SiteMessageCategory";


export class SiteCategories implements ISiteCategories
{
    getCategories(): ISiteMessageCategory[] {
        return [
            {
                root: 'cars',
                category: 'bmw',
                subCategory: ''
            }
        ];
    }

}