import {Database} from "../Database";
import {Collection, default as Preferences} from "../DataModel";
import {BaseValidator, IInterfaceObj, IPatternObj} from './BaseValidator'

export default class EntriesValidator extends BaseValidator {

  constructor(private userName: string, private db: Database) {
    super()
  }

  public async validateNewEntry(data: any, collName: Collection): Promise<IPatternObj> {
    let name = data.name
    let items: any[] = await this.db.find(collName, {userName: this.userName, name})
    if (items && items[0]) {
      return {errorMsg:`Entry by the name: ${name} already exists in db`}
    }
    return this.validateCommon(data,collName)
  }

  public async validateEditEntry(data: any, collName: Collection): Promise<IPatternObj> {
    return this.validateCommon(data,collName)
  }

  private async validateCommon(data: any, collName: Collection): Promise<IPatternObj>{
    let errorMsg = this.patternCheck(data, collName)
    if (errorMsg) {
      return {errorMsg:errorMsg}
    }

    if (collName === 'kidos') {
      return {errorMsg:(await this.checkPrefsForKidos(data.prefs))}
    }
    let noError = {errorMsg:''}
    let transients = this.checkForTransients(data, collName)
    if(transients){
      Object.assign(noError,{transients})
    }
    return noError
  }

  private async checkPrefsForKidos(prefs: any): Promise<string> {
    let allHorsosForUserNo: number = (await this.db.find('horsos', {userName: this.userName})).length
    if (!allHorsosForUserNo) {
      return `Before adding kid, please add all horses in your Riding Center`
    }
    if (Object.keys(prefs).length !== Preferences.allPrefCat.length) {
      return `Internal error: incorrect number of preferences`
    }
    let allHorsosInPrefsNo: number = 0
    Object.keys(prefs).forEach(prefCat => {
      allHorsosInPrefsNo += prefs[prefCat].length
    })
    if (allHorsosInPrefsNo !== allHorsosForUserNo) {
      return `Internal error: number of horsos in prefs incorrect`
    }
    //could be checked more thoroughly
    return ''
  }

  protected getPatternByName(collName: Collection): IInterfaceObj[] {
    switch (collName) {
      case 'horsos':
        return [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'newName', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'maxDailyWorkload', type: 'number'},
          {req: false, key: 'descr', type: 'string', maxL: 200},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
          {req: false, altReq: 'howToAddToPrefs', key: 'addAsHorse', type: 'string', minL: 2, maxL: 20, transient:true},
          {req: false, altReq: 'howToAddToPrefs', key: 'addToPrefLevel', type: 'string', minL: 2, maxL: 20,
            anyOf: Preferences.allPrefCat, transient:true},
          /*special cheat key added when user started adding horses before adding kidos*/
          {req: false, altReq: 'howToAddToPrefs', key: 'addedBeforeKids', type: 'boolean', transient:true}
        ]
      case 'kidos':
        return [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'newName', type: 'string', minL: 2, maxL: 20},
          {req: true, key: 'prefs', type: 'object'},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
        ]
      case 'trainers':
        return [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'newName', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'descr', type: 'string', maxL: 200},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
          {req: false, key: 'isDefault', type: 'boolean'},
        ]
      /*case 'users':
        return [
          {req: true, key: 'userName',type: 'string', maxL:20},
          {req: false, key: 'password',type: 'string', regEx:'(?=.{5,})',maxL:20}, //at least 5 char
          {req: true, key: 'email',type: 'string', regEx:'\'/^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/\'',maxL:40},
        ]*/
      default:
        return []
    }
  }
}