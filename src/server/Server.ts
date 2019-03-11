import http = require('http')
import fs = require('fs')
import WebSocket = require('ws')
import {Database, DbConfig} from "./Database";
import Dispatch from "./Dispatch";
import {Collection, IBackendMsg, IFrontendMsg, ILoginAttempt} from "./DataModel";
import {Logger, LoggerConfig} from "./utils/Logger";

const crypto = require('crypto');

//const uuidv4 = require('uuid/v4');

interface IServerConfig {
  port: number
  path: string
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent',
  db: DbConfig,
  logger: LoggerConfig
}

export default class Server {

  protected log: Logger
  protected db: Database
  private httpServer: http.Server;
  private wss: WebSocket.Server;
  private wsClients: WebSocket[] = []; //{client: WebSocket, sessionID: string}[] = []
  private dispatch: Dispatch

  private readonly actionPrefixes = ['new', 'edit', 'remove', 'list', 'haveAny']
  private readonly actionSuffixes = ['horse', 'kid', 'trainer']

  constructor(config: IServerConfig) {

    console.log('-> Started <-')
    if (!fs.existsSync(config.logger.pathLog)) {
      fs.mkdirSync(config.logger.pathLog)
    }
    this.log = new Logger(config.logger)

    this.initDb(config).then(() => {
      this.dispatch = new Dispatch(this.db, this.log)
      this.httpServer = http.createServer();
      this.wss = new WebSocket.Server({server: this.httpServer});
      this.wss.on('connection', this.onWssServerConnection.bind(this));
      this.httpServer.listen(config.port)
      this.log.info('Server started')
    }).catch((err) => {
      this.log.error('Db init failed', err)
    })
  }

  private async initDb(config: IServerConfig) {
    this.db = new Database(config.db, this.log);
    await this.db.init(true)
  }

  public async onWssServerConnection(ws: WebSocket, request: http.IncomingMessage) {

    let userName: string | undefined
    this.wsClients.push(ws);
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    this.log.info(`client (${ip}) connected`);

    ws.on('close', () => {
      this.log.info(`client (${ip}) disconnected. Still active: ${this.wsClients.length - 1} client(s).`);
      const idx = this.wsClients.indexOf(ws);
      if (idx != -1) {
        this.wsClients.splice(idx, 1)
      }
    });

    ws.on('message', async (msg) => {
      try {
        if (msg === '"ping"') {
          ws.send('"pong"')
          return
        }

        let request = JSON.parse(msg.toString());
        request = request as IFrontendMsg
        if (userName) {
          this.log.debug(`message received: ${msg} \n`);
          try{
            await this.onClientMessageReceived(ws, userName, request)
          }catch (err) {
            this.log.error(err, 'onClientMessageReceived')
          }
        } else if (request.action == 'login') {
          this.log.info(`message received: ${msg} \n`);
          //request: {userName:string,password:string}
          let reply: IBackendMsg = {success: false, data: 'Invalid login or password'}
          let loginInfo = (await this.db.findOne('users', {userName: request.data.userName}) as ILoginAttempt)
          if (loginInfo) {
            let hash = crypto.createHash('md5').update(request.data.password).digest('hex');
            if (loginInfo.password === hash) {
              userName = loginInfo.userName
              this.dispatch.registerVisit(userName)
              this.log.info(`Authenticated connection for user: \'${userName}\', ip: ${ip}`);
              reply = {success: true, data: {}}
            }
          }
          this.sendMsg(ws, request, reply)
        }
      } catch (error) {
        this.log.warn(error, 'Incorrect data type')
      }
    });
  }

  public async onClientMessageReceived(ws: WebSocket, userName: string, request: IFrontendMsg) {
    let reply: IBackendMsg
    let data = request.data
    switch (request.action) {
      case 'get_matches':
        reply = await this.dispatch.getMatches(userName, data);
        break;
      case 'save_matches':
        reply = await this.dispatch.saveMatches(userName, data)
        break;
      case 'remove_day':
        reply = await this.dispatch.deleteDay(userName, data)
        break;
      case 'prefs_template':
        reply = await this.dispatch.getPrefsTemplate(userName, data)
        break;
      default:
        if (request.action) {
          let msgArr = request.action.split('_')
          if (msgArr && msgArr.length == 2) {
            let prefix = msgArr[0]
            let suffix = msgArr[1]
            if (this.actionPrefixes.includes(prefix) && this.actionSuffixes.includes(suffix)) {
              let collectionName = this.actionSuffixToCollection(suffix)
              let method = this.actionPrefixToMethod(prefix)
              reply = await method.call(this.dispatch, userName, data, collectionName)
              break
            }
          }
        }
        reply = {success: false, data: {errorMsg: 'unknown request'}}
        break;
    }
    this.sendMsg(ws, request, reply)
  }

  public sendMsg(ws: WebSocket, request: IFrontendMsg, reply: IBackendMsg) {
    Object.assign(reply, {replyTo: request.id})
    this.log.debug({reply}, 'sending reply')
    ws.send(JSON.stringify(reply))
  }

  private actionPrefixToMethod(actionPrefix: string): ((userName: string, request: IFrontendMsg, collName: string) => Promise<IBackendMsg>) {
    switch (actionPrefix) {
      case 'get':
        return this.dispatch.getDbEntry
      case 'new':
        return this.dispatch.newDbEntry
      case 'edit':
        return this.dispatch.editDbEntry
      case 'remove':
        return this.dispatch.removeDbEntry
      case 'list':
        return this.dispatch.listEntriesNames
      case 'haveAny':
        return this.dispatch.haveAny
      default: //'incorrect'
        return this.dispatch.defaultIncorrect
    }
  }

  private actionSuffixToCollection(actionSuffix: string): Collection {
    switch (actionSuffix) {
      case 'horse':
        return 'horsos'
      case 'kid':
        return 'kidos'
      case 'trainer':
        return 'trainers'
      case 'user':
        return 'users'
      default:
        return 'undefined'
    }
  }
}