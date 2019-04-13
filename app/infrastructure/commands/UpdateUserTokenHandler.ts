
import {ICommandHandler} from "../ICommandHandler";
import {IUpdateUserToken} from "./IUpdateUserToken";
import {Mongo} from "../mongo/mongo";

export class UpdateUserTokenHandler implements ICommandHandler<IUpdateUserToken>
{
    constructor(private mongoClient: Mongo)
    {
    }

    async execute(command: IUpdateUserToken)
    {
        await this.mongoClient.findOneAndUpdate('users', {'username': command.username}, {'token': command.token, expire: command.expire});
    }
}