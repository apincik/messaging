import {IQueryHandler} from "../IQueryHandler";
import {IGetAd} from "./IGetAd";
import {IGetAdResult} from "./IGetAdResult";
import {Mongo} from "../mongo/mongo";

export class GetAdHandler implements IQueryHandler<IGetAd, IGetAdResult>
{
    constructor(private mongoClient: Mongo)
    {
    }

    async execute(query: IGetAd): IGetAdResult {
        const ad = await this.mongoClient.findOne('ads', {'ad_id': query.id}, {});
        if(ad == null) {
            throw Error('Ad for notification has not been found.');
        }

        return {
            ad: {
                title: ad.title,
                description: ad.description,
                price: ad.price,
                created: new Date(ad.created),
                car: {
                    vin: ad.car.vin,
                    registration_date: new Date(ad.car.registration_date),
                    kilometres: ad.car.kilometres,
                    power: ad.car.power,
                    model: {
                        name: ad.car.model.name,
                        make: {
                            name: ad.car.model.make.name
                        }
                    }
                },
                image: {
                    url: ad.image.url
                }
            }
        }
    }

}