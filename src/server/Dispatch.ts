import {Database} from "./Database";
import MatchingEngine from "./MatchingEngine";
import {IHorseRidingDay, IHorso, IKido} from "./DataModel";
import {IBackendMsg, IFrontendMsg} from "./Server";

export default class Dispatch {

  constructor(protected db: Database) {
  }

  // request.data: IHorseRidingDayQ
  public async getMatches(userName: string, request: IFrontendMsg): Promise<IBackendMsg> {
    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {userName}))
    promiseArr.push(await this.db.find('kidos', {userName}))
    let resolvedArr = await Promise.all(promiseArr)
    let allHorsos = (resolvedArr[0] as IHorso[]).map(horso => horso.name)
    let allKidos = resolvedArr[1] as IKido[]
    let result = await (new MatchingEngine(allHorsos, allKidos)).getMatches(request.data)
    let reply: IBackendMsg
    if (!result.errorMsg) {
      reply = {replyTo: request.id, success: true, data: result.solution}
    } else {
      reply = {success: false, data: result.errorMsg}
    }
    return reply
  }

  // request.data: IHorseRidingDay
  public async saveMatches(userName: string, request: IFrontendMsg): Promise<IBackendMsg> {
    let day: string = request.data.day
    let existingEntry: IHorseRidingDay[] = await this.db.find('diary', {userName, day})
    if (existingEntry && existingEntry[0]) {
      return {success: false, data: {errorMsg: `Dairy entry for ${day} already exists`}}
    }
    await this.db.insertOne('diary', Object.assign({userName}, request))
    return {success: true, data: request.data.day}
  }

  // request.data: {day: string}   4ex: '2019-03-13' or '2019-03-15-a'
  public async deleteDay(userName: string, request: IFrontendMsg): Promise<IBackendMsg> {
    let day: string = request.data.day
    let delResObj = await this.db.deleteOne('diary', {userName, day})
    if (!delResObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none for ${day}`}}
    }
    return {success: true, data: {}}
  }

  // request.data: IHorse / IKido /IInstructo
  public async newDbEntry(userName: string, request: IFrontendMsg, collName: string): Promise<IBackendMsg> {
    /*let name = request.data.name
    let items: any[] = await this.db.find(collName, {userName, name})*/
    //find in db - check if exists
    return {success: true, data: {}}
  }

  // request.data: IHorse
  public async editDbEntry(userName: string, request: IFrontendMsg, collName: string): Promise<IBackendMsg> {
    //db.update
    return {success: true, data: {}}
  }

  // request.data: IHorse
  public async deleteDbEntry(userName: string, request: IFrontendMsg, collName: string): Promise<IBackendMsg> {
    //find in db - check if exists
    //remove - like delete day
    return {success: true, data: {}}
  }

}