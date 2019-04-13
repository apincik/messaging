
export interface IEndpointUser
{
    username: string;
    token: string;
    lastNotifiedTimestamp: string;
    notificationListener: any;
    userMessageListener: any;
    categoryListener: any;
    categoryEventName: string;
    lastNotificationUuid: string;
    address: string;
}