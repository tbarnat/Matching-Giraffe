import {Database} from "../Database";
import {IHorseRidingDayQ, IHorso, IInstructo, IKido, default as Preferences} from "../DataModel";
import _ = require('lodash')
import Utils from "../utils/Utils";
import {BaseValidator, IInterfaceObj} from "./BaseValidator";

export default class QueryValidator extends BaseValidator {

  private allHorsos: IHorso[]
  private allHorsosString: string[]
  private allKidos: IKido[]
  private allKidosString: string[]
  private allTrainers: IInstructo[]
  private allTrainersString: string[]

  constructor(private userName: string, private db: Database) {
    super()
  }

  public async init() {
    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {userName: this.userName}))
    promiseArr.push(this.db.find('kidos', {userName: this.userName}))
    promiseArr.push(this.db.find('trainers', {userName: this.userName}))
    let resolvedArr = await Promise.all(promiseArr)
    this.allHorsos = (resolvedArr[0] as IHorso[])
    this.allHorsosString = this.allHorsos.map(horso => horso.name)
    this.allKidos = resolvedArr[1] as IKido[]
    this.allKidosString = this.allKidos.map(kido => kido.name)
    this.allTrainers = resolvedArr[2] as IInstructo[]
    this.allTrainersString = this.allTrainers.map(trainer => trainer.name)
  }

  // returns error msg or empty string
  public async validateDailyQuery(toBeDailyQuery: any): Promise<string> {

    let errorMsg = this.patternCheck(toBeDailyQuery, 'dayKeys')
    if (errorMsg) {
      return errorMsg
    }
    toBeDailyQuery.hours.forEach((hour: any) => {
      let errorMsg = this.patternCheck(hour, 'hourKeys')
      if (errorMsg) {
        return errorMsg
      }
      hour.trainingsDetails.forEach((training: any) => {
        let errorMsg = this.patternCheck(training, 'trainingKeys')
        if (errorMsg) {
          return errorMsg
        }
      })
    })
    let dailyQuery = toBeDailyQuery as IHorseRidingDayQ

    // checking if 'day' name is valid - it should be done with regex
    let validDate: boolean = dailyQuery.day.length >= 10 && dailyQuery.day.length < 15
    if (validDate) {
      let daySplit: string[] = dailyQuery.day.split('-')
      let daySplitNo: number[] = daySplit.map(text => {
        return parseInt(text)
      })
      validDate = validDate && ((daySplitNo[0] >= 2019) && (daySplitNo[0] <= 2099))
        && ((daySplitNo[1] > 0) && (daySplitNo[1] <= 12)) && ((daySplitNo[2] > 0) && (daySplitNo[2] <= 31))
      let date = (new Date(dailyQuery.day.substr(0, 10)))
      validDate = validDate && !isNaN(date.getTime()) && (daySplitNo[2] === date.getDate())
    }
    if (!validDate) {
      return `Day name: ${dailyQuery.day} is not ok. Apply following format: YYYY-MM-DD or YYYY-MM-DD-xxxx`
    }

    // checking if 'day' already exists in diary
    if ((await this.db.find('diary', {userName: this.userName, day: dailyQuery.day})).length) {
      return `Entry by day: ${dailyQuery.day} already exists`
    }

    // checking if 'hour' name is valid
    let hourNames: string[] = dailyQuery.hours.map(hourInfo => {
      return hourInfo.hour
    })
    for (let hourInfo of dailyQuery.hours) {
      let hourAsNumber = parseInt(hourInfo.hour)
      if (!(hourInfo.hour.length == 4 && hourAsNumber >= 0 && hourAsNumber < 2400)) {
        return `Hour name: ${hourInfo.hour} is not ok. Apply following format: hhmm`
      }
    }

    // checking if hourNames are ascending
    let hourNamesSortedCopy = JSON.parse(JSON.stringify(hourNames)).sort()
    if (!_.isEqual(hourNames, hourNamesSortedCopy)) {
      return `Hours are entered in non-ascending order`
    }

    // checking if entries exists in db
    let kidosStrInQuery: string[] = []
    for (let hourInfo of dailyQuery.hours) {
      for (let trainingDetails of hourInfo.trainingsDetails) {
        if (!this.allKidosString.includes(trainingDetails.kidName)) {
          return `Kid by the name: ${trainingDetails.kidName} does not exist in db`
        }
        kidosStrInQuery.push(trainingDetails.kidName)
        if (trainingDetails.horse) {
          trainingDetails.horse === '' ? trainingDetails.horse = undefined : null
        }
        if (trainingDetails.horse) {
          if (!this.allHorsosString.includes(trainingDetails.horse)) {
            return `Horse by the name: ${trainingDetails.horse} does not exist in db`
          }
        }
      }
      for (let trainer of hourInfo.trainer) {
        if (!this.allTrainersString.includes(trainer)) {
          return `Trainer by the name: ${trainer} does not exist in db`
        }
      }
    }
    for (let horseName of dailyQuery.dailyExcludes) {
      if (!this.allHorsosString.includes(horseName)) {
        return `Excluded horse by the name: ${horseName} does not exist in db`
      }
    }

    //entries for each hour does not repeat
    for (let hourInfo of dailyQuery.hours) {
      let hourName = hourInfo.hour
      let allHorsosThisHour: string[] = []
      let allKidosThisHour: string[] = []
      for (let trainingDetails of hourInfo.trainingsDetails) {
        allKidosThisHour.push(trainingDetails.kidName)
        if (trainingDetails.horse) {
          allHorsosThisHour.push(trainingDetails.horse)
        }
      }
      if (Utils.strArrHasDuplicates(allHorsosThisHour)) {
        return `Preselected horses were duplicated for: ${hourName} `
      }
      if (Utils.strArrHasDuplicates(allHorsosThisHour.concat(dailyQuery.dailyExcludes))) {
        return `Excluded horses were selected for ${hourName}`
      }
      if (Utils.strArrHasDuplicates(allKidosThisHour)) {
        return `Kidos were duplicated for: ${hourName} `
      }
      if (Utils.strArrHasDuplicates(hourInfo.trainer)) {
        return `Trainers were duplicated for: ${hourName} `
      }
    }

    // kidos in query has just the number of all possible horsos in its prefs
    let kidosInQuery: IKido[] = this.allKidos.filter(kido => {
      return kidosStrInQuery.includes(kido.name)
    })
    let allHorsosInStables = this.allHorsosString.length
    for (let kido of kidosInQuery) {
      if (Preferences.countItemsInPrefType(kido.prefs) != allHorsosInStables) {
        return `: ${kido.name} have incomplete preferences`
      }
    }

    // kidos in query has only valid horses in prefs
    for (let kido of kidosInQuery) {
      let allHorsesInPrefs: string[] = Preferences.flatListForAllLevels(kido.prefs)
      for (let horse of allHorsesInPrefs) {
        if (!this.allHorsosString.includes(horse)) {
          return `: ${kido.name} have a non-existing horse: ${horse} in preferences`
        }
      }
    }

    //looks as valid query
    return ''
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
          {req: true, key: 'day', type: 'string', minL: 10, maxL: 15}, //todo regEx
          {req: false, key: 'dailyExcludes', type: 'object', isArr: true},
          {req: true, key: 'hours', type: 'object', isArr: true, minL: 1},
          {req: false, key: 'remarks', type: 'string', maxL: 200},
          {req: true, key: 'timeResInMinutes', type: 'number', minV: 60, maxV: 60} //fix hour resolution for a start
        ]
      case 'hourKeys':
        return [
          {req: true, key: 'hour', type: 'number', minV: 0, maxV: 2400}, //todo regEx
          {req: true, key: 'trainer', type: 'object', isArr: true, minL: 2, maxL: 20},
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