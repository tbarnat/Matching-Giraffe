import {Database} from "./Database";
import MatchingEngine from "./MatchingEngine";
import {IBackendMsg, IFrontendMsg, IHorseRidingDay} from "./DataModel";
import QueryValidator from "./QueryValidator";

export default class Dispatch {

  constructor(protected db: Database) {
  }

  // request.data: IHorseRidingDayQ
  public async getMatches(userName: string, request: IFrontendMsg): Promise<IBackendMsg> {
    let QV = new QueryValidator(userName, this.db)
    let errorMsg = QV.validateDailyQuery(request.data)
    if(errorMsg){
      return ({replyTo: request.id, success: false, data: {errorMsg}} as IBackendMsg)
    }
    let result = await (new MatchingEngine(QV.allHorsosString, QV.allKidos)).getMatches(request.data)
    return ({replyTo: request.id, success: !result.errorMsg, data: result} as IBackendMsg)

  }

  // request.data: IHorseRidingDay
  public async saveMatches(userName: string, request: IFrontendMsg): Promise<IBackendMsg> {
    let day: string = request.data.day
    let existingEntry: IHorseRidingDay[] = await this.db.find('diary', {userName, day})
    if (existingEntry && existingEntry[0]) {
      return {success: false, data: {errorMsg: `Dairy entry for the day: ${day} already exists`}}
    }
    await this.db.insertOne('diary', Object.assign({userName}, request.data))
    return {success: true, data: request.data.day}
  }

  // request.data: {day: string}   4ex: '2019-03-13' or '2019-03-15-a'
  public async deleteDay(userName: string, request: IFrontendMsg): Promise<IBackendMsg> {
    let day: string = request.data.day
    let mongoDelObj = await this.db.deleteOne('diary', {userName, day})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the day: ${day}`}}
    }
    return {success: true, data: {}}
  }

  // request.data: IHorse / IKido / IInstructo
  public async newDbEntry(userName: string, request: IFrontendMsg, collName: string): Promise<IBackendMsg> {
    let name = request.data.name
    let items: any[] = await this.db.find(collName, {userName, name})
    if (items && items[0]) {
      return {success: false, data: {errorMsg: `Entry named: ${name} already exists in db`}}
    }
    await this.db.insertOne(collName, Object.assign({userName}, request.data))
    return {success: true, data: {}}
  }

  // request.data: IHorse / IKido / IInstructo
  public async editDbEntry(userName: string, request: IFrontendMsg, collName: string): Promise<IBackendMsg> {
    let name = request.data.name
    let mongoUpdObj = await this.db.updateOne(collName, {userName, name}, { $set:Object.assign({userName}, request.data)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${name}`}}
    }
    return {success: true, data: {}}
  }

  // request.data: IHorse / IKido / IInstructo
  public async removeDbEntry(userName: string, request: IFrontendMsg, collName: string): Promise<IBackendMsg> {
    let name: string = request.data.name
    let mongoDelObj = await this.db.deleteOne(collName, {userName, name})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the name: ${name}`}}
    }
    return {success: true, data: {}}
  }

  public async registerVisit(userName: string){
    let reply = await this.db.updateOne('users',{userName},{ $set: {'lastVisit': Date.now()},'$inc': {'allVisits': 1}}) //
    console.log(reply.result)
  }
}