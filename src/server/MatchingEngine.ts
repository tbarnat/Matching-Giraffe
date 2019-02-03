import {
  default as DataModel, IHorseRidingDayQ, IHorseRidingHourQ, IHorso, IKido, PrefType,
  IMatchOptionInfo, IRankedHourlySolution, IBestSolution, IResultList, IHorseRidingHour
} from "./DataModel";
import {Database} from "./Database";
import Utils from "./Utils";
import SearchList from "./SearchList";

//just for tests  todo rm
const tableHelper = require('../../test/tableHelper.js')


export default class MatchingEngine {

  /* --- Model settings --- */
  private horsoMaxHoursPerDay: number = 3

  /* --- Source query --- */
  private dailyQuery: IHorseRidingDayQ

  /* --- Data structures --- */
  public allHorsos: string[] = []
  private avaHorsos: string[] = []
  private kidosInQueryD: string[] = [] //those are distinguishable kidos, not all kidos in query
  private allKidosInQuery: string[] = []
  private kidosPrefs: { [kidoName: string]: PrefType } = {}
  private dailySearchOrder: SearchList //ordered list of all horses by it's cost by kido - order list of object with extra info

  /* --- Calculation results --- */
  //intermediate solution - sorted list of solutions for every hour, so first level are hours 1-8, and second level are solutions
  private qInProc: IRankedHourlySolution[][] = []


  constructor(protected db: Database) {
  }

  //exposed main method, asked from outside of class
  public async getMatches(dailyQuery: IHorseRidingDayQ): Promise<IBestSolution | void> {

    //todo - consider try-catch

    this.dailyQuery = dailyQuery
    console.log('daily query:', JSON.stringify(this.dailyQuery))

    let errorMsg = await this.initScopeVariables()
    if (errorMsg) {
      return this.mapResultsToISolution(dailyQuery, {results: [], errorMsg: `${errorMsg}`})
    }

    /*  Finding solutions for every hour separately  */
    let hourNo: number = 0

    for (let hour of dailyQuery.hours) {
      //this.breakHourlyCalc = false
      this.qInProc[hourNo] = []
      await this.hourlyMatching(hour, hourNo)
      if (!this.qInProc[hourNo].length) {
        return this.mapResultsToISolution(dailyQuery, {
          results: [],
          errorMsg: `There were no solutions for hour No.: ${hourNo} (${hour.hour})`
        })
      }

      console.log(` -- number of soultions for hour no. ${hour.hour}: `, this.qInProc[hourNo].length) // todo rm
      hourNo++
    }

    //return this.mapResultsToISolution(dailyQuery, {results: []})
    return this.mapResultsToISolution(dailyQuery, this.combineHours())
  }

  private async initScopeVariables(): Promise<string> {

    /*  Drop calculation-wise cache  */
    this.clearSomeScopeVariables()

    /*  Checking of global conditions - if there is enough horses  */
    await this.initAllHorsosInStables()
    let minHorsosReqHourly: number = 0
    let minHorsosReqDaily: number = 0
    this.dailyQuery.hours.forEach(hour => {
      minHorsosReqHourly = Math.max(hour.trainingsDetails.length, minHorsosReqHourly)
    })
    this.dailyQuery.hours.forEach(hour => hour.trainingsDetails.forEach(training => {
      minHorsosReqDaily++
    }))
    if (this.allHorsos.length < minHorsosReqHourly) {
      return `All horses in stable: ${this.allHorsos.length} is less than required ${minHorsosReqHourly} per single hour`
    }
    if (this.allHorsos.length * this.horsoMaxHoursPerDay < minHorsosReqDaily) {
      return `All horses in stable: ${this.avaHorsos.length} is less than required: ${minHorsosReqDaily} for whole day`
    }
    this.initAvailableHorses()
    if (this.avaHorsos.length < minHorsosReqHourly) {
      return `Horses available: ${this.avaHorsos.length} is less than required ${minHorsosReqHourly} per single hour`
    }
    if (this.avaHorsos.length * this.horsoMaxHoursPerDay < minHorsosReqDaily) {
      return `Horses available: ${this.avaHorsos.length} is less than required ${minHorsosReqDaily} for whole day`
    }


    /*  Checking if kidos for every particular hour are distinct  */
    this.dailyQuery.hours.forEach((hour, hourNo) => {
      let kidosThisHour: string[] = []
      hour.trainingsDetails.forEach(training => {
        kidosThisHour.push(training.kidName)
      })
      kidosThisHour.sort()
      let duplicates = []
      for (let i = 0; i < kidosThisHour.length; i++) {
        if (kidosThisHour[i + 1] == kidosThisHour[i]) {
          duplicates.push(kidosThisHour[i]);
        }
      }
      if (duplicates.length) {
        return `Training number: ${hourNo + 1} have duplicated kids: ${duplicates.join(', ')}`
      }
    })

    /*  Update preferences  */
    let kidosWithIncompletePrefs = await this.updateKidosPreferences()
    if (!!kidosWithIncompletePrefs.length) {
      return `Preferences for: ${kidosWithIncompletePrefs.join(', ')} are incomplete or incorrect`
    }

    /*  Count cost points for kido-horso combination, and set searching order*/
    this.countCostPointsAndOrder()

    return ''
  }

  private clearSomeScopeVariables() {
    this.allHorsos = []
    this.avaHorsos = []
    this.kidosInQueryD = []
    this.kidosPrefs = {}
  }

  private async initAllHorsosInStables() {
    this.allHorsos = ((await this.db.find('horsos')) as IHorso[]).map(horso => horso.name)
  }

  private initAvailableHorses() {
    this.avaHorsos = this.allHorsos.filter(horsoName => {
      return !this.dailyQuery.dailyExcludes.includes(horsoName)
    })
  }

  private async updateKidosPreferences(): Promise<string[]> {
    this.initDistKidosInQuery()

    let allKidos = ((await this.db.find('kidos')) as IKido[])


    //rm just for presentation
    console.log('---raw kido preferences:---')
    tableHelper.tablePreferences(allKidos)


    allKidos.filter(kido => {
      return (this.kidosInQueryD.includes(kido.name))
    }).forEach(kido => {
      //filter the daily excludes
      this.kidosPrefs[kido.name] = {}
      Object.keys(kido.prefs).forEach(category => {
        this.kidosPrefs[kido.name][category] = kido.prefs[category].filter(horso => {
          return !this.dailyQuery.dailyExcludes.includes(horso)
        })
      })
    })


    //this is just for presentation
    let kidosWithoutExcludedHorses: any[] = []
    Object.keys(this.kidosPrefs).forEach(kidoName => kidosWithoutExcludedHorses.push({
      name: kidoName,
      prefs: this.kidosPrefs[kidoName]
    }))
    console.log('---preferences after filtering of excluded horses:---')
    tableHelper.tablePreferences(kidosWithoutExcludedHorses)


    // check if each kidosPref table comprise exactly the number available horses
    let kidosWithIncompletePrefs: string[] = []
    Object.keys(this.kidosPrefs).forEach(kido => {
      let kidosHorsesInPrefs: number = 0
      DataModel.allPrefCat.forEach(prefCat => {
        kidosHorsesInPrefs += this.kidosPrefs[kido][prefCat].length
      })
      if (kidosHorsesInPrefs != this.avaHorsos.length) {
        kidosWithIncompletePrefs.push(kido)
      }
    })
    return kidosWithIncompletePrefs
  }

  private initDistKidosInQuery() {
    this.dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        if (this.kidosInQueryD.indexOf(training.kidName) < 0) {
          this.kidosInQueryD.push(training.kidName)
        }
      })
    })
    this.dailySearchOrder = new SearchList(this.kidosInQueryD.length)
  }


  // Not sure but I think I made an assumptions that duplicates kidos (not distinct) are allowed here
  private initAllKidosInQuery() {
    this.dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        this.allKidosInQuery.push(training.kidName)
      })
    })
  }

  private countCostPointsAndOrder() {
    this.initAllKidosInQuery()
    // Counts amount of occurrence for each horse in this and higher levels and store it in temporary object 'penaltForFreq'
    let costForFreq: { [prefCat: string]: { [horsoName: string]: number } } = {}
    let costFromUpperLevels: { [horsoName: string]: number } = {}

    DataModel.incPrefCat.forEach(prefCat => {
      costForFreq[prefCat] = {}
      this.allKidosInQuery.forEach(kidoName => {
        this.kidosPrefs[kidoName][prefCat].forEach(horso => {
          costFromUpperLevels[horso] = costFromUpperLevels[horso] ? costFromUpperLevels[horso] : 0
          costForFreq[prefCat][horso] = costForFreq[prefCat][horso] ? costForFreq[prefCat][horso] : 0
          costForFreq[prefCat][horso] += 1 + costFromUpperLevels[horso]
        })
      })
      Object.keys(costForFreq[prefCat]).forEach(horso => {
        costFromUpperLevels[horso] = costFromUpperLevels[horso] ? costFromUpperLevels[horso] : 0
        let storedValue: number = costForFreq[prefCat][horso]
        costForFreq[prefCat][horso] += costFromUpperLevels[horso]
        costFromUpperLevels[horso] += storedValue
      })
    })
    /* Calculate cost points and populate dailySearchOrder object
       cost = number of occurrence of horse on each kido's pref level (global), and higher levels(global)
              + (globalIndex level (each kido) * (number of available horses in sables)^2) */
    let flatOptionList: IMatchOptionInfo[] = []
    this.kidosInQueryD.forEach(kido => {
      DataModel.incPrefCat.forEach(prefCat => {
        this.kidosPrefs[kido][prefCat].forEach(horso => {
          let cost = costForFreq[prefCat][horso] + DataModel.getPrefCatValue(prefCat) * this.avaHorsos.length ** 2
          flatOptionList.push({kido, horso, cost})
        })
      })
    })

    flatOptionList.sort((item1, item2) => {
      return item1.cost - item2.cost
    })
    flatOptionList.forEach(option => {
      this.dailySearchOrder.push(option)
    })

    console.log('---search order table for whole day: (sorted by cost)---')
    let tempDailySearchOrder = this.dailySearchOrder.getFullListObject()
    tableHelper.tableSearchOrder(tempDailySearchOrder)
  }

  private mapResultsToISolution(dailyQuery: IHorseRidingDayQ, results: IResultList): IBestSolution {
    if (!results.results.length && !results.errorMsg) {
      return {solution: {day: '', remarks: '', hours: []}, errorMsg: `Som Ting Rilly Wong`}
    }
    dailyQuery.remarks = dailyQuery.remarks ? dailyQuery.remarks : undefined
    if (!results.results.length && results.errorMsg) {
      return {solution: {day: dailyQuery.day, remarks: dailyQuery.remarks, hours: []}, errorMsg: results.errorMsg}
    }

    //todo should be corrected -
    return {solution: {day: dailyQuery.day, remarks: dailyQuery.remarks, hours: results.results}}
  }

  //recursively find solutions by dailySearchOrder and excluding horses from prefs
  private async hourlyMatching(hour: IHorseRidingHourQ, hourNo: number) {

    //console.log(`hourly matching for hour No. ${hour.hour}`)

    let allKidosthisHour: string[] = []
    hour.trainingsDetails.forEach(training => {
      allKidosthisHour.push(training.kidName)
    })

    console.log('this.dailySearchOrder',this.dailySearchOrder.totalLength())

    // this is a donor object, which will be shifted one at a time
    let hourlySearchList: SearchList = new SearchList(allKidosthisHour.length, this.dailySearchOrder.getSubListObject(allKidosthisHour))
    console.log('hourlySearchList',hourlySearchList.totalLength())
    // this is a taker object, which will be pushed one at a time
    let allOptionsSoFar: SearchList = new SearchList(allKidosthisHour.length)

    console.log('allOptionsSoFar',allOptionsSoFar.totalLength())

    let timeout = 50 * hour.trainingsDetails.length // + max 0,5 sec per hour scheduled for that day
    let resultsLimit = 20 * timeout
    // generate new option, one by one until at least single solution is obtained then (strongLogicalCondition) until end,
    // limit or timeout (softLogicalCondition)
    await Utils.asyncWhile(
      () => {
        return (!!hourlySearchList.totalLength() && this.qInProc[hourNo].length < resultsLimit)
      },
      () => {
        return (!!hourlySearchList.totalLength() && this.qInProc[hourNo].length == 0)
      },
      async () => {

        // console.log('\n\n  --- allOptionsSoFar at next iteration ---  ')

        let currentOption: IMatchOptionInfo | null = hourlySearchList.shift()
        if (currentOption) {
          // Every new kido-horse-cost (currentOption) added to permutation set (allOptionsSoFar)
          // is generation new valid permutations or returns null
          let permutations = allOptionsSoFar.getPermutations(currentOption)
          allOptionsSoFar.push(currentOption)
          if (permutations) {
            this.qInProc[hourNo] = this.qInProc[hourNo].concat(permutations)
          }
        }
        // console.log('                                                          ............. getting next combinations')
      }, timeout)

    //ascending sort of the resulting solutions by its cost
    this.qInProc[hourNo].sort((solution1, solution2) => {
      return solution1.cost - solution2.cost
    })

  }

  //todo
  private combineHours(): IResultList {

    //temporary assume, that 3 hour max
    if (this.dailyQuery.hours.length <= this.horsoMaxHoursPerDay) {
      let results: IHorseRidingHour[] = []
      this.dailyQuery.hours.forEach((hourDetails, i) => {
        results.push({
          hour: hourDetails.hour,
          trainer: hourDetails.trainer,
          trainingsDetails: this.qInProc[i][0].solutionDetails
        })
      })
      return {results}
    }

    return {results: []}

    //this should generate solutions in asyncWhile with timeout, limits and stuff
    //the results could be potentially stored

    /*
export interface IResultList {
  results: {
      hour: string,
      trainer: string[],
      trainingsDetails: ITrainingDetail[]
    }[] //array of a single result for every hour in daily query
  errorMsg?: string
}


export interface IRankedHourlySolution {
  solutionDetails: ITrainingDetail[],
  cost: number
}



    */
  }


}

/*Horse Matcher algorithm engine:

#Assumptions:
There are five levels of preferences for each kido. The last one is special level - excludes.
THe levels are: Best / Nice / Ok / Rather not / Excludes
For new kidos all the horses are added to the third group by default.

#Data preparation:
The condition for matching possibility should be evaluated Trainings <= all hourses in sable * max hourse trainings per day
At first all the preferences are modified to remove all the dailyExcludes: from users pref. and from the operator input (some horses which are for examples injured that day)
Calculation is divided in hourly parts - each hour is one calculation which are combined later on.
Then all the horses included in the modified preferences are ranked (in hour scope). This cost represent a usability measure of each horse for each kido and for operator.
The measure is calculated as follows: number of occurrence of horse on each kido's pref level, and higher levels  + (globalIndex level * (number of available horses in sables)^2)

#Hourly matching
The goal of hourly matching is to create a sorted list of best possible solutions of matching problem
The idea is to iterate over horses starting from those with lowest cost, and recursively add solutions to the list
The solutions is stored with solution score
The calculation should be stopped after (50ms x number of trainings) or (100 x number of trainings) Traing = osobojazda
The solution scores should be updated for sake of calculations usability important for next calculation stage:

let scoreUpdateablePart = score % availableHourses ** 2
scoreUpdateablePart = scoreUpdateablePart / (numberOfTrainingInThisHour ** 2)
let newScore = score - score % availableHourses ** 2 + scoreUpdateablePart

this is kinf of correction allowing comparison of hours with any and few kidos
Sort the hourly sollutions by updated score

#JunxtaposeHours
At this point you have a hourly arrays of solutions which you have to permute
Create permutation in a increasing manner (look for lower 'newScore' value for any hour and find all new permutation with this element)
If the new permutation does not fulfill the max three hours condition for any hourse - discard it.
The calculation should be stopped after (100ms x number of hours x available horses) or (1000 x number of hours x total hourses in stables)
The result is already sorted it can be returned to the frontend, scores can be discarded
*/