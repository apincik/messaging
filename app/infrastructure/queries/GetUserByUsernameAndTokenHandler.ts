import {IGetUserByUsernameAndToken} from "./IGetUserByUsernameAndToken";
import {IQueryHandler} from "../IQueryHandler";
import {IGetUserByUsernameAndTokenResult} from "./IGetUserByUsernameAndTokenResult";
import {Mongo} from "../mongo/mongo";

export class GetUserByUsernameAndTokenHandler implements IQueryHandler<IGetUserByUsernameAndToken, IGetUserByUsernameAndTokenResult> {

    constructor(private mongoClient: Mongo) {}

    async execute(query: IGetUserByUsernameAndToken): IGetUserByUsernameAndTokenResult {
        const user = await this.mongoClient.findOne('users', {'username': query.username, 'token': query.token}, {});
        return user == null ? null: {
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