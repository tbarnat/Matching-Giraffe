const Server = require('../dist/server/Server').default;

const config = {
    port: 8080,
    db: {
        uri: 'mongodb://localhost:27017',
        dbName: 'hmDev'
    }
}

let server = new Server(config)




