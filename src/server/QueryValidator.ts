import {Database} from "./Database";
import {IHorseRidingDayQ, IHorso, IKido} from "./DataModel";
import _ = require('lodash')

export default class QueryValidator {

  private _allHorsos: IHorso[]
  private _allHorsosString: string[]
  private _allKidos: IKido[]

  //private _allKidosString: string[]

  constructor(private userName: string, private db: Database) {
  }

  public async init() {
    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {userName: this.userName}))
    promiseArr.push(this.db.find('kidos', {userName: this.userName}))
    let resolvedArr = await Promise.all(promiseArr)
    this._allHorsos = (resolvedArr[0] as IHorso[])
    this._allHorsosString = this._allHorsos.map(horso => horso.name)
    this._allKidos = resolvedArr[1] as IKido[]
    //this._allKidosString = this._allKidos.map(kido => kido.name)

  }

  // returns error msg or empty string
  public async validateDailyQuery(toBeDailyQuery: any): string {

    // hardcoded interface
    let dayKeys = ['dailyExcludes', 'day', 'hours','remarks']
    let hourKeys = [ 'hour', 'remarks', 'trainer', 'trainingsDetails' ]
    let trainingKeys = ['horse', 'kidName']

    //confirm field names
    let validStructure = true
    validStructure = validStructure && _.isEqual(Object.keys(toBeDailyQuery).sort(),dayKeys)

    if(Array.isArray(toBeDailyQuery.hours)){
      toBeDailyQuery.hours.forEach((hour: any) => {
        validStructure = validStructure && _.isEqual(Object.keys(hour).sort(),hourKeys)
        if(Array.isArray(toBeDailyQuery.hours.trainingsDetails)){
          toBeDailyQuery.hours.trainingsDetails.forEach((training: any) => {
            validStructure = validStructure && _.isEqual(Object.keys(training).sort(),trainingKeys)
          })
        }else{
          validStructure = false
        }
      })
    }else{
      validStructure = false
    }
    if(!validStructure){
      return 'invalid query object structure'
    }

    let dailyQuery = toBeDailyQuery as IHorseRidingDayQ

    let validDate = true
    // checking if 'day' is valid
    if(dailyQuery.day.length >= 10 && dailyQuery.day.length < 15){
      let daySplitted = dailyQuery.day.split('-')
      daySplitted = daySplitted.map(text => {parseInt(text)})
      validDate = validDate && (daySplitted[0] > 2000)
      if(dailyQuery.day && ){

        await this.db.find('diary', {userName: this.userName, })
      }
    }



    // as IHorseRidingDayQ
    // check if types are correct
    //          no such day in db already
    //          hour names are numbers and are unique
    //          all kidos names matches the ones in db
    //          all horsos names matches the ones in db
    //          all kidos has all horsos in prefs
    // return error msg starting with (Validation) or empty string

    return ''
  }

  public get allKidos(): IKido[] {
    return this._allKidos;
  }

  public get allHorsosString(): string[] {
    return this._allHorsosString;
  }
}