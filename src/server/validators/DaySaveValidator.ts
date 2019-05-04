import {Database} from "../Database";
import {IHorseRidingDay} from "../DataModel";
import {DayValidator} from "./DayValidator";
import {IInterfaceObj} from "./BaseValidator";

export default class DayQueryValidator extends DayValidator {

  constructor(protected hrcHash: string, protected db: Database) {
    super()
  }

  // returns error msg or empty string
  public async validateDay(toBeRidingDay: any): Promise<string> {

    let errorMsg: string | undefined
    errorMsg = this.patternHorseRidingDay(toBeRidingDay)
    if(errorMsg){
      return errorMsg
    }
    let horseRidingDay = toBeRidingDay as IHorseRidingDay

    errorMsg = this.dayNameIsValid(horseRidingDay)
    if(errorMsg){
      return errorMsg
    }

    errorMsg = await this.hourFieldIsValid(horseRidingDay)
    if(errorMsg){
      return errorMsg
    }

    errorMsg = await this.entriesInQueryExistsInDb(horseRidingDay)
    if(errorMsg){
      return errorMsg
    }

    for (let hourInfo of horseRidingDay.hours) {
      for (let trainingDetails of hourInfo.trainingsDetails) {
        this.kidosStrInQuery.push(trainingDetails.kidName)
      }
    }

    errorMsg = await this.entriesForEachHourDoesNotRepeat(horseRidingDay)
    if(errorMsg){
      return errorMsg
    }

    this.kidosInQuery = this.allKidos.filter(kido => {
      return this.kidosStrInQuery.includes(kido.name)
    })

    errorMsg = await this.kidosHasOnlyValidHorsesInPrefs()
    if(errorMsg){
      return errorMsg
    }

    return ''
  }

  protected getPatternByName(name: string): IInterfaceObj[] {
    switch (name) {
      case 'dayKeys':
        return [
          {req: true, key: 'day', type: 'string', minL: 10, maxL: 10}, //todo regEx
          {req: true, key: 'hours', type: 'object', isArr: true, minL: 1},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
        ]
      case 'hourKeys':
        return [
          {req: true, key: 'hour', type: 'string', minV: 0, maxV: 2400}, //todo regEx
          {req: true, key: 'trainer', type: 'object', isArr: true},
          {req: true, key: 'trainingsDetails', type: 'object', isArr: true, minL: 1},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
        ]
      case 'trainingKeys':
        return [
          {req: true, key: 'kidName', type: 'string', minL: 2, maxL: 20},
          {req: true, key: 'horse', type: 'string', minL: 2, maxL: 20},
        ]
      default:
        return []
    }
  }
}