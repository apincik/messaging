import { MongoClient } from 'mongodb';
import { Config } from '../../config';

/**
 * this.mongoClient = new Mongo({
        'ipAddress': config.ipAddress,
        'port': config.port,
        'dbName': config.dbName,
        'user': config.user,
        'password': config.password
    });
 */

export class Mongo
{
    private db: any;
    private client: any;
    private config: Config;

    constructor(config: Config)
    {
        this.db = null;
        this.client = null;
        this.config = config;
    }

    async connect()
    {
        let url = 'mongodb://' + this.config.Mongo.IP_ADDRESS + ':' + this.config.Mongo.PORT + '/' + this.config.Mongo.DB_NAME;
        if(this.config.Mongo.USER != undefined && this.config.Mongo.PASSWORD != undefined) {
            let url = 'mongodb://' + this.config.Mongo.USER + ':' + this.config.Mongo.PASSWORD + '@' + this.config.Mongo.IP_ADDRESS + ':' + this.config.Mongo.PORT + '/' + this.config.Mongo.DB_NAME;
        }

        if(this.isConnected()) {
            return this.db;
        }

        const mongo = this;
        await MongoClient.connect(url, {useNewUrlParser: true}).then((client) => {
            console.log("Connected to MongoDB");
            mongo.db = client.db(this.config.Mongo.DB_NAME);
            mongo.client = client;
            return mongo.client;
        }).catch((error) => {
            console.warn(`MongoDB connection error ${error}`);
            throw error;
        });

    };

    async disconnect()  {

        if(this.client != null && this.isConnected()) {
            await this.client.close();
        }

        console.log('Disconnected from MongoDb.');
        return true;
    };

    isConnected() {
        return this.client !== null && this.client.isConnected();
    };

    async insert(collection: string, data: object) {
        await this.db.collection(collection).insertOne(data).catch((error) => {
            console.log(`Mongo client insert error ${error}`);
            throw error;
        });
    };

    async insertMany(collection: string, data: object) {
        await this.db.collection(collection).insertMany(data).catch((error) => {
            console.log(`Mongo client insert error ${error}`);
            throw error;
        });
    };

    /**
    { field: 'value'}
    { limit: 10; skip: 0; sort: 'column'}
     */
    async findOne(collection: string, query: object, options: object) {
        return await this.db.collection(collection).findOne(query, options);
    };

    async find(collection: string, query: object, options: object) {
        return await this.db.collection(collection).find(query, options).toArray();
    };

    async deleteOne(collection: string, query: object, options: object) {
        await this.db.collection(collection).deleteOne(query);
    };

    async findOneAndUpdate(collection: string, query: object, values: object) {
        await this.db.collection(collection).findOneAndUpdate(query, {$set: values}).catch((error) => {
            throw error;
        });

        return true;
    };

    /** Update one field */
    async updateOne(collection: string, query: object, values: object, operation: string) {
        if(operation === 'push') {
            await this.db.collection(collection).updateOne(query, {$push: values}).catch((error) => {
                throw error;
            });
        } else if(operation === 'set') {
            await this.db.collection(collection).updateOne(query, {$set: values}).catch((error) => {
                throw error;
            });
        } else {
            throw "UpdateOne undefined atomic operator type for operation.";
        }
    };
}


