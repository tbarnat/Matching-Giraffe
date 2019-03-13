import {Database} from "../Database";
import {Collection, default as Preferences, IHorso} from "../DataModel";
import {BaseValidator, IInterfaceObj} from './BaseValidator'

export default class EntriesValidator extends BaseValidator {

  constructor(private userName: string, private db: Database) {
    super()
  }

  public async validateNewEntry(data: any, collName: Collection): Promise<string> {
    let name = data.name
    let items: any[] = await this.db.find(collName, {userName: this.userName, name})
    if (items && items[0]) {
      return `Entry by the name: ${name} already exists in db`
    }
    return this.validateCommon(data, collName, 'new')
  }

  public async validateEditEntry(data: any, collName: Collection): Promise<string> {
    return this.validateCommon(data, collName, 'edit')
  }

  private async validateCommon(data: any, collName: Collection, actionType?: 'new' | 'edit'): Promise<string> {
    let errorMsg = this.patternCheck(data, collName, actionType)
    if (errorMsg) {
      return errorMsg
    }

    switch (collName) {
      case 'kidos':
        return await this.additionalValidationForKidos(data)
      case 'horsos':
        return await this.additionalValidationForHorses(data)
      default:
        break
    }
    return ''
  }

  private async additionalValidationForKidos(data: any): Promise<string> {
    let prefs = data.prefs
    //checking preferences for kids
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

  private async additionalValidationForHorses(data: any): Promise<string> {
    if (data.addAsHorse) {
      let horso = (await this.db.find('horsos', {userName: this.userName, name: data.addAsHorse}) as IHorso[])[0]
      if(!horso){
        return `Internal error: cannot add horse to preferences as: ${data.addAsHorse}, because it doesn't exist in db`
      }
    }
    if (data.addToPrefLevel && !Preferences.isPrefCategory(data.addToPrefLevel)) {
      return `Internal error: preferences category: ${data.addToPrefLevel} is invalid`
    }
    return ''
  }

  //todo newName to edit type
  protected getPatternByName(collName: Collection, actionType?: 'new' | 'edit'): IInterfaceObj[] {
    switch (collName) {
      case 'horsos':
        let pattern = [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'newName', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'maxDailyWorkload', type: 'number'},
          {req: false, key: 'descr', type: 'string', maxL: 200},
          {req: false, key: 'remarks', type: 'string', maxL: 200}]
        if(actionType && actionType === 'new'){
          let addPattern = [
            {
              req: false,
              altReq: 'howToAddToPrefs',
              key: 'addAsHorse',
              type: 'string',
              minL: 2,
              maxL: 20,
              transient: true
            },
            {
              req: false, altReq: 'howToAddToPrefs', key: 'addToPrefLevel', type: 'string', minL: 2, maxL: 20,
              anyOf: Preferences.allPrefCat, transient: true
            },
            /*special cheat key added when user started adding horses before adding kidos*/
            {req: false, altReq: 'howToAddToPrefs', key: 'addedBeforeKids', type: 'boolean', transient: true}
          ]
          pattern = pattern.concat(addPattern)
        }
        return pattern
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

    //todo get functions for custom validations
  }
}