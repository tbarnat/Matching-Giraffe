import BaseClient, {Deferred} from "./BaseClient";

const uuidv4 = require('uuid/v4');

type Action = 'login' | 'getMatches' | 'saveMatches' | 'deleteDay' | 'newHorse' | 'editHorse' | 'newKid' | 'editKid'

export default class Client extends BaseClient {

  private deferreds: { [key: string]: Deferred} = {}

  //resolves promises in deferred object
  protected handleReply(requestId: string, success: boolean, data: any) {
    this.deferreds[requestId].resolve({success,data})
  }

  //returning resolved promises
  public async waitFor(msgId: string): Promise<any> {
    if(msgId){
      let reply = await this.deferreds[msgId].promise
      delete this.deferreds[msgId]
      return reply
    }
    return {success:false, data:{errorMsg:'Collision of uuidv4'}}
  }

  //creates new deferred
  private sendRequest(action: Action, data: any): string {
    let id = uuidv4()
    if (this.deferreds[id]) {
      console.log('uuidv4 collision')
      return ''
    }
    this.deferreds[id] = new Deferred()
    this.send({id, action, data})
    return id
  }

  public login(userName: string, password: string): string{
    return this.sendRequest('login', {userName, password})

  }

  //todo export types to node_modules
  public getMathes(dailyQuery: any): string{
    return this.sendRequest('getMatches', dailyQuery)
  }

}