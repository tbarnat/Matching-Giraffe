import {
  Db,
  MongoClient,
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  InsertWriteOpResult,
  DeleteWriteOpResultObject
} from 'mongodb'

export interface IDatabase {
  init(): Promise<void>
  find(collectionName: string, query: Object, fields?: Object): Promise<any[]>
  findOne(collectionName: string, filter: Object): Promise<any>
  updateOne(collectionName: string, filter: Object, update: Object): Promise<UpdateWriteOpResult>
  updateMany(collectionName: string, filter: Object, update: Object): Promise<UpdateWriteOpResult>
  insertOne(collectionName: string, doc: Object): Promise<InsertOneWriteOpResult>
  insertMany(collectionName: string, docs: Object): Promise<InsertWriteOpResult>
  deleteOne(collectionName: string, doc: Object): Promise<DeleteWriteOpResultObject>
  drop(collectionName: string): Promise<any>
}

export interface Config {
  uri: string
  dbName: string
}

export class Database implements IDatabase {

  protected db: Db;

  constructor(protected config: Config) {}

  async init() {
    let client = await MongoClient.connect(this.config.uri);
    console.log(`client uses ${this.config.uri}`)
    this.db = client.db(this.config.dbName);
    console.log(`connected to database: ${this.config.uri}`)
  }


  find(collectionName: string, query?: Object) {
    return this.db.collection(collectionName).find(query).toArray()
  }

  findOne(collectionName: string, filter: Object) {
    return this.db.collection(collectionName).findOne(filter)
  }

  updateOne(collectionName: string, filter: Object, update: Object) {
    return this.db.collection(collectionName).updateOne(filter, update)
  }

  updateMany(collectionName: string, filter: Object, update: Object) {
    return this.db.collection(collectionName).updateMany(filter, update)
  }

  insertOne(collectionName: string, doc: Object) {
    return this.db.collection(collectionName).insertOne(doc)
  }

  insertMany(collectionName: string, docs: Object[]) {
    return this.db.collection(collectionName).insertMany(docs)
  }

  deleteOne(collectionName: string, docs: Object) {
    return this.db.collection(collectionName).deleteOne(docs)
  }
  //deleteMany  http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteOne

  drop(collectionName: string) {
    return this.db.collection(collectionName).drop()
  }
}
