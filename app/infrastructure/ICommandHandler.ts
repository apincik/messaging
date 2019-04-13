import {ICommand} from "./ICommand";

export interface ICommandHandler<ICommand>
{
    execute(command: ICommand): void;
}