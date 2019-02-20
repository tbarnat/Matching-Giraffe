import pino = require('pino')
const RotatingFileStream = require('rotating-file-stream')

export type LoggerConfig = {
  name: string
  level: 'fatal'|'error'|'warn'|'info'|'debug'|'trace'|'silent'
  safe?: boolean
  filename?: string
  pathLog: string
  rotateInterval?: string
  rotateMaxFiles?: number
}

export interface LogFn {
  (msg: string, ...args: any[]): void;
  (obj: object, msg?: string, ...args: any[]): void;
}

function customErrorSerializer(err: any) {
  if (err instanceof Error) {
    return pino.stdSerializers.err(err)
  }
  return err
}

export class Logger {

  private readonly log: pino.Logger

  public fatal: LogFn
  public error: LogFn
  public warn: LogFn
  public info: LogFn
  public debug: LogFn
  public trace: LogFn

  constructor(loggerConfig: LoggerConfig) {
    this.log = pino({
      name: loggerConfig.name,
      level: loggerConfig.level,
      safe: loggerConfig.safe,
      serializers: {
        err: customErrorSerializer,
        error: customErrorSerializer
      }
    }, loggerConfig.filename && new RotatingFileStream(loggerConfig.filename, {
      interval: loggerConfig.rotateInterval,
      maxFiles: loggerConfig.rotateMaxFiles,
      path: loggerConfig.pathLog
    }))
    const levelFns = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
    for (const name of levelFns) {
      (<any>this)[name] = (...args: any[]) => this.log[name].apply(this.log, args)
    }
  }

  child(bindings: {[key:string]: any}): Logger {
    return <any>this.log.child(bindings)
  }

}
