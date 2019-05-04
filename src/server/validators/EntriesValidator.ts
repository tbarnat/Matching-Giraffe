import {Database} from "../Database";
import {Collection, default as Preferences, IHorso} from "../DataModel";
import {BaseValidator, IInterfaceObj} from './BaseValidator'

export default class EntriesValidator extends BaseValidator {

  constructor(private hrcHash: string, private db: Database) {
    super()
  }

  public async validateNewEntry(data: any, collName: Collection): Promise<string> {
    let name = data.name
    if (await this.db.findOne(collName, {hrcHash: this.hrcHash, name})) {
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
    let allHorsosForHrc: number = (await this.db.find('horsos', {hrcHash: this.hrcHash})).length
    if (!allHorsosForHrc) {
      return `Before adding kid, please add all horses in your Riding Center`
    }
    if (Object.keys(prefs).length !== Preferences.allPrefCat.length) {
      return `Internal error: incorrect number of preferences`
    }
    let allHorsosInPrefsNo: number = 0
    Object.keys(prefs).forEach(prefCat => {
      allHorsosInPrefsNo += prefs[prefCat].length
    })
    if (allHorsosInPrefsNo !== allHorsosForHrc) {
      return `Internal error: number of horsos in prefs incorrect`
    }
    //could be checked more thoroughly
    return ''
  }

  private async additionalValidationForHorses(data: any): Promise<string> {
    if (data.addAsHorse) {
      let horso = (await this.db.findOne('horsos', {hrcHash: this.hrcHash, name: data.addAsHorse}) as IHorso[])
      if (!horso) {
        return `Internal error: cannot add horse to preferences as: ${data.addAsHorse}, because it doesn't exist in db`
      }
    }
    if (data.addToPrefLevel && !Preferences.isPrefCategory(data.addToPrefLevel)) {
      return `Internal error: preferences category: ${data.addToPrefLevel} is invalid`
    }
    return ''
  }

  protected getPatternByName(collName: Collection, actionType?: 'new' | 'edit'): IInterfaceObj[] {
    let pattern: IInterfaceObj[]
    let addPattern: IInterfaceObj[]
    switch (collName) {
      case 'horsos':
        pattern = [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'maxDailyWorkload', type: 'number'},
          {req: false, key: 'descr', type: 'string', maxL: 200},
          {req: false, key: 'remarks', type: 'string', maxL: 200}]
        if (actionType && actionType === 'new') {
          addPattern = [
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
        if (actionType && actionType === 'edit') {
          addPattern = [{req: false, key: 'newName', type: 'string', minL: 2, maxL: 20}]
          pattern = pattern.concat(addPattern)
        }
        return pattern
      case 'kidos':
        pattern = [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: true, key: 'prefs', type: 'object'},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
        ]
        if (actionType && actionType === 'edit') {
          addPattern = [{req: false, key: 'newName', type: 'string', minL: 2, maxL: 20}]
          pattern = pattern.concat(addPattern)
        }
        return pattern
      case 'trainers':
        pattern = [
          {req: true, key: 'name', type: 'string', minL: 2, maxL: 20},
          {req: false, key: 'descr', type: 'string', maxL: 200},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
          {req: false, key: 'isDefault', type: 'boolean'},
        ]
        if (actionType && actionType === 'edit') {
          addPattern = [{req: false, key: 'newName', type: 'string', minL: 2, maxL: 20}]
          pattern = pattern.concat(addPattern)
        }
        return pattern
      /*case 'users':
        return [
          {req: true, key: 'hrcHash',type: 'string', maxL:20},
          {req: false, key: 'password',type: 'string', regEx:'(?=.{5,})',maxL:20}, //at least 5 char
          {req: true, key: 'email',type: 'string', regEx:'\'/^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/\'',maxL:40},
        ]*/
      default:
        return []
    }
  }
}