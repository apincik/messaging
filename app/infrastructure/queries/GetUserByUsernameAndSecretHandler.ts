import {IGetUserByUsernameAndToken} from "./IGetUserByUsernameAndToken";
import {IQueryHandler} from "../IQueryHandler";
import {Mongo} from "../mongo/mongo";
import {IGetUserByUsernameAndSecret} from "./IGetUserByUsernameAndSecret";
import {IGetUserByUsernameAndSecretResult} from "./IGetUserByUsernameAndSecretResult";

export class GetUserByUsernameAndSecretHandler implements IQueryHandler<IGetUserByUsernameAndSecret, IGetUserByUsernameAndSecretResult> {

    constructor(private mongoClient: Mongo) {}

    async execute(query: IGetUserByUsernameAndSecret): IGetUserByUsernameAndSecretResult {
        const user = await this.mongoClient.findOne('users', {'username': query.username, 'secret': query.secret}, {});
        return user == null ? null : {
            user: {
                username: user.username,
                email: user.email,
                expire: user.expire,
                token: user.token,
                secret: user.secret
            }
        }
    }

}