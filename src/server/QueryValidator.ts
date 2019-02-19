import {Database} from "./Database";
import {IHorseRidingDayQ, IHorso, IInstructo, IKido, default as Preferences} from "./DataModel";
import _ = require('lodash')

export default class QueryValidator {

  private allHorsos: IHorso[]
  private allHorsosString: string[]
  private allKidos: IKido[]
  private allKidosString: string[]
  private allTrainers: IInstructo[]
  private allTrainersString: string[]

  constructor(private userName: string, private db: Database) {
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

    // hardcoded interface
    let dayKeys1 = ['dailyExcludes', 'day', 'hours', 'remarks']
    let dayKeys2 = ['dailyExcludes', 'day', 'hours']
    let hourKeys1 = ['hour', 'remarks', 'trainer', 'trainingsDetails']
    let hourKeys2 = ['hour', 'trainer', 'trainingsDetails']
    let trainingKeys1 = ['horse', 'kidName']
    let trainingKeys2 = ['kidName']

    //confirm field names
    let validStructure = true
    validStructure = validStructure && (_.isEqual(Object.keys(toBeDailyQuery).sort(), dayKeys1) || _.isEqual(Object.keys(toBeDailyQuery).sort(), dayKeys2))

    if (Array.isArray(toBeDailyQuery.hours)) {
      if (!toBeDailyQuery.hours.length) {
        return `Query with empty hours list`
      }
      toBeDailyQuery.hours.forEach((hour: any) => {
        validStructure = validStructure && (_.isEqual(Object.keys(hour).sort(), hourKeys1) || _.isEqual(Object.keys(hour).sort(), hourKeys2))
        //console.log(Object.keys(hour).sort(), hourKeys, 'lvl1')
        if (!Array.isArray(hour.trainer)) {
          return `Trainers for hour: \'${toBeDailyQuery.hours}\' is not an array.`
        }
        if (Array.isArray(hour.trainingsDetails)) {
          if (!hour.trainingsDetails.length) {
            return `Empty training details for hour: \'${toBeDailyQuery.hours}\'`
          }
          hour.trainingsDetails.forEach((training: any) => {
            validStructure = validStructure && (_.isEqual(Object.keys(training).sort(), trainingKeys1) || _.isEqual(Object.keys(training).sort(), trainingKeys2))
            //console.log(Object.keys(training).sort(), trainingKeys1, 'lvl2')
          })
        } else {
          return `Training details for hour: \'${toBeDailyQuery.hours}\' is not an array.`
        }
      })
    } else {
      return `List of hours is not an array.`
    }
    validStructure = validStructure && Array.isArray(toBeDailyQuery.dailyExcludes)

    if (!validStructure) {
      return 'Invalid query object structure (bad or misspelled keys)'
    }

    let dailyQuery = toBeDailyQuery as IHorseRidingDayQ

    // checking if 'day' name is valid
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
      return `Day name: \'${dailyQuery.day}\' is not ok. Apply following format: YYYY-MM-DD or YYYY-MM-DD-xxxx`
    }

    // checking if 'day' already exists in diary
    if ((await this.db.find('diary', {userName: this.userName, day: dailyQuery.day})).length) {
      return `Entry by day: \'${dailyQuery.day}\' already exists`
    }

    // checking if 'hour' name is valid
    let hourNames: string[] = dailyQuery.hours.map(hourInfo => {
      return hourInfo.hour
    })
    for (let hourInfo of dailyQuery.hours) {
      let hourAsNumber = parseInt(hourInfo.hour)
      if (!(hourInfo.hour.length == 4 && hourAsNumber >= 0 && hourAsNumber < 2400)) {
        return `Hour name: \'${hourInfo.hour}\' is not ok. Apply following format: hhmm`
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
          return `Kid by the name: \'${trainingDetails.kidName}\' does not exist in db`
        }
        kidosStrInQuery.push(trainingDetails.kidName)
        if (trainingDetails.horse) {
          trainingDetails.horse === '' ? trainingDetails.horse = undefined : null
        }
        if (trainingDetails.horse) {
          if (!this.allHorsosString.includes(trainingDetails.horse)) {
            return `Horse by the name: \'${trainingDetails.horse}\' does not exist in db`
          }
        }
      }
      for( let trainer of hourInfo.trainer) {
        if (!this.allTrainersString.includes(trainer)) {
          return `Trainer by the name: \'${trainer}\' does not exist in db`
        }
      }
    }
    for (let horseName of dailyQuery.dailyExcludes) {
      if (!this.allHorsosString.includes(horseName)) {
        return `Excluded horse by the name: \'${horseName}\' does not exist in db`
      }
    }

    // kidos in query has just the number of all possible horsos in its prefs
    let kidosInQuery: IKido[] = this.allKidos.filter(kido => {
      return kidosStrInQuery.includes(kido.name)
    })
    let allHorsosInStables = this.allHorsosString.length
    for(let kido of kidosInQuery) {
      if (Preferences.countItemsInPrefType(kido.prefs) != allHorsosInStables) {
        return ` \'${kido.name}\' have incomplete preferences`
      }
    }

    // kidos in query has only valid horses in prefs
    for(let kido of kidosInQuery) {
      let allHorsesInPrefs: string[] = Preferences.flatListForAllLevels(kido.prefs)
      for(let horse of allHorsesInPrefs){
        if (!this.allHorsosString.includes(horse)) {
          return ` \'${kido.name}\' have a non-existing horse: \'${horse}\' in preferences`
        }
      }
    }

    //looks as valid query
    return ''
  }

  public checkIfQueryIsAlreadySolved(dailyQuery: IHorseRidingDayQ): boolean{
    let isSolved = true
    dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        if(!training.horse){
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
}