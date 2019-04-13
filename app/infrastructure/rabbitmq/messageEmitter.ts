import {EventEmitter} from "events";

export class MessageEmitter extends EventEmitter
{
    static getEventNameByQueue(queueName: string)
    {
        return queueName + '-consumed';
    }

    static getSiteEventName(root: string, category: string, subCategory: string)
    {
        return root + category + subCategory;
    }

    static getEventNameByUsername(username: string)
    {
        return username + '-msgReceived';
    }
}