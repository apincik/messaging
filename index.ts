import { Mongo } from './app/infrastructure/mongo/Mongo';
import { Config } from "./app/config";
import {Api} from "./app/api/api";
import {Endpoint} from "./app/endpoint/endpoint";
import {SiteCategories} from "./app/endpoint/SiteCategories";
import {GetUserByUsernameAndSecretHandler} from "./app/infrastructure/queries/GetUserByUsernameAndSecretHandler";
import {GetUserByUsernameAndTokenHandler} from "./app/infrastructure/queries/GetUserByUsernameAndTokenHandler";
import {UpdateUserTokenHandler} from "./app/infrastructure/commands/UpdateUserTokenHandler";
import {GetAdHandler} from "./app/infrastructure/queries/GetAdHandler";
import {AdNotificationBuilder} from "./app/endpoint/AdNotificationBuilder";
import {UserNotificationBuilder} from "./app/endpoint/UserNotificationBuilder";
import {InstantNotificationBuilder} from "./app/endpoint/InstantNotificationBuilder";
import {PushNotificationFilter} from "./app/endpoint/PushNotificationFilter";

console.log("<Andrej Pincik>(apincik@gmail.com) - implementation part - Asynchronous processing");

var args = process.argv.slice(2);
console.log(args);

const endpointAppFunc = async function() {

    // Create Endpoint app instance
    const endpointApp = new Endpoint();

    // Create MongoDb client instance and connect
    const mongoClient = new Mongo(new Config());
    await mongoClient.connect();
    // configure
    endpointApp.siteCategories = new SiteCategories();
    endpointApp.getUserByUsernameAndToken = new GetUserByUsernameAndTokenHandler(mongoClient);
    endpointApp.getUserByUsernameAndSecret = new GetUserByUsernameAndSecretHandler(mongoClient);
    endpointApp.updateUserToken = new UpdateUserTokenHandler(mongoClient);
    endpointApp.getAd = new GetAdHandler(mongoClient);
    endpointApp.endpointEventEmitter.on('stop', async function() {
       await mongoClient.disconnect();
       console.log('Finished...');
    });

    endpointApp.adNotificationBuilder = new AdNotificationBuilder();
    endpointApp.userNotificationBuilder = new UserNotificationBuilder();
    endpointApp.instantNotificationBuilder = new InstantNotificationBuilder();

    endpointApp.endpointEventEmitter.pushNotificationFilter = new PushNotificationFilter();

    // Start Endpoint app
    await endpointApp.run();
};

if(args[0] == 'e') {
    endpointAppFunc();
}

const apiFunc = async function() {
    const api = new Api();
    await api.run();
};

if(args[0] == 'a') {
    apiFunc();
}

//test event publisher
// const eventFunc = async function() {
//     const notification: IUserNotifiedEvent = new UserNotifiedEvent('tester', '000-111-222');
//     const userNotifiedEventHandler = new UserNotifiedEventHandler(new EventPublisher(new Mongo(new Config())));
//
//     await userNotifiedEventHandler.publish(notification);
// };
//
// eventFunc();
