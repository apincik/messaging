import {Config} from "../config";
import {Rabbitmq} from "../infrastructure/rabbitmq/rabbitmq";
import socketIo from 'socket.io';
import uuid = require("uuid");
import {MessageEmitter} from "../infrastructure/rabbitmq/messageEmitter";
import {ISiteCategories} from "../domain/ISiteCategories";
import {ISiteMessageCategory} from "../domain/ISiteMessageCategory";
import {IQueryHandler} from "../infrastructure/IQueryHandler";
import {IGetUserByUsernameAndToken} from "../infrastructure/queries/IGetUserByUsernameAndToken";
import {IGetUserByUsernameAndTokenResult} from "../infrastructure/queries/IGetUserByUsernameAndTokenResult";
import {ICommandHandler} from "../infrastructure/ICommandHandler";
import {IUpdateUserToken} from "../infrastructure/commands/IUpdateUserToken";
import {IGetUserByUsernameAndSecret} from "../infrastructure/queries/IGetUserByUsernameAndSecret";
import {IGetUserByUsernameAndSecretResult} from "../infrastructure/queries/IGetUserByUsernameAndSecretResult";
import {EndpointEventEmitter} from "./EndpointEventEmitter";
import {IGetAdResult} from "../infrastructure/queries/IGetAdResult";
import {IGetAd} from "../infrastructure/queries/IGetAd";
import {IInstantNotification} from "../domain/IInstantNotification";
import {IUserNotification} from "../domain/IUserNotification";
import {IEndpointUser} from "../domain/IEndpointUser";
import {IAdNotification} from "../domain/IAdNotification";
import {IAdNotificationBuilder} from "../domain/IAdNotificationBuilder";
import {IPushNotification} from "../domain/IPushNotification";
import {IUserNotificationBuilder} from "../domain/IUserNotificationBuilder";
import {IInstantNotificationBuilder} from "../domain/IInstantNotificationBuilder";


export class Endpoint
{
    private config: Config = new Config();
    private rabbitMqClient: Rabbitmq;
    private messageEmitter: MessageEmitter;

    siteCategories: ISiteCategories;
    adNotificationBuilder: IAdNotificationBuilder;
    userNotificationBuilder : IUserNotificationBuilder;
    instantNotificationBuilder: IInstantNotificationBuilder;
    // inject or init as property...
    getUserByUsernameAndSecret: IQueryHandler<IGetUserByUsernameAndSecret, IGetUserByUsernameAndSecretResult>;
    getUserByUsernameAndToken: IQueryHandler<IGetUserByUsernameAndToken, IGetUserByUsernameAndTokenResult>;
    updateUserToken: ICommandHandler<IUpdateUserToken>;
    getAd: IQueryHandler<IGetAd, IGetAdResult>;

    //pushNotificationFilter: IPushNotificationFilter;
    endpointEventEmitter: EndpointEventEmitter;

    constructor()
    {
        this.rabbitMqClient = new Rabbitmq(this.config);
        this.messageEmitter = new MessageEmitter();
        this.endpointEventEmitter = new EndpointEventEmitter();
    }

    async registerUser(username: string, secret: string)
    {
        const result = await this.getUserByUsernameAndSecret.execute({username: username, secret: secret});
        const user = result.user;
        if(user != null) {
            const newToken = uuid.v4();
            const newExpireTime = new Date();
            // + 24h from actual time
            newExpireTime.setDate(newExpireTime.getDate() + 1);
            await this.updateUserToken.execute({username: username, token: newToken, expire: newExpireTime.toISOString()});
            return newToken;
        }

        return null;
    }

    async isValidToken(username: string, token: string)
    {
        const result = await this.getUserByUsernameAndToken.execute({username: username, token: token});
        if(result.user != null) {
            const actualDatetime = new Date();
            const expireTime = Date.parse(result.user.expire);
            return actualDatetime.getTime() <= expireTime;
        }

        return false;
    }

    async run()
    {
        await this.rabbitMqClient.connect();

        const endpoint = this;
        const io = socketIo();
        let connections = new Map();

        const checkClient = async (client: any) => {
            const user = connections.get(client);
            if(user.username == null) {
                return false;
            }
            if(await endpoint.isValidToken(user.username, user.token) == false) {
                client.emit('renew');
                return false;
            }

            return true;
        };

        io.on('connection', client => {

            const connectionUsername = client.handshake.query.name;
            console.log(connectionUsername);
            console.log('client connected.. ' + client.id);
            const address = client.handshake.address;

            const newUser : IEndpointUser = {
                categoryEventName: '',
                categoryListener: null,
                lastNotificationUuid: '',
                lastNotifiedTimestamp: '',
                notificationListener: null,
                token: '',
                userMessageListener: null,
                username: connectionUsername,
                address: address
            };
            connections.set(client, newUser);

            try {
                // Check for duplicate user connection from same address
                connections.forEach(function (value, key, map) {
                    // Prevent finding same record, upcoming duplicate user will have empty username
                    console.log(' CONNECTION CLIENT ID ---- ' + key.id);
                    if (value.address == address &&
                        value.username == connectionUsername &&
                        client.id != key.id) {
                        throw Error('Duplicate user connection from same address.');
                    }
                });
            }
            catch (e) {
                console.log(e);
                client.disconnect(true);
                return false;
            }

            // Call register on client
            client.emit('register');

            client.on('register', async function(data)
            {
                const userData = JSON.parse(data);
                console.log('User with ' + userData.username + ' want to register. ' + client.id);
                let token = await endpoint.registerUser(userData.username, userData.secret);
                const user = connections.get(client);

                if(token != null) {
                    console.log('registering on client side... ' + userData.username);
                    client.emit('registered', token);
                    user.username = userData.username;
                    user.token = token;
                    user.notificationListener = function(notification: IPushNotification) {
                        const user = connections.get(client);
                        // Additional check, do not send same notification more than once
                        // Disconnected client are garbage collected
                        if(user.lastNotificationUuid == null || user.lastNotificationUuid != notification.uuid) {
                            user.lastNotificationUuid = notification.uuid;
                            connections.set(client, user);
                            endpoint.endpointEventEmitter.emitNotification(client, user, notification);
                            // notification = endpoint.pushNotificationFilter.apply(user, notification);
                            // if(notification != null) {
                            //     client.emit('notification', notification);
                            // }
                        }
                    };
                    connections.set(client, user);
                    console.log('User registered.');

                    // Register base notification listener after registration
                    endpoint.messageEmitter.addListener('ads', user.notificationListener);

                } else {
                    console.log('token not released for user...');
                }
            });

            // Register user listen handler, ech user has own consumer and listener by name
            client.on('listen-userMessage', async function()
            {
                const user = connections.get(client);
                if(await checkClient(client) == false) {
                    client.emit('failed-listening-userMessage');
                    return false;
                }

                endpoint.rabbitMqClient.messageEmitter.on(MessageEmitter.getEventNameByUsername(user.username), function(notification: IUserNotification) {
                    let pushNotification: IPushNotification = endpoint.userNotificationBuilder.build(notification);
                    endpoint.endpointEventEmitter.emitNotification(client, user, pushNotification);
                    // pushNotification = endpoint.pushNotificationFilter.apply(user, pushNotification);
                    // if(notification != null) {
                    //     client.emit('notification', pushNotification);
                    // }
                });

                await endpoint.rabbitMqClient.consumeUserMessages(user.username);
                client.emit('listening-userMessage');
                console.log('user listening for PM messages...');
            });

            // Register client category listen handler, can be multiple listeners for same event
            client.on('listen-category', async function(data: string)
            {
                const site: ISiteMessageCategory = JSON.parse(data);
                const user = connections.get(client);

                //Remove listener if any exists
                if(user.categoryListener != null) {
                    console.log('remove previous category event listener... ');
                    console.log(user.categoryEventName);
                    endpoint.rabbitMqClient.messageEmitter.removeListener(user.categoryEventName, user.categoryListener);
                }

                // Update category listener
                user.categoryListener = function(notification: IInstantNotification) {
                    const user = connections.get(client);
                    // Prevent sending message multiple times
                    if(user.lastNotificationUuid == null || user.lastNotificationUuid != notification.uuid) {
                        user.lastNotificationUuid = notification.uuid;
                        connections.set(client, user);
                        let pushNotification = endpoint.instantNotificationBuilder.build(notification);
                        endpoint.endpointEventEmitter.emitNotification(client, user, pushNotification);
                        // pushNotification = endpoint.pushNotificationFilter.apply(user, pushNotification);
                        // if(notification != null) {
                        //     client.emit('notification', pushNotification);
                        // }
                    }
                };

                const categoryEventName = MessageEmitter.getSiteEventName(site.root, site.category, site.subCategory);
                user.categoryEventName = categoryEventName;
                endpoint.rabbitMqClient.messageEmitter.addListener(categoryEventName, user.categoryListener);
                connections.set(client, user);

                console.log('user listening for category...');
            });

            // Register disconnect client handler
            client.on('disconnect', () => {
                const user = connections.get(client);
                if(user == undefined) {
                    return;
                }
                // Remove user listeners
                if(typeof user.notificationListener === "function") {
                    endpoint.messageEmitter.removeListener('ads', user.notificationListener);
                }
                if(user.categoryListener != null && typeof user.categoryEventName === "function") {
                    endpoint.rabbitMqClient.messageEmitter.removeListener(user.categoryEventName, user.categoryListener);
                }

                connections.delete(client);
                console.log('Disconnected ' + client.id);
            });

        });

        // Socket listen port...
        await io.listen(8021);

        // Default listener for rabbitMq ads event, calls endpoint ads event for clients then.
        this.rabbitMqClient.messageEmitter.on('ads', async function(notification: IAdNotification) {
            try {
                const result : IGetAdResult = await endpoint.getAd.execute({id: notification.payload.id});
                const pushNotification: IPushNotification = endpoint.adNotificationBuilder.build(result.ad);
                pushNotification.uuid = notification.uuid;
                pushNotification.type = notification.type;
                console.log(notification);
                endpoint.messageEmitter.emit('ads', pushNotification);
            }
            catch (e) {
                // Exception because of bad id or missing ad.
                console.log(e);
                return false;
            }
        });

        // Consume default messages
        await this.rabbitMqClient.consumeDistributedMessages('ads');

        // Consume for categories
        this.siteCategories.getCategories().forEach(async (value) => {
           await this.rabbitMqClient.consumeSiteMessages(value.root, value.category, value.subCategory);
        });

        //TEST
        //@TODO delete
        // endpoint.rabbitMqClient.messageEmitter.on(MessageEmitter.getEventNameByUsername('student1'), function(notification) {
        //     console.log(notification);
        // });
        //
        // await endpoint.rabbitMqClient.consumeUserMessages('student1');

        // Register onStop handler
        this.onStop();
    }


    async onStop()
    {
        const endpoint = this;
        async function exitHandler(options: object, exitCode: string) {
            endpoint.enpointEventEmitter.emit('stop');
            await endpoint.rabbitMqClient.disconnect();
        }

        process.on('SIGTERM', exitHandler.bind(null,{cleanup:true}));
        process.on('SIGINT', exitHandler.bind(null, {exit:true}));
    }
}