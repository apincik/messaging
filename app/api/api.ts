import {Config} from "../config";
import {Rabbitmq} from "../infrastructure/rabbitmq/rabbitmq";
import express from "express";
import {ICommandHandler} from "../infrastructure/ICommandHandler";
import {NotifyUserAboutNewAdHandler} from "../infrastructure/commands/NotifyUserAboutNewAdHandler";
import {INotifyUserAboutNewAd} from "../infrastructure/commands/INotifyUserAboutNewAd";
import {NotifyUserAboutNewAd} from "../infrastructure/commands/NotifyUserAboutNewAd";
import {INotifyUser} from "../infrastructure/commands/INotifyUser";
import {NotifyUserHandler} from "../infrastructure/commands/NotifyUserHandler";
import {NotifyUser} from "../infrastructure/commands/NotifyUser";
import {ISendInstantNotification} from "../infrastructure/commands/ISendInstantNotification";
import {SendInstantNotificationHandler} from "../infrastructure/commands/SendInstantNotificationHandler";
import {SendInstantNotification} from "../infrastructure/commands/SendInstantNotification";
import {Mongo} from "../infrastructure/mongo/mongo";

export class Api
{
    private config: Config = new Config();
    private rabbitMqClient: Rabbitmq;
    private mongoDb: Mongo;
    private app: any;

    constructor()
    {
        this.rabbitMqClient = new Rabbitmq(this.config);
        this.mongoDb = new Mongo(this.config);
        this.app = express();
    }

    async run()
    {
        await this.rabbitMqClient.connect();
        console.log('Connected to RabbitMq.');

        // ------TEST ROUTES------

        this.app.get('/test/ad', (req: any, res: any) => {
            let handler: ICommandHandler<INotifyUserAboutNewAd> = new NotifyUserAboutNewAdHandler(this.rabbitMqClient);
            let notification: INotifyUserAboutNewAd = new NotifyUserAboutNewAd(1);
            handler.execute(notification);
            res.sendStatus(200);
        });

        this.app.get('/test/user', (req: any, res: any) => {
            let handler: ICommandHandler<INotifyUser> = new NotifyUserHandler(this.rabbitMqClient, this.mongoDb);
            let notification: INotifyUser = new NotifyUser('student1', 'ahoj tester');
            handler.execute(notification);
            res.sendStatus(200);
        });


        this.app.get('/test/instant', (req: any, res: any) => {
            let handler: ICommandHandler<ISendInstantNotification> = new SendInstantNotificationHandler(this.rabbitMqClient);
            let notification: ISendInstantNotification = new SendInstantNotification(
                'test title',
                'test message',
                'https://media.wired.com/photos/5cadec1fb75f9b23c6466d74/master/w_582,c_limit/blackhole.jpg',
                'https://www.google.sk',
                'cars',
                'bmw',
                ''
            );

            handler.execute(notification);
            res.sendStatus(200);
        });

        /// ------END TEST------

        this.app.post('/notification/ad/', (req: any, res: any) => {
            let handler: ICommandHandler<INotifyUserAboutNewAd> = new NotifyUserAboutNewAdHandler(this.rabbitMqClient);
            let notification: INotifyUserAboutNewAd = new NotifyUserAboutNewAd(req.body.id);
            handler.execute(notification);
            res.sendStatus(200);
        });

        this.app.post('/notification/user/', (req: any, res: any) => {
            let handler: ICommandHandler<INotifyUser> = new NotifyUserHandler(this.rabbitMqClient, this.mongoDb);
            let notification: INotifyUser = new NotifyUser(req.body.username, req.body.message);
            handler.execute(notification);
            res.sendStatus(200);
        });

        this.app.post('/notification/', (req: any, res: any) => {
            let handler: ICommandHandler<ISendInstantNotification> = new SendInstantNotificationHandler(this.rabbitMqClient);
            let notification: ISendInstantNotification = new SendInstantNotification(
                req.body.title,
                req.body.message,
                req.body.image,
                req.body.url,
                req.body.rootSite,
                req.body.siteCategory,
                req.body.siteSubCategory
            );

            handler.execute(notification);
            res.sendStatus(200);
        });

        this.app.listen(this.config.Api.LISTEN_PORT, () => console.log(`API listening on port ${this.config.Api.LISTEN_PORT}!`));

        // Register onStop handler
        this.onStop();
    }

    async onStop()
    {
        const endpoint = this;
        async function exitHandler(options: object, exitCode: string) {
            await endpoint.rabbitMqClient.disconnect();
        }

        process.on('SIGTERM', exitHandler.bind(null,{cleanup:true}));
        process.on('SIGINT', exitHandler.bind(null, {exit:true}));
    }

}