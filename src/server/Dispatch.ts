import {Database} from "./Database";
import MatchingEngine from "./MatchingEngine";
import {Collection, IBackendMsg, IHorseRidingDay, IHorso, IInstructo, IKido} from "./DataModel";
import QueryValidator from "./validators/QueryValidator";
import {Logger} from "./utils/Logger";
import EntriesValidator from "./validators/EntriesValidator";
import Utils from "./utils/Utils";

export default class Dispatch {

  private readonly dbEntriesLimitsByCollName: {[collName: string]: number } = {
    diary: 10000,
    horsos: 200,
    kidos: 500,
    trainers: 100,
  }

  constructor(protected db: Database, private log: Logger) {
  }

  private async isLimitExceeded(collName: Collection): Promise<boolean>{
    let count = await this.db.count(collName)
    return (count + 1 >= this.dbEntriesLimitsByCollName[collName])
  }

  public async getAsset(userName: string): Promise<IBackendMsg> {
    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {userName}))
    promiseArr.push(this.db.find('kidos', {userName}))
    promiseArr.push(this.db.find('trainers', {userName}))
    let resolvedArr = await Promise.all(promiseArr)
    let horses = (resolvedArr[0] as IHorso[])
    let kids = (resolvedArr[1]  as IKido[])
    let trainers = (resolvedArr[2]  as IInstructo[])
    return ({success: true, data: {horses, kids, trainers}})
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
    let collName: Collection = 'diary'
    if(await this.isLimitExceeded(collName)){
      return {success: false, data: {errorMsg: `Limit for max number of entries reached - please remove some old stuff`}}
    }
    let day: string = data.day
    let existingEntry: IHorseRidingDay[] = await this.db.find(collName, {userName, day})
    if (existingEntry && existingEntry[0]) {
      return {success: false, data: {errorMsg: `Dairy entry for the day: ${day} already exists`}}
    }
    await this.db.insertOne(collName, Object.assign({userName}, data))
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

  public async getDbEntry(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let entry = (await this.db.find(collName, {userName, name: data.name}))[0]
    if (entry) {
      entry = Dispatch.stripFromUserNameAnd_Id(entry)
      return {success: true, data: entry}
    }
    return {success: false, data: {}}
  }

  // data: INewHorse / IKido / IInstructo
  public async newDbEntry(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    if(await this.isLimitExceeded(collName)){
      return {success: false, data: {errorMsg: `Limit for max number of entries reached - please remove some old stuff`}}
    }
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
          data: {errorMsg: 'Internal error: fields addAsHorse or addToPrefLevel are not allowed if there is no kidos in db for this user'}
        }
      }
      Object.assign(data, {addedBeforeKids: true})
    }
    let DV: EntriesValidator = new EntriesValidator(userName, this.db)
    let errorMsg = await DV.validateNewEntry(data, collName)
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
        await this.updateKidosWithHorses(userName, modifiedKidos)
      } else if (transients['addToPrefLevel']) {
        let prefLevel: string = transients['addToPrefLevel']
        modifiedKidos = kidos.map(kido => {
          kido.prefs[prefLevel].push(data.name)
          return kido
        })
        await this.updateKidosWithHorses(userName, modifiedKidos)
      } else {
        return ({success: false, data: {errorMsg: 'Internal error: Validation mechanism failed'}} as IBackendMsg)
      }
    }
    await this.db.insertOne(collName, Object.assign({userName}, data))

    await this.logResults('new', userName, data.name, collName)
    return {success: true, data: {}}
  }

  // data: IHorse / IKido / IInstructo, but also data.newName? : string
  public async editDbEntry(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    if (collName === 'horsos') {  // horso is kinda special case entity
      return await this.editHorso(userName, data, collName)
    }

    let DV: EntriesValidator = new EntriesValidator(userName, this.db)
    let errorMsg = await DV.validateEditEntry(data, collName)
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }

    let oldName = data.name
    let newEntry: any = {}
    let keys = Object.keys(data)
    if(keys.includes('newName')){
      keys.filter(key => key != 'name').forEach(field => {
        field == 'newName' ? newEntry['name'] = data['newName'] : newEntry[field] = data[field]
      })
    }else{
      keys.forEach(field => {newEntry[field] = data[field]})
    }
    let oldEntry = (await this.db.find(collName, {userName, name: oldName}))[0]
    oldEntry = Dispatch.stripFromUserNameAnd_Id(oldEntry)
    if (Utils.areFlatObjectsIdentical(newEntry, oldEntry)) {
      return ({success: false, data: {errorMsg: 'Edited none - new and old objects are the same'}} as IBackendMsg)
    }

    let mongoUpdObj = await this.db.updateOne(collName, {
      userName,
      name: oldName
    }, {$set: Object.assign({userName}, newEntry)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${oldName}`}}
    }
    this.logResults('edit', userName, oldName, collName)
    return {success: true, data: {}}
  }

  private async editHorso(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {

    let DV: EntriesValidator = new EntriesValidator(userName, this.db)
    let errorMsg = await DV.validateEditEntry(data, collName)
    if (errorMsg) {
      return ({success: false, data: {errorMsg}} as IBackendMsg)
    }

    let oldName = data.name
    let newEntry: any = {}
    let keys = Object.keys(data)
    if(keys.includes('newName')){
     keys.filter(key => key != 'name').forEach(field => {
       field == 'newName' ? newEntry['name'] = data['newName'] : newEntry[field] = data[field]
      })
    }else{
      keys.forEach(field => {newEntry[field] = data[field]})
    }
    let oldEntries = (await this.db.find(collName, {userName, name: oldName}))
    let oldEntry = oldEntries[0]
    oldEntry = Dispatch.stripFromUserNameAnd_Id(oldEntry)
    if (Utils.areFlatObjectsIdentical(newEntry, oldEntry)) {
      return ({success: false, data: {errorMsg: 'Edited none - new and old objects are the same'}} as IBackendMsg)
    }
    let mongoUpdObj = await this.db.updateOne(collName, {
      userName,
      name: oldName
    }, {$set: Object.assign({userName}, newEntry)})
    if (!mongoUpdObj.modifiedCount) {
      return {success: false, data: {errorMsg: `Edited none by the name: ${oldName}`}}
    }


    let kidos = (await this.db.find('kidos', {userName}) as IKido[])
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
      await this.updateKidosWithHorses(userName, modifiedKidos)
    }

    await this.logResults('new', userName, data.name, collName)
    return {success: true, data: {}}
    //mix of newHorso and editEntry - divide into correct sub methods
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

  private async removeHorsoFromKidosPrefs(userName: string, name: string) {
    let kidos = (await this.db.find('kidos', {userName}) as IKido[])
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
      await this.updateKidosWithHorses(userName, modifiedKidos)
    }
  }

  private async updateKidosWithHorses(userName: string, modifiedKidos: IKido[]) {
    let promiseList: any = []
    for (let modifiedKido of modifiedKidos) {
      let singleUpdate = this.db.updateOne('kidos', {
        userName,
        name: modifiedKido.name
      }, {$set: Object.assign({userName}, modifiedKido)})
      promiseList.push(singleUpdate)
    }
    await Promise.all(promiseList)
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
    return {success: false, data: {errorMsg: `Internal error: No kid by the name: ${data}`}}
  }

  public async haveAny(userName: string, data: any, collName: Collection): Promise<IBackendMsg> {
    let count = (await this.db.count(collName, {userName}))
    if (count) {
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

  private static stripFromUserNameAnd_Id(entry: any): any{
    delete entry._id
    delete entry.userName
    return entry
  }
}