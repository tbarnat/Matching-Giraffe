const path = require('path')
const Server = require('../dist/server/Server').default;

const config = {
    port: 8080,
    path: __dirname,
    db: {
        uri: 'mongodb://localhost:27017',
        dbName: 'hmProd' //dump from remote
    },
    logger: {
      name: 'hrsmchr',
      level: 'debug',
      safe: true,
      filename: 'hm.log',
      pathLog: path.join(__dirname,'../tmp/logs'),
      rotateInterval: '1d',
      rotateMaxFiles: 7
    }
}

startServer = new Server(config)

exports.startServer = startServer