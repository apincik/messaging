
import {IQuery} from "./IQuery";

export interface IQueryHandler<IQuery, TResult>
{
    execute(query: IQuery): TResult;
}