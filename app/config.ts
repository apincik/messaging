
export class Config
{
    Mongo: object;
    RabbitMq: object;
    Api: object;

    constructor()
    {
        this.Mongo = {
          IP_ADDRESS: '127.0.0.1',
          PORT: '27017',
          DB_NAME: 'diplo',
          USER: '',
          PASSWORD: ''
        };

        this.RabbitMq = {
            CONNECTION_STRING: 'amqp://localhost'
        };

        this.Api = {
            LISTEN_PORT: '3000'
        };
    }
}
