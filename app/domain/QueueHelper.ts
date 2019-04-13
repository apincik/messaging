
export class QueueHelper
{
    static getQueueNameByUsername(username: string)
    {
        return 'user_' + username;
    }

    static getCategoryQueueName()
    {
        return 'category';
    }

    static getInstantExchangeName()
    {
        return 'instant';
    }

    static getNotificationDistributedExchangeName()
    {
        return 'notification';
    }

    static getQueueRoutingKey(root: string, category: string, subCategory: string)
    {
        let routingKey = '';
        if(!root && !category && !subCategory) {
            routingKey = '*';
        } else {
            if(!root) {
                routingKey += '*';
            } else {
                routingKey += root;
            }
            if(!category) {
                routingKey += '.*';
            } else {
                routingKey += '.' + category;
            }
            if(!subCategory) {
                routingKey += '.*';
            } else {
                routingKey += '.' + subCategory;
            }
        }

        return routingKey;
    }

}