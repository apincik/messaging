import {ICar} from "./ICar";
import {IImage} from "./IImage";

export interface IAd
{
    title: string;
    description: string;
    price: string;
    car: ICar;
    image: IImage;
    created: Date;
}