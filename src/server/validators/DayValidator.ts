import _ = require('lodash')
import {BaseValidator} from "./BaseValidator";
import {
  default as Preferences,
  IHorseRidingDay,
  IHorseRidingDayQ,
  IHorso,
  IInstructo,
  IKido
} from "../DataModel";
import {Database} from "../Database";
import Utils from "../utils/Utils";

export abstract class  DayValidator extends BaseValidator {

  protected db: Database
  protected userName: string

  protected allHorsos: IHorso[]
  protected allHorsosString: string[]
  protected allKidos: IKido[]
  protected allKidosString: string[]
  protected allTrainers: IInstructo[]
  protected allTrainersString: string[]

  protected kidosStrInQuery: string[] = []
  protected kidosInQuery: IKido[] = []

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

  protected patternHorseRidingDay(toBeDailyQuery: any): string | undefined{
    let errorMsg = this.patternCheck(toBeDailyQuery, 'dayKeys')
    if (errorMsg) {
      return errorMsg
    }
    for(let hour of toBeDailyQuery.hours){
      errorMsg = this.patternCheck(hour, 'hourKeys')
      if (errorMsg) {
        return errorMsg
      }
      for( let training of hour.trainingsDetails){
        let errorMsg = this.patternCheck(training, 'trainingKeys')
        if (errorMsg) {
          return errorMsg
        }
      }
    }
    return ''
  }

  protected dayNameIsValid(day: IHorseRidingDayQ | IHorseRidingDay): string | undefined{
    let validDate: boolean = day.day.length == 10
    if (validDate) {
      let daySplit: string[] = day.day.split('-')
      let daySplitNo: number[] = daySplit.map(text => {
        return parseInt(text)
      })
      validDate = validDate && ((daySplitNo[0] >= 2019) && (daySplitNo[0] <= 2099))
        && ((daySplitNo[1] > 0) && (daySplitNo[1] <= 12)) && ((daySplitNo[2] > 0) && (daySplitNo[2] <= 31))
      let date = (new Date(day.day))
      validDate = validDate && !isNaN(date.getTime()) && (daySplitNo[2] === date.getDate())
    }
    if (!validDate) {
      return `Day name: ${day.day} is not ok. Apply following format: YYYY-MM-DD`
    }
    return
  }

  protected async dayAlreadyExists(day: IHorseRidingDayQ | IHorseRidingDay): Promise<string | undefined> {
    if ((await this.db.find('diary', {userName: this.userName, day: day.day})).length) {
      return `Entry by day: ${day.day} already exists`
    }
    return
  }

  protected hourFieldIsValid(day: IHorseRidingDayQ | IHorseRidingDay): string | undefined{
    // hour name is valid
    let hourNames: string[] = (day.hours as any).map( (hourInfo: any)=> {
      return hourInfo.hour
    })
    for (let hourInfo of day.hours) {
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
    return
  }

  protected entriesInQueryExistsInDb(day: IHorseRidingDayQ | IHorseRidingDay): string | undefined {
    let kidosStrInQuery: string[] = []
    for (let hourInfo of day.hours) {
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
    return
  }

  protected entriesForEachHourDoesNotRepeat(day: IHorseRidingDayQ | IHorseRidingDay): string | undefined{
    for (let hourInfo of day.hours) {
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
      if (Utils.strArrHasDuplicates(allKidosThisHour)) {
        return `Kidos were duplicated for: ${hourName} `
      }
      if (Utils.strArrHasDuplicates(hourInfo.trainer)) {
        return `Trainers were duplicated for: ${hourName} `
      }
    }
  }

  protected kidosHasOnlyValidHorsesInPrefs(): string | undefined{
    for (let kido of this.kidosInQuery) {
      let allHorsesInPrefs: string[] = Preferences.flatListForAllLevels(kido.prefs)
      for (let horse of allHorsesInPrefs) {
        if (!this.allHorsosString.includes(horse)) {
          return `: ${kido.name} have a non-existing horse: ${horse} in preferences`
        }
      }
    }
    return
  }
}