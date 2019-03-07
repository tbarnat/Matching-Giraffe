import {Database} from "./Database";
import MatchingEngine from "./MatchingEngine";
import {Collection, IBackendMsg, IHorseRidingDay, IHorso, IKido, default as Preferences, PrefType} from "./DataModel";
import QueryValidator from "./validators/QueryValidator";
import {Logger} from "./utils/Logger";
import EntriesValidator from "./validators/EntriesValidator";

export default class Dispatch {

  constructor(protected db: Database, private log: Logger) {
  }

  // request.data: IHorseRidingDayQ
  public async getMatches(userName: string, data: any): Promise<IBackendMsg> {
    Object.assign(data, {timeResInMinutes: 60})
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

  // data: INewHorse / IKido / IInstructo
  public async newDbEntry(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    if (collName === 'horsos') {  // horso is kinda special case entity
      return await this.newHorso(userName, data, collName)
    }
    let DV: EntriesValidator = new EntriesValidator(userName, this.db)
    let errorMsg = await DV.validateNewEntry(data, collName)
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }
    await this.db.insertOne(collName, Object.assign({userName}, data))


    await this.logResults('new', userName, data.name, collName)
    return {success: true, data: {}}
  }


  private async newHorso(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {

    let kidos = (await this.db.find('kidos', {userName}) as IKido[])
    if (!kidos.length) {
      if (data.addAsHorse || data.addToPrefLevel) {
        return {
          success: false,
          data: {errorMsg: 'Internal error: fields addAsHorse or addToPrefLevel are not allowed if there is no kidos ind db for this user'}
        }
      }
      Object.assign(data, {noAddingCheatKey: true})
    }
    let DV: EntriesValidator = new EntriesValidator(userName, this.db)
    let errorMsg = await DV.validateNewEntry(data, collName)
    if(data.addToPrefLevel){
      if(!Preferences.isPrefCategory(data.addToPrefLevel)){
        errorMsg = `Internal error: preferences category: ${data.addToPrefLevel} is invalid`
      }
    }
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }
    await this.db.insertOne(collName, Object.assign({userName}, data))

    if (kidos && kidos.length) {
      if (data.addAsHorse) {
        let editedKidos: IKido[] = kidos.map(kido => {
          let newPrefs: PrefType = kido.prefs
          Object.keys(kido.prefs).forEach(prefCat => {
            if (kido.prefs[prefCat].includes(data.addAsHorse)) {
              newPrefs[prefCat].push(data.name)
            }
          })
          return {name: kido.name, remarks: kido.remarks, prefs: newPrefs}
        })
        await this.db.updateMany('kidos', {userName}, editedKidos)
      }else if(data.addToPrefLevel){
        let editedKidos: IKido[] = kidos.map(kido => {
          kido.prefs[data.addToPrefLevel].push(data.name)
          return kido
        })
        await this.db.updateMany('kidos', {userName}, editedKidos)
      }
    }


    await this.logResults('new', userName, data.name, collName)
    return {success: true, data: {}}
  }

  // data: IHorse / IKido / IInstructo, but also data.newName? : string
  public async editDbEntry(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let name = data.name

    let DV: EntriesValidator = new EntriesValidator(userName, this.db)
    let errorMsg = await DV.validateEditEntry(data, collName)
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }

    let mongoUpdObj = await this.db.updateOne(collName, {
      userName,
      name
    }, {$set: Object.assign({userName}, data)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${name}`}}
    }
    this.logResults('edit', userName, name, collName)
    return {success: true, data: {}}
  }

  // data: IHorse / IKido / IInstructo
  public async removeDbEntry(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let name: string = data.name
    if (collName === 'horsos') {  // horso is kinda special case entity
      await this.removeHorsoFromKidosPrefs(userName, name)
    }
    let mongoDelObj = await this.db.deleteOne(collName, {userName, name})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the name: ${name}`}}
    }
    this.logResults('remove', userName, name, collName)
    return {success: true, data: {}}
  }

  private async removeHorsoFromKidosPrefs(userName: string, name: string){
    let kidos = (await this.db.find('kidos', {userName}) as IKido[])
    let editedKidos: IKido[] = kidos.map(kido => {
      Object.keys(kido.prefs).forEach(prefLevel => {
        if(kido.prefs[prefLevel].includes(name)){
          kido.prefs[prefLevel] = kido.prefs[prefLevel].filter(horso => {return (horso != name)})
        }
      })
      return kido
    })
    await this.db.updateMany('kidos', {userName}, editedKidos)
  }

  private async logResults(action: string, userName: string, name: string, collName: Collection) {
    let entries = await this.db.find(collName, {userName, name})
    this.log.info(entries, `for '${action}' by '${userName}' on '${name}' as '${collName}'`)
  }

  // data.query; string (incomplete string)  data.taken: string[] (list of taken, already selected)
  public async listEntriesNames(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
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
    items = items.sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toUpperCase())
    }).slice(0, 10)
    return {success: true, data: items}
  }

  // data: string (name of donor kido)
  public async getPrefsTemplate(userName: string, data: any): Promise<IBackendMsg> {
    let kidos = (await this.db.find('kidos', {userName, name: data})) as IKido[]
    if (kidos && kidos[0]) {
      return {success: true, data: kidos[0].prefs}
    }
    return {success: true, data: {}}
  }

  public async haveAny(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let horsos = (await this.db.find(collName, {userName})) as IHorso[]
    if (horsos && horsos.length) {
      return {success: true, data: true}
    }
    return {success: true, data: false}
  }

  public async registerVisit(userName: string) {
    await this.db.updateOne('users', {userName}, {$set: {'lastVisit': Date.now()}, '$inc': {'allVisits': 1}}) //
  }

  public async defaultIncorrect(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    return {
      success: false,
      data: {errorMsg: `Internal error: incorrect_call ${userName} / ${JSON.stringify(data)} / ${collName}`}
    }
  }
}