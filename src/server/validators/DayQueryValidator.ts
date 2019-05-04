import {Database} from "../Database";
import {IHorseRidingDayQ, IKido, default as Preferences} from "../DataModel";
import {DayValidator} from "./DayValidator";
import {IInterfaceObj} from "./BaseValidator";
import Utils from "../utils/Utils";

export default class DayQueryValidator extends DayValidator {

  constructor(protected hrcHash: string, protected db: Database) {
    super()
  }

  // returns error msg or empty string
  public async validateDailyQuery(toBeDailyQuery: any): Promise<string> {

    let errorMsg: string | undefined
    errorMsg = this.patternHorseRidingDay(toBeDailyQuery)
    if (errorMsg) {
      return errorMsg
    }
    let dailyQuery = toBeDailyQuery as IHorseRidingDayQ

    errorMsg = this.dayNameIsValid(dailyQuery)
    if (errorMsg) {
      return errorMsg
    }

    errorMsg = await this.hourFieldIsValid(dailyQuery)
    if (errorMsg) {
      return errorMsg
    }

    errorMsg = await this.entriesInQueryExistsInDbForQuery(dailyQuery)
    if (errorMsg) {
      return errorMsg
    }

    for (let hourInfo of dailyQuery.hours) {
      for (let trainingDetails of hourInfo.trainingsDetails) {
        this.kidosStrInQuery.push(trainingDetails.kidName)
      }
    }

    errorMsg = await this.entriesForEachHourDoesNotRepeatForQuery(dailyQuery)
    if (errorMsg) {
      return errorMsg
    }

    this.kidosInQuery = this.allKidos.filter(kido => {
      return this.kidosStrInQuery.includes(kido.name)
    })

    errorMsg = await this.kidosInQueryHasAllHorsesInPrefs(dailyQuery)
    if (errorMsg) {
      return errorMsg
    }

    errorMsg = await this.kidosHasOnlyValidHorsesInPrefs()
    if (errorMsg) {
      return errorMsg
    }

    return ''
  }

  protected entriesInQueryExistsInDbForQuery(day: IHorseRidingDayQ): string | undefined {
    let errorMsg: string | undefined
    errorMsg = this.entriesInQueryExistsInDb(day)
    if (errorMsg) {
      return errorMsg
    }
    for (let horseName of day.dailyExcludes) {
      if (!this.allHorsosString.includes(horseName)) {
        return `Excluded horse by the name: ${horseName} does not exist in db`
      }
    }
    return
  }

  protected entriesForEachHourDoesNotRepeatForQuery(day: IHorseRidingDayQ): string | undefined {
    let errorMsg: string | undefined
    errorMsg = this.entriesForEachHourDoesNotRepeat(day)
    if (errorMsg) {
      return errorMsg
    }
    for (let hourInfo of day.hours) {
      let hourName = hourInfo.hour
      let allHorsosThisHour: string[] = []
      for (let trainingDetails of hourInfo.trainingsDetails) {
        if (trainingDetails.horse) {
          allHorsosThisHour.push(trainingDetails.horse)
        }
      }
      if (Utils.strArrHasDuplicates(allHorsosThisHour.concat(day.dailyExcludes))) {
        return `Excluded horses were selected for ${hourName}`
      }
    }
  }

  protected kidosInQueryHasAllHorsesInPrefs(dailyQuery: IHorseRidingDayQ): string | undefined {
    let allHorsosInStables = this.allHorsosString.length
    for (let kido of this.kidosInQuery) {
      if (Preferences.countItemsInPrefType(kido.prefs) != allHorsosInStables) {
        return `: ${kido.name} have incomplete preferences`
      }
    }
  }

  public checkIfQueryIsAlreadySolved(dailyQuery: IHorseRidingDayQ): boolean {
    let isSolved = true
    dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        if (!training.horse) {
          isSolved = false
          return
        }
      })
    })
    return isSolved
  }


  public getAllKidos(): IKido[] {
    return this.allKidos;
  }

  public getAllHorsosString(): string[] {
    return this.allHorsosString;
  }

  protected getPatternByName(name: string): IInterfaceObj[] {
    switch (name) {
      case 'dayKeys':
        return [
          {req: true, key: 'day', type: 'string', minL: 10, maxL: 10}, //todo regEx
          {req: false, key: 'dailyExcludes', type: 'object', isArr: true},
          {req: true, key: 'hours', type: 'object', isArr: true, minL: 1},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
          {req: true, key: 'timeResInMinutes', type: 'number', minV: 60, maxV: 60} //fix hour resolution for a start
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
          {req: false, key: 'horse', type: 'string', minL: 2, maxL: 20},
        ]
      default:
        return []
    }
  }
}