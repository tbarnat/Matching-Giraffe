import {Database} from "./Database";
import MatchingEngine from "./MatchingEngine";
import {Collection, IBackendMsg, IHorseRidingDay, IHorso, IInstructo, IKido} from "./DataModel";
import DayQueryValidator from "./validators/DayQueryValidator";
import DaySaveValidator from "./validators/DaySaveValidator";
import {Logger} from "./utils/Logger";
import EntriesValidator from "./validators/EntriesValidator";
import Utils from "./utils/Utils";

const short = require('short-uuid');

export default class Dispatch {

  private readonly dbEntriesLimitsByCollName: { [collName: string]: number } = {
    diary: 10000,
    horsos: 200,
    kidos: 500,
    trainers: 100,
  }
  private maxErrorLength = 250

  constructor(protected db: Database, private log: Logger) {
  }

  private async isLimitExceeded(collName: Collection): Promise<boolean> {
    let count = await this.db.count(collName)
    return (count + 1 >= this.dbEntriesLimitsByCollName[collName])
  }

  public async getAsset(hrcHash: string): Promise<IBackendMsg> {
    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {hrcHash}))
    promiseArr.push(this.db.find('kidos', {hrcHash}))
    promiseArr.push(this.db.find('trainers', {hrcHash}))
    let resolvedArr = await Promise.all(promiseArr)
    let horses = (resolvedArr[0] as IHorso[])
    let kids = (resolvedArr[1]  as IKido[])
    let trainers = (resolvedArr[2]  as IInstructo[])
    return ({success: true, data: {horses, kids, trainers}})
  }

  // request.data: IHorseRidingDayQ
  public async getMatches(hrcHash: string, data: any): Promise<IBackendMsg> {
    Object.assign(data, {timeResInMinutes: 60})
    let DQV = new DayQueryValidator(hrcHash, this.db)
    await DQV.init()
    let errorMsg
    DQV.peelFromEmptyAndUndefined(data)
    try {
      errorMsg = await DQV.validateDailyQuery(data)
    } catch (err) {
      errorMsg = err.stack.substring(0, this.maxErrorLength)
    }
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }
    if (DQV.checkIfQueryIsAlreadySolved(data)) {
      delete data.dailyExcludes
      delete data.timeResInMinutes
      return ({success: true, data: {solution: data}} as IBackendMsg)
    }
    let result = await (new MatchingEngine(DQV.getAllHorsosString(), DQV.getAllKidos(), this.log.child({hrcHash}))).getMatches(data)
    return ({success: !result.errorMsg, data: result} as IBackendMsg)

  }

  // data: IHorseRidingDay
  public async saveMatches(hrcHash: string, data: any): Promise<IBackendMsg> {
    let collName: Collection = 'diary'
    if (await this.isLimitExceeded(collName)) {
      return {
        success: false,
        data: {errorMsg: `Limit for max number of entries reached - please remove some old stuff`}
      }
    }
    let day: string = data.day
    let existingEntry: IHorseRidingDay[] = await this.db.find(collName, {hrcHash, day})
    if (existingEntry && existingEntry[0]) {
      this.log.info(`Dairy entry for the day: ${day} already exists, and might be overwritten`)
      /*return {success: false, data: {errorMsg: `Dairy entry for the day: ${day} already exists`}}*/
    }
    let DSV = new DaySaveValidator(hrcHash, this.db)
    await DSV.init()
    let errorMsg
    try {
      errorMsg = await DSV.validateDay(data)
    } catch (err) {
      errorMsg = err.stack.substring(0, this.maxErrorLength)
    }
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }
    let dayHash = this.getUniqueHash('diary','dayHash')
    Object.assign(data, {dayHash})
    let upsertRes = await this.db.updateOne(collName, {day: data.day}, {$set:Object.assign(data, {hrcHash})},{upsert: true})
    if (upsertRes) {
      return {success: true, data}
    } else {
      return {success: false, data: {errorMsg: `Failed to upsert`}}
    }
  }

  public async getDay(hrcHash: string, data: any): Promise<IBackendMsg> {
    let entry = (await this.db.find('diary', {hrcHash, day: data.name}))[0]
    if (entry) {
      entry = Dispatch.stripFromHrcAnd_Id(entry)
      return {success: true, data: entry}
    }
    return {success: false, data: {}}
  }

  public async listDays(userName: string, hrcHash: string, data: any): Promise<IBackendMsg> {
    let msgList = await this.listEntriesNames(userName, hrcHash, data, 'diary', 'day')
    msgList.data = msgList.data.map((dateString: string) => {
      return new Date(dateString)
    })
    return msgList
  }

  // data: {day: string}   4ex: '2019-03-13' or '2019-03-15-a'
  public async deleteDay(hrcHash: string, data: any): Promise<IBackendMsg> {
    let day: string = data.name
    let mongoDelObj = await this.db.deleteOne('diary', {hrcHash, day})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the day: ${day}`}}
    }
    return {success: true, data: {}}
  }

  public async getDbEntry(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let entry = await this.db.findOne(collName, {hrcHash, name: data.name})
    if (entry) {
      entry = Dispatch.stripFromHrcAnd_Id(entry)
      return {success: true, data: entry}
    }
    return {success: false, data: {}}
  }

  // data: INewHorse / IKido / IInstructo
  public async newDbEntry(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {
    if (await this.isLimitExceeded(collName)) {
      return {
        success: false,
        data: {errorMsg: `Limit for max number of entries reached - please remove some old stuff`}
      }
    }
    switch (collName) { // redirect special case entities
      case 'horsos':
        return await this.newHorso(userName, hrcHash, data, collName)
      case 'hrcs':
        return await this.newHrc(userName, data, collName)
    }
    let EV: EntriesValidator = new EntriesValidator(hrcHash, this.db)
    let errorMsg
    try {
      errorMsg = await EV.validateNewEntry(data, collName)
    } catch (err) {
      errorMsg = err.stack.substring(0, this.maxErrorLength)
    }
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }
    await this.db.insertOne(collName, Object.assign({hrcHash}, data))

    await this.logResults('new', userName, hrcHash, data.name, collName)
    return {success: true, data: {}}
  }


  private async newHorso(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {

    let kidos = (await this.db.find('kidos', {hrcHash}) as IKido[])
    if (!kidos.length) {
      if (data.addAsHorse || data.addToPrefLevel) {
        return {
          success: false,
          data: {errorMsg: 'Internal error: fields addAsHorse or addToPrefLevel are not allowed if there is no kidos in db for this user'}
        }
      }
      Object.assign(data, {addedBeforeKids: true})
    }
    let EV: EntriesValidator = new EntriesValidator(hrcHash, this.db)
    let errorMsg
    try {
      errorMsg = await EV.validateNewEntry(data, collName)
    } catch (err) {
      errorMsg = err.stack.substring(0, this.maxErrorLength)
    }
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }

    // move some fields to transient
    let transients: { [key: string]: string } = {}
    let howToAddToPrefs = ['addedBeforeKids', 'addToPrefLevel', 'addAsHorse']
    howToAddToPrefs.forEach(addingOption => {
      if (data[addingOption]) {
        transients[addingOption] = data[addingOption]
        delete data[addingOption]
      }
    })

    if (kidos && kidos.length && transients) {
      let modifiedKidos: IKido[]
      if (transients['addAsHorse']) {
        modifiedKidos = kidos.map(kido => {
          Object.keys(kido.prefs).forEach(prefLevel => {
            if (kido.prefs[prefLevel].includes(transients['addAsHorse'])) {
              kido.prefs[prefLevel].push(data.name)
            }
          })
          return kido
        })
        await this.updateKidosWithHorses(hrcHash, modifiedKidos)
      } else if (transients['addToPrefLevel']) {
        let prefLevel: string = transients['addToPrefLevel']
        modifiedKidos = kidos.map(kido => {
          kido.prefs[prefLevel].push(data.name)
          return kido
        })
        await this.updateKidosWithHorses(hrcHash, modifiedKidos)
      } else {
        return ({success: false, data: {errorMsg: 'Internal error: Validation mechanism failed'}} as IBackendMsg)
      }
    }
    await this.db.insertOne(collName, Object.assign({hrcHash}, data))

    await this.logResults('new', userName, hrcHash, data.name, collName)
    return {success: true, data: {}}
  }

  private async newHrc(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let hrcHash = this.getUniqueHash('hrcs','hrcHash')
    return {success: false, data: {hrcHash}}
  }

  // data: IHorse / IKido / IInstructo, but also data.newName? : string
  public async editDbEntry(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {
    if (collName === 'horsos') {  // horso is kinda special case entity
      return await this.editHorso(userName, hrcHash, data, collName)
    }

    let EV: EntriesValidator = new EntriesValidator(hrcHash, this.db)
    let errorMsg
    try {
      errorMsg = await EV.validateEditEntry(data, collName)
    } catch (err) {
      errorMsg = err.stack.substring(0, this.maxErrorLength)
    }

    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }

    let oldName = data.name
    let newEntry: any = {}
    let keys = Object.keys(data)
    if (keys.includes('newName')) {
      keys.filter(key => key != 'name').forEach(field => {
        field == 'newName' ? newEntry['name'] = data['newName'] : newEntry[field] = data[field]
      })
    } else {
      keys.forEach(field => {
        newEntry[field] = data[field]
      })
    }
    let oldEntry = (await this.db.find(collName, {hrcHash, name: oldName}))[0]
    oldEntry = Dispatch.stripFromHrcAnd_Id(oldEntry)
    if (Utils.areFlatObjectsIdentical(newEntry, oldEntry)) {
      return ({success: false, data: {errorMsg: 'Edited none - new and old objects are the same'}} as IBackendMsg)
    }

    let mongoUpdObj = await this.db.updateOne(collName, {
      hrcHash,
      name: oldName
    }, {$set: Object.assign({hrcHash}, newEntry)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${oldName}`}}
    }
    this.logResults('edit', userName, hrcHash, oldName, collName)
    return {success: true, data: {}}
  }

  private async editHorso(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {

    let EV: EntriesValidator = new EntriesValidator(hrcHash, this.db)
    let errorMsg
    try {
      errorMsg = await EV.validateEditEntry(data, collName)
    } catch (err) {
      errorMsg = err.stack.substring(0, this.maxErrorLength)
    }
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }

    let oldName = data.name
    let newEntry: any = {}
    let keys = Object.keys(data)
    if (keys.includes('newName')) {
      keys.filter(key => key != 'name').forEach(field => {
        field == 'newName' ? newEntry['name'] = data['newName'] : newEntry[field] = data[field]
      })
    } else {
      keys.forEach(field => {
        newEntry[field] = data[field]
      })
    }
    let oldEntries = (await this.db.find(collName, {hrcHash, name: oldName}))
    let oldEntry = oldEntries[0]
    oldEntry = Dispatch.stripFromHrcAnd_Id(oldEntry)
    if (Utils.areFlatObjectsIdentical(newEntry, oldEntry)) {
      return ({success: false, data: {errorMsg: 'Edited none - new and old objects are the same'}} as IBackendMsg)
    }
    let mongoUpdObj = await this.db.updateOne(collName, {
      hrcHash,
      name: oldName
    }, {$set: Object.assign({hrcHash}, newEntry)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${oldName}`}}
    }


    let kidos = (await this.db.find('kidos', {hrcHash}) as IKido[])
    if (kidos && kidos.length) {
      let modifiedKidos: IKido[] = kidos.map(kido => {
        Object.keys(kido.prefs).forEach(prefCat => {
          if (kido.prefs[prefCat].includes(data.name)) {
            let prefsFiltered = kido.prefs[prefCat].filter(horsoName => {
              return horsoName !== data.name
            })
            kido.prefs[prefCat] = prefsFiltered.concat(newEntry.name)
          }
        })
        return kido
      })
      await this.updateKidosWithHorses(hrcHash, modifiedKidos)
    }

    await this.logResults('new', userName, hrcHash, data.name, collName)
    return {success: true, data: {}}
    //mix of newHorso and editEntry - divide into correct sub methods
  }

  // data: IHorse / IKido / IInstructo
  public async removeDbEntry(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let name: string = data.name
    if (collName === 'horsos') {  // horso is kinda special case entity
      await this.removeHorsoFromKidosPrefs(hrcHash, name)
    }
    let mongoDelObj = await this.db.deleteOne(collName, {hrcHash, name})
    if (!mongoDelObj.deletedCount) {
      return {success: false, data: {errorMsg: `Deleted none by the name: ${name}`}}
    }
    this.logResults('remove', userName, hrcHash, name, collName)
    return {success: true, data: {}}
  }

  private async removeHorsoFromKidosPrefs(hrcHash: string, name: string) {
    let kidos = (await this.db.find('kidos', {hrcHash}) as IKido[])
    if (kidos.length) {
      let modifiedKidos: IKido[] = kidos.map(kido => {
        Object.keys(kido.prefs).forEach(prefLevel => {
          if (kido.prefs[prefLevel].includes(name)) {
            kido.prefs[prefLevel] = kido.prefs[prefLevel].filter(horsoName => {
              return (horsoName != name)
            })
          }
        })
        return kido
      })
      await this.updateKidosWithHorses(hrcHash, modifiedKidos)
    }
  }

  private async updateKidosWithHorses(hrcHash: string, modifiedKidos: IKido[]) {
    let promiseList: any = []
    for (let modifiedKido of modifiedKidos) {
      let singleUpdate = this.db.updateOne('kidos', {
        hrcHash,
        name: modifiedKido.name
      }, {$set: Object.assign({hrcHash}, modifiedKido)})
      promiseList.push(singleUpdate)
    }
    await Promise.all(promiseList)
  }

  private async logResults(action: string, userName: string, hrcHash: string, name: string, collName: Collection) {
    let entries = await this.db.find(collName, {hrcHash, name})
    this.log.info(entries, `for '${action}' by ' ${userName}' with hrc: '${hrcHash}' on '${name}' as '${collName}'`)
  }

  // data.query: string (incomplete string)  data.taken: string[] (list of taken, already selected)
  public async listEntriesNames(userName: string, hrcHash: string, data: any, collName: Collection, identifier: string = 'name'): Promise<IBackendMsg> {
    let items: string[] = []
    if (collName === 'users' || collName === 'hrcs') {
      return {success: true, data: items}
    }
    let query: string = data.query || ''
    let entries: any[] = await this.db.find(collName, {hrcHash})
    if (entries.length) {
      items = entries.map(entry => {
        return entry[identifier]
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
      return a.toLowerCase().localeCompare(b.toLowerCase())
    })
    return {success: true, data: items}
  }

  // data: string (name of donor kido)
  public async getPrefsTemplate(hrcHash: string, data: any): Promise<IBackendMsg> {
    let kidos = (await this.db.find('kidos', {hrcHash, name: data})) as IKido[]
    if (kidos && kidos[0]) {
      return {success: true, data: kidos[0].prefs}
    }
    return {success: false, data: {errorMsg: `Internal error: No kid by the name: ${data}`}}
  }

  public async haveAny(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let count = (await this.db.count(collName, {hrcHash}))
    if (count) {
      return {success: true, data: true}
    }
    return {success: true, data: false}
  }

  public async registerVisit(userName: string) {
    await this.db.updateOne('users', {userName}, {$set: {'lastVisit': Date.now()}, '$inc': {'allVisits': 1}}) //
  }

  public async defaultIncorrect(userName: string, hrcHash: string, data: any, collName: Collection): Promise<IBackendMsg> {
    this.log.error(`unknown call by ${userName} on ${hrcHash}: ${JSON.stringify(data)} on collection: ${collName}`)
    return {
      success: false,
      data: {errorMsg: `Internal error: unknown call: ${JSON.stringify(data)} on collection: ${collName}`}
    }
  }

  private static stripFromHrcAnd_Id(entry: any): any {
    delete entry._id
    delete entry.hrcHash
    return entry
  }

  // better safe than sorry
  private async getUniqueHash(collName: Collection, idHashFieldName: string){
    let newHash = short.generate()
    let entry: any = await this.db.findOne(collName,{[idHashFieldName]:newHash})
    while(entry){
      newHash = short.generate()
      entry = await this.db.findOne(collName,{[idHashFieldName]:newHash})
    }
    return newHash
  }

  public async getDayViewByHash(hash: string): Promise<IBackendMsg>{
    let entry = (await this.db.find('diary', {dayHash:hash}))[0]
    if (entry) {
      entry = Dispatch.stripFromHrcAnd_Id(entry)
      return {success: true, data: entry}
    }
    return {success: false, data: {}}
  }
}