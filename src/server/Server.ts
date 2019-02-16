import http = require('http')
import WebSocket = require('ws')
import {Database} from "./Database";
import Dispatch from "./Dispatch";
import {IBackendMsg, IFrontendMsg, ILoginAttempt} from "./DataModel";

const crypto = require('crypto');

//const uuidv4 = require('uuid/v4');

interface IServerConfig {
  port: number
  db: {
    uri: string  //'mongodb://localhost:27017'
    dbName: string  //'hmDev'
  }
}

export default class Server {

  protected db: Database
  private httpServer: http.Server;
  private wss: WebSocket.Server;
  private wsClients: WebSocket[] = []; //{client: WebSocket, sessionID: string}[] = []
  private dispatch: Dispatch

  private readonly actionPrefixes = ['new', 'edit', 'remove']
  private readonly actionSuffixes = ['user', 'horse', 'kid', 'trainer']

  constructor(config: IServerConfig) {
    this.initDb(config).then(() => {
      this.dispatch = new Dispatch(this.db)
      this.httpServer = http.createServer();
      this.wss = new WebSocket.Server({server: this.httpServer});
      this.wss.on('connection', this.onWssServerConnection.bind(this));
      this.httpServer.listen(config.port)
      console.log('server started')
    }).catch(() => {
      console.log('db init failed')
    })
  }

  private async initDb(config: IServerConfig) {
    this.db = new Database(config.db);
    await this.db.init()
  }

  public async onWssServerConnection(ws: WebSocket, request: http.IncomingMessage) {

    let userName: string | undefined
    this.wsClients.push(ws);
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;


    console.log(`client (${ip}) connected`);

    ws.on('close', () => {
      console.log(`client (${ip}) disconnected. Still active: ${this.wsClients.length - 1} client(s).`);
      const idx = this.wsClients.indexOf(ws);
      if (idx != -1) {
        this.wsClients.splice(idx, 1)
      }
    });

    ws.on('message', async (msg) => {
      console.log(`message received: ${msg} \n`);
      try {
        if (msg === '"ping"') {
          ws.send('"pong"')
          return
        }
        let request = JSON.parse(msg.toString());
        request = request as IFrontendMsg
        if (userName) {
          await this.onClientMessageReceived(ws, userName, request)
        } else if(request.action == 'login'){
          //request: {userName:string,password:string}
          let reply: IBackendMsg = {success: false, data: 'Invalid login or password'}
          let loginInfo = (await this.db.findOne('users', {userName: request.data.userName}) as ILoginAttempt)
          if (loginInfo) {
            let hash = crypto.createHash('md5').update(request.data.password).digest('hex');
            if (loginInfo.password === hash) {
              userName = loginInfo.userName
              this.dispatch.registerVisit(userName)
              console.log(`  -- > user: ${userName}, ip: ${ip} : auth ok`);
              reply = {success:true, data:{}}
            }
          }
          this.sendMsg(ws, request, reply)
        }
      } catch (error) {
        console.log(error, 'Incorrect data type')
      }
    });
  }

  public async onClientMessageReceived(ws: WebSocket, userName: string, request: IFrontendMsg) {
    //console.log(request, 'received')
    let reply: IBackendMsg
    switch (request.action) {
      /*case 'login': <- this is handled somewhere else
        break;*/
      case 'new_user':
      case 'edit_user':
      case 'remove_user':
        reply = {success:false,data:{errorMsg:'not implemented yet'}}
        break
      case 'get_matches':
        reply = await this.dispatch.getMatches(userName, request);
        break;
      case 'save_matches':
        reply = await this.dispatch.saveMatches(userName, request)
        break;
      case 'remove_day':
        reply = await this.dispatch.deleteDay(userName, request)
        break;
      default:
        if(request.action){
          let msgArr = request.action.split('_')
          if(msgArr && msgArr.length == 2){
            let prefix = msgArr[0]
            let suffix = msgArr[1]
            if(this.actionPrefixes.includes(prefix) && this.actionSuffixes.includes(suffix)){
              let collectionName = this.actionSuffixToCollection(suffix)
              let method = this.actionPrefixToMethod(prefix)
              reply = await method.bind(this)(userName,request,collectionName)
              break
            }
          }
        }
        reply = {success:false,data:{errorMsg:'unknown request'}}
        break;
    }
    console.log('reply for: ',request.action,'  ->  ', JSON.stringify(reply))
    this.sendMsg(ws, request, reply)
  }

  public sendMsg(ws: WebSocket, request: IFrontendMsg, reply: IBackendMsg) {
    Object.assign(reply, {replyTo: request.id})
    ws.send(JSON.stringify(reply))
  }

  private actionPrefixToMethod(actionPrefix: string): ((userName: string, request: IFrontendMsg, collName: string) => Promise<IBackendMsg>) {
    switch (actionPrefix){
      case 'edit': return this.dispatch.editDbEntry
      case 'remove': return this.dispatch.removeDbEntry
      default: return this.dispatch.newDbEntry //'new'
    }
  }

  private actionSuffixToCollection(actionSuffix: string):string{
    switch (actionSuffix) {
      case 'horse': return 'horsos'
      case 'kid': return 'kidos'
      case 'trainer': return 'trainers'
      case 'user': return 'users'
      default: return 'undefined_collection'
    }
  }
}