const path = require('path')
const DevDBserver = require('../dist/server/Server').default;

const config = {
    port: 8080,
    path: __dirname,
    db: {
        uri: 'mongodb://localhost:27017',
        dbName: 'hmDev'
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

startServer = new DevDBserver(config)

exports.startServer = startServer