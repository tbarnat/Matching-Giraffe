import BaseClient, {Deferred} from "./BaseClient";

const uuidv4 = require('uuid/v4');

type Action = 'login' | 'get_matches' | 'save_matches' | 'delete_day' |
'new_user' | 'edit_user' | 'delete_user' |
'new_horse' | 'edit_horse' | 'delete_horse' |
'new_kid' | 'edit_kid' | 'delete_kid' |
'new_trainer' | 'edit_trainer' | 'delete_trainer'

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
    return {success:false, data:{errorMsg:'Collision of uuid v4'}}
  }

  //creates new deferred
  public sendRequest(action: Action, data: any): string {
    let id = uuidv4()
    if (this.deferreds[id]) {
      return ''
    }
    this.deferreds[id] = new Deferred()
    this.send({id, action, data})
    return id
  }

  //main method for client's requests
  public async sendAndWait(action: Action, data: any): Promise<any>{
    let requestId = await this.sendRequest(action,data)
    return this.waitFor(requestId)
  }

  public async login(userName: string, password: string): Promise<boolean>{
    return ((await this.sendAndWait('login', {userName, password})) as any).success
  }

}