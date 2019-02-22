import {Database} from "./Database";
import MatchingEngine from "./MatchingEngine";
import {IBackendMsg, IHorseRidingDay} from "./DataModel";
import QueryValidator from "./validators/QueryValidator";
import {Logger} from "./utils/Logger";

export default class Dispatch {

  constructor(protected db: Database, private log: Logger) {
  }

  // request.data: IHorseRidingDayQ
  public async getMatches(userName: string, data: any): Promise<IBackendMsg> {
    let QV = new QueryValidator(userName, this.db)
    await QV.init()
    let errorMsg = await QV.validateDailyQuery(data)
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }
    if (QV.checkIfQueryIsAlreadySolved(data)) {
      return ({success: true, data: {solution: data}} as IBackendMsg)
    }
    let result = await (new MatchingEngine(QV.getAllHorsosString(), QV.getAllKidos(), this.log.child({userName}))).getMatches(data)
    return ({success: !result.errorMsg, data: result} as IBackendMsg)

  }

  // data: IHorseRidingDay
  public async saveMatches(userName: string, data: any): Promise<IBackendMsg> {
    let day: string = data.day
    let existingEntry: IHorseRidingDay[] = await this.db.find('diary', {userName, day})
    if (existingEntry && existingEntry[0]) {
      return {success: false, data: {errorMsg: `Dairy entry for the day: ${day} already exists`}}
    }
    await this.db.insertOne('diary', Object.assign({userName}, data))
    return {success: true, data: data.day}
  }

  // data: {day: string}   4ex: '2019-03-13' or '2019-03-15-a'
  public async deleteDay(userName: string, data: any): Promise<IBackendMsg> {
    let day: string = data.day
    let mongoDelObj = await this.db.deleteOne('diary', {userName, day})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the day: ${day}`}}
    }
    return {success: true, data: {}}
  }

  // data: IHorse / IKido / IInstructo
  public async newDbEntry(userName: string, data: any, collName: string): Promise<IBackendMsg> {
    let name = data.name
    let items: any[] = await this.db.find(collName, {userName, name})
    if (items && items[0]) {
      return {success: false, data: {errorMsg: `Entry named: ${name} already exists in db`}}
    }
    //todo validation: empty strings, fields type and length
    await this.db.insertOne(collName, Object.assign({userName}, data))
    await this.logResults('new', userName, name, collName)
    return {success: true, data: {}}
  }

  // data: IHorse / IKido / IInstructo
  public async editDbEntry(userName: string, data: any, collName: string): Promise<IBackendMsg> {
    let name = data.name
    //todo validation: empty strings, fields type and length
    let mongoUpdObj = await this.db.updateOne(collName, {
      userName,
      name
    }, {$set: Object.assign({userName}, data)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${name}`}}
    }
    this.logResults('edit',userName,name,collName)
    return {success: true, data: {}}
  }

  // data: IHorse / IKido / IInstructo
  public async removeDbEntry(userName: string, data: any, collName: string): Promise<IBackendMsg> {
    let name: string = data.name
    let mongoDelObj = await this.db.deleteOne(collName, {userName, name})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the name: ${name}`}}
    }
    this.logResults('remove',userName,name,collName)
    return {success: true, data: {}}
  }

  private async logResults(action: string, userName: string, name: string, collName: string) {
    let entries = await this.db.find(collName, {userName, name})
    this.log.info(entries, `for '${action}' by '${userName}' on '${name}' as '${collName}'`)
  }

  // data.query; string (incomplete string)  data.taken: string[] (list of taken, already selected)
  public async listEntriesNames(userName: string, data: any, collName: string): Promise<IBackendMsg> {
    let items: string[] = []
    if (collName === 'users') {
      return {success: true, data: items}
    }
    let query: string = data.query
    let entries: any[] = await this.db.find(collName, {userName})
    if (entries.length) {
      items = entries.map(entry => {
        return entry.name
      })
    }
    if (query) {
      query = query.toLowerCase()
      items = items.filter(item => {
        item = item.toLowerCase()
        return (item.substr(0, query.length) === query)
      })
    }
    if (data.taken) {
      let taken: string[] = data.taken
      items = items.filter(item => {
        return -taken.indexOf(item)
      })
    }
    items = items.sort().slice(0, 10)
    return {success: true, data: items}
  }

  public async registerVisit(userName: string) {
    await this.db.updateOne('users', {userName}, {$set: {'lastVisit': Date.now()}, '$inc': {'allVisits': 1}}) //
  }

  public async defaultIncorrect(userName: string, data: any, collName: string): Promise<IBackendMsg> {
    return {
      success: false,
      data: {errorMsg: 'incorrect_call'}
    }
  }
}