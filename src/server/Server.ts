import http = require('http')
import WebSocket = require('ws')
import {Database} from "./Database";
import Dispatch from "./Dispatch";
import {BackendData} from "./DataModel";

const crypto = require('crypto');

//const uuidv4 = require('uuid/v4');

interface IServerConfig {
  port: number
  db: {
    uri: string  //'mongodb://localhost:27017'
    dbName: string  //'hmDev'
  }
}

export interface IFrontendMsg {
  id: string
  action: 'login' | 'getMatches' | 'saveMatches' | 'deleteDay' | 'newHorse' | 'editHorse' | 'deleteHorse'
    | 'newKid' | 'editKid' | 'deleteKid' | 'newTrainer' | 'editTrainer' | 'deleteTrainer'
  data: any
}

export interface IBackendMsg {
  replyTo?: string //id of incoming message
  success: boolean
  data: any | BackendData
}

interface ILoginInfo {
  userName: string
  password: string //#
}

export default class Server {

  protected db: Database
  private httpServer: http.Server;
  private wss: WebSocket.Server;
  private wsClients: WebSocket[] = []; //{client: WebSocket, sessionID: string}[] = []
  private dispatch: Dispatch

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
        let request = JSON.parse(msg.toString());
        if (request === 'ping') {
          ws.send('"pong"')
        }
        request = request as IFrontendMsg
        if (userName) {
          await this.onClientMessageReceived(ws, userName, request)
        } else if(request.action == 'login'){

          //request: {userName:string,password:string}
          let reply: IBackendMsg = {success: false, data: 'Invalid login or password'}
          console.log('0',request.data.userName)
          let loginInfo = (await this.db.findOne('users', {userName: request.data.userName}) as ILoginInfo)
          console.log('A',loginInfo)
          if (loginInfo) {
            console.log('B')
            let hash = crypto.createHash('md5').update(request.data.password).digest('hex');
            if (loginInfo.password === hash) {
              console.log('C')
              userName = loginInfo.userName
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
    console.log(request, 'received')
    let reply: IBackendMsg
    switch (request.action) {
      /*case 'login': <- this is handled somewhere else
        break;*/
      case 'getMatches':
        reply = await this.dispatch.getMatches(userName, request);
        break;
      case 'saveMatches':
        reply = await this.dispatch.saveMatches(userName, request)
        break;
      case 'deleteDay':
        reply = await this.dispatch.deleteDay(userName, request)
        break;
      case 'newHorse':
        reply = await this.dispatch.newDbEntry(userName, request, 'horsos')
        break;
      case 'editHorse':
        reply = await this.dispatch.editDbEntry(userName, request, 'horsos')
        break;
      case 'deleteHorse':
        reply = await this.dispatch.deleteDbEntry(userName, request, 'horsos')
        break;
      case 'newKid':
        reply = await this.dispatch.newDbEntry(userName, request, 'kidos')
        break;
      case 'editKid':
        reply = await this.dispatch.editDbEntry(userName, request, 'kidos')
        break;
      case 'deleteKid':
        reply = await this.dispatch.deleteDbEntry(userName, request, 'kidos')
        break;
      case 'newTrainer':
        reply = await this.dispatch.newDbEntry(userName, request, 'trainers')
        break;
      case 'editTrainer':
        reply = await this.dispatch.editDbEntry(userName, request, 'trainers')
        break;
      case 'deleteTrainer':
        reply = await this.dispatch.deleteDbEntry(userName, request, 'trainers')
        break;
      default:
        reply = {success:false,data:{errorMsg:'unknown request'}}
        break;
    }
    this.sendMsg(ws, request, reply)
  }

  public sendMsg(ws: WebSocket, request: IFrontendMsg, reply: IBackendMsg) {
    Object.assign(reply, {replyTo: request.id})
    ws.send(JSON.stringify(reply))
  }
}