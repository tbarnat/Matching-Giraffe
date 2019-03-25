export default abstract class BaseClient {

  private webSocket: WebSocket
  private initialized: Deferred
  protected isLoggedIn: Deferred
  private readonly url: string // 'ws://localhost:8080';
  private readonly pingTimeout: number = 10000
  private readonly reconnectTimeout: number = 30000
  private pingTimer: NodeJS.Timer
  private reconnectTimer: NodeJS.Timer

  public constructor(url: string) {
    this.url = url
    this.connectToBackend()
  }

  private connectToBackend() {
    this.reconnectTimer = setTimeout(() => {
      this.reconnect()
    }, (this.pingTimeout + this.reconnectTimeout))
    try {
      this.initialized = new Deferred()
      this.isLoggedIn = new Deferred()
      this.webSocket = new WebSocket(this.url);
      this.webSocket.onopen = () => {
        this.initialized.resolve()

        this.pingTimer = setInterval(() => {
          this.ping()
        }, this.pingTimeout)

      };

      this.webSocket.onmessage = (msg) => {

        clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
          this.ping()
        }, this.pingTimeout)

        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.reconnect()
        }, (this.pingTimeout + this.reconnectTimeout))

        let contents = JSON.parse(msg.data.toString())

        if (contents.replyTo) {
          //console.log('got a valid reply')
          this.handleReply(contents.replyTo, contents.success, contents.data)
        }
      };

      this.webSocket.onclose = () => {
        console.log('ws was closed')
        clearInterval(this.pingTimer);
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.reconnect()
        }, (this.pingTimeout + this.reconnectTimeout))
      }

      this.webSocket.onerror =  (err) => {
        console.log('ws on err', err)
      }
    } catch (err) {
      console.log('ws err', err)
    }
  }

  private ping() {
    try {
      this.webSocket.send('"ping"')
    } catch (err) {
      console.log('ws send error - TelegramEmitter socket closed')
      clearTimeout(this.pingTimer);
    }
  }

  private reconnect() {
    console.log('reconnecting ws')
    this.connectToBackend()
  }

  protected async send(request: any, doWhenLoggedIn: boolean = true) {
    try {
      await this.confirmInitialized()
      if(doWhenLoggedIn){
        await this.confirmLoggedIn()
      }
      await this.webSocket.send(JSON.stringify(request));
    } catch (err) {
      console.log(err, 'ws msg error', err)
    }
  }

  public async confirmInitialized(): Promise<void>{
    await this.initialized.promise
    return
  }

  public async confirmLoggedIn(): Promise<void>{
    await this.isLoggedIn.promise
    return
  }

  protected abstract handleReply(requestId: string, success: boolean, data: any): void

}

export class Deferred {
  public promise: Promise<any>
  public resolve: any
  public reject: any
  constructor() {
    this.promise = new Promise((resolve, reject)=> {
      this.resolve = resolve
      this.reject = reject
    })
  }
}