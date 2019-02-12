import http = require('http')
import WebSocket = require('ws')
import {Database} from "./Database";
import {IHorso, IKido} from "./DataModel";
import MatchingEngine from "./MatchingEngine";
const crypto = require('crypto');

interface IServerConfig {
  key: string
  port: number
  db: {
    uri: string  //'mongodb://localhost:27017'
    dbName: string  //'hmDev'
  }
}

interface IFrontendMsg {
  action: 'login' | 'getMatches' | 'saveMatches' | 'deleteDay' | 'newHorse' | 'editHorse' | 'newKid' | 'editKid'
  data: any
}

interface IBackendMsg {
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
    setTimeout(() => {
      if (!userName) {
        console.log(`AUTH-FAILED: Disconnecting client ${ip}`);
        ws.terminate()
      }
    }, 1000);
    //todo setTimeout for heartbeat

    ws.on('close', () => {
      console.log(`client (${ip}) disconnected. Still active: ${this.wsClients.length - 1} client(s).`);
      const idx = this.wsClients.indexOf(ws);
      if (idx != -1) {
        this.wsClients.splice(idx, 1)
      }
    });

    ws.on('message', async (msg) => {
      console.log(`message received: ${msg}`);
      try {
        let contents = JSON.parse(msg.toString());
        if (userName) {
          if (contents === 'ping') {
            ws.send('pong')
          } else {
            await this.onClientMessageReceived(ws, userName, contents)
          }
        } else {
          //{userName:string,key:string}
          // take user from db -> check pswd -> if ok save variable userName
          let loginInfo = (await this.db.find('users', {userName: contents.userName}) as ILoginInfo[])
          //todo update db with aproperiate entries and hashes
          let hash = crypto.createHash('md5').update(contents.password).digest('hex');
          if (loginInfo[0].password === hash) {
            userName = loginInfo[0].userName
            console.log(`user: ${userName}, ip: ${ip} : auth ok`);
          }
        }
      } catch (error) {
        console.log(error, 'Incorrect data type')
      }
    });
  }

  public async onClientMessageReceived(ws: WebSocket, userName: string, msg: IFrontendMsg) {
    console.log(msg, 'received')
    let data = msg.data
    switch (msg.action) {
      case 'login':
        break;
      case 'getMatches':
        this.getMatches(ws, userName, data);
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

  public async getMatches(ws: WebSocket, userName: string, data: any) {
    // todo change db entries - add userName field

    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos',{userName}))
    promiseArr.push(await this.db.find('kidos',{userName}))
    let resolvedArr = await Promise.all(promiseArr)
    let allHorsos = (resolvedArr[0] as IHorso[]).map(horso => horso.name)
    let allKidos = resolvedArr[1] as IKido[]

    //before
    /*let allHorsos = ((await this.db.find('horsos',{userName})) as IHorso[]).map(horso => horso.name)
    let allKidos = ((await this.db.find('kidos',{userName})) as IKido[])*/


    let engine = new MatchingEngine(allHorsos, allKidos)
    let result = await engine.getMatches(data)
    let msg: IBackendMsg
    if (!result.errorMsg) {
      msg = {success: true, data: result.solution}
    } else {
      msg = {success: false, data: result.errorMsg}
    }
    ws.send(JSON.stringify(msg))
  }

}