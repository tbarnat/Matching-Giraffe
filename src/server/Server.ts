import http = require('http')
import WebSocket = require('ws')
import {Database} from "./Database";
import {IHorso, IKido} from "./DataModel";
import MatchingEngine from "./MatchingEngine";

const crypto = require('crypto');

//const uuidv4 = require('uuid/v4');

interface IServerConfig {
  port: number
  db: {
    uri: string  //'mongodb://localhost:27017'
    dbName: string  //'hmDev'
  }
}

interface IFrontendMsg {
  id: string
  action: 'login' | 'getMatches' | 'saveMatches' | 'deleteDay' | 'newHorse' | 'editHorse' | 'newKid' | 'editKid'
  data: any
}

interface IBackendMsg {
  replyTo?: string //id of incoming message
  success: boolean
  data: any
}

interface ILoginInfo {
  userName: string
  password: string //#
}

export default class Server {

  protected db: Database
  protected httpServer: http.Server;
  protected wss: WebSocket.Server;
  protected wsClients: WebSocket[] = []; //{client: WebSocket, sessionID: string}[] = []

  constructor(config: IServerConfig) {
    this.initDb(config).then(() => {
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
    switch (request.action) {
      /*case 'login': <- this is handled somewhere else
        break;*/
      case 'getMatches':
        this.getMatches(ws, userName, request);
      case 'saveMatches':
        break;
      case 'deleteDay':
        break;
      case 'newHorse':
        break;
      case 'editHorse':
        break;
      case 'newKid':
        break;
      case 'editKid':
        break;
      default:
        break;
    }
  }

  public async getMatches(ws: WebSocket, userName: string, request: IFrontendMsg) {

    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {userName}))
    promiseArr.push(await this.db.find('kidos', {userName}))
    let resolvedArr = await Promise.all(promiseArr)
    let allHorsos = (resolvedArr[0] as IHorso[]).map(horso => horso.name)
    let allKidos = resolvedArr[1] as IKido[]

    /*let allHorsos = ((await this.db.find('horsos',{userName})) as IHorso[]).map(horso => horso.name)
    let allKidos = ((await this.db.find('kidos',{userName})) as IKido[])*/ //<-as it was before


    let engine = new MatchingEngine(allHorsos, allKidos)
    let result = await engine.getMatches(request.data)
    let reply: IBackendMsg
    if (!result.errorMsg) {
      reply = {replyTo: request.id, success: true, data: result.solution}
    } else {
      reply = {success: false, data: result.errorMsg}
    }
    this.sendMsg(ws, request, reply)
  }

  public sendMsg(ws: WebSocket, request: IFrontendMsg, reply: IBackendMsg) {
    Object.assign(reply, {replyTo: request.id})
    ws.send(JSON.stringify(reply))
  }
}