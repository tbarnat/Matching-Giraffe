import BaseClient, {Deferred} from "./BaseClient";

const uuidv4 = require('uuid/v4');

type Action =
  'get_matches'  | 'save_matches' | 'remove_day' |
  'get_kid'     | 'new_kid'     | 'edit_kid'     | 'remove_kid'   | 'list_kid'  | 'haveAny_kid'  |
  'get_horse'   | 'new_horse'   | 'edit_horse'   | 'remove_horse' | 'list_horse'  | 'haveAny_horse'  |
  'get_trainer' | 'new_trainer' | 'edit_trainer' | 'remove_trainer' | 'list_trainer' | 'haveAny_trainer'  |
  //'new_user'    | 'edit_user'    | 'remove_user' | 'list_user' |
  'prefs_template' | 'login'

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