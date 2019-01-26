import {
  default as DataModel, IHorseRidingDay, IHorseRidingDayQ, IHorseRidingHour,
  IHorseRidingHourQ, IHorso, IKido, ITrainingDetail, PrefType
} from "./DataModel";
import {Database} from "./Database";
import Utils from "./Utils";

//just for tests  todo rm
const tableHelper = require('../../test/tableHelper.js')

interface IRankedHourlySolution {
  solutionDetails: ITrainingDetail[],
  rank: number
}

interface IResultList {
  results: IHorseRidingHour[]
  errorMsg?: string
}

interface IBestSolution {
  solution: IHorseRidingDay
  errorMsg?: string
}

interface IMatchOptionInfo {
  horso: string,
  kido: string,
  penalty: number
}

export default class MatchingEngine {

  /* --- Source query --- */
  private dailyQuery: IHorseRidingDayQ

  /* --- Data structures --- */
  public allHorsos: string[] = []
  private avaHorsos: string[] = []
  private kidosInQueryD: string[] = [] //ACHTUNG! - those are distinguishable kidos, not all kidos in query
  private allKidosInQuery: string[] = []
  private kidosPrefs: { [kidoName: string]: PrefType } = {}
  /* dailyPenaltyIdx: number of occurrence of horse on each kido's pref level (global), and higher levels(global)
    + (index level (each kido) * (number of available horses in sables)^2) */
  private dailyPenaltyIdx: { [kidoName: string]: { [horsoName: string]: number } } = {}
  private dailySearchOrder: { [kidoName: string]: IMatchOptionInfo [] } = {} //ordered list of all horses by it's rank by kido - order list of object with extra info

  /* --- Calculation results --- */
  //intermediate solution - sorted list of solutions for every hour, so first level are hours 1-8, and second level are solutions
  private qInProc: IRankedHourlySolution[][] = []


  constructor(protected db: Database) {
  }

  //exposed main method, asked from outside of class
  public async getMatches(dailyQuery: IHorseRidingDayQ): Promise<IBestSolution> {

    this.dailyQuery = dailyQuery

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
      if (!this.qInProc[hourNo]) {
        return this.mapResultsToISolution(dailyQuery, {
          results: [],
          errorMsg: `There were no solutions for hour no.: ${hourNo}`
        })
      }

      console.log(this.qInProc[hourNo]) // todo rm
      hourNo++
    }


    //update Ranks (juz nie pamietam o co chodzilo) - trzeba to sprawdzic chyba
    //qInProc.forEach(hourList => hourList.forEach(hour => this.updateRanks(hour)))

    return this.mapResultsToISolution(dailyQuery, {results: []})
    //todo this is ok -> return this.mapResultsToISolution(dailyQuery, this.combineHoursLimited(dailyQuery))
    //return this.mapResultsToISolution(dailyQuery, this.combineHoursLimited(dailyQuery))
    // -> formatting to IHorseRidingDay on client side

  }

  private mapResultsToISolution(dailyQuery: IHorseRidingDayQ, results: IResultList): IBestSolution {
    if (!results.results.length && !results.errorMsg) {
      return {solution: {day: '', remarks: '', hours: []}, errorMsg: `Som Ting Rilly Wong`}
    }
    dailyQuery.remarks = dailyQuery.remarks ? dailyQuery.remarks : ''
    if (!results.results.length && results.errorMsg) {
      return {solution: {day: dailyQuery.day, remarks: dailyQuery.remarks, hours: []}, errorMsg: results.errorMsg}
    }
    return {solution: {day: dailyQuery.day, remarks: dailyQuery.remarks, hours: results.results}}
  }

  private async initScopeVariables(): Promise<string> {

    /*  Drop calculation-wise cache  */
    this.clearScopeVariables()

    /*  Checking of global conditions - if there is enough horses  */
    await this.initAllHorsosInStables()
    let minHorsosReq: number = 0
    this.dailyQuery.hours.forEach(hour => hour.trainingsDetails.forEach(training => {
      minHorsosReq++
    }))
    if (this.allHorsos.length < minHorsosReq) {
      return `All horses in stable: ${this.allHorsos.length} is less then required: ${minHorsosReq}`
    }
    this.initAvailableHorses()
    if (this.avaHorsos.length < minHorsosReq) {
      return `Horses available: ${this.avaHorsos.length} is less then required: ${minHorsosReq}`
    }

    /*  Update preferences and create index type  */
    let kidosWithIncompletePrefs = await this.updateKidosPreferences()
    if (!!kidosWithIncompletePrefs.length) {
      return `Preferences for: ${kidosWithIncompletePrefs.join(', ')} are incomplete or incorrect`
    }

    /*  Count penalty points for kido-horso combination, and set searching order*/
    this.countPenaltyPointsAndOrder()

    return ''
  }

  private clearScopeVariables() {
    this.allHorsos = []
    this.avaHorsos = []
    this.kidosInQueryD = []
    this.kidosPrefs = {}
    this.dailyPenaltyIdx = {}
    this.dailySearchOrder = {}
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


    //todo - just for presentation
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


    //todo - just for presentation
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
  }

  private initAllKidosInQuery() {
    this.dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        this.allKidosInQuery.push(training.kidName)
      })
    })
  }

  private countPenaltyPointsAndOrder() {
    this.initAllKidosInQuery()
    // Counts amount of occurrence for each horse in this and higher levels and store it in temporary object 'penaltForFreq'
    let penaltyForFreq: { [prefCat: string]: { [horsoName: string]: number } } = {}
    let penaltyFromUpperLevels: { [horsoName: string]: number } = {}

    DataModel.incPrefCat.forEach(prefCat => {
      penaltyForFreq[prefCat] = {}
      this.allKidosInQuery.forEach(kidoName => {
        this.kidosPrefs[kidoName][prefCat].forEach(horso => {
          penaltyFromUpperLevels[horso] = penaltyFromUpperLevels[horso] ? penaltyFromUpperLevels[horso] : 0
          penaltyForFreq[prefCat][horso] = penaltyForFreq[prefCat][horso] ? penaltyForFreq[prefCat][horso] : 0
          penaltyForFreq[prefCat][horso] += 1 + penaltyFromUpperLevels[horso]
        })
      })
      Object.keys(penaltyForFreq[prefCat]).forEach(horso => {
        penaltyFromUpperLevels[horso] = penaltyFromUpperLevels[horso] ? penaltyFromUpperLevels[horso] : 0
        let storedValue: number = penaltyForFreq[prefCat][horso]
        penaltyForFreq[prefCat][horso] += penaltyFromUpperLevels[horso]
        penaltyFromUpperLevels[horso] += storedValue
      })
    })
    // Get the full penalty points rank for each horse of each kido
    this.kidosInQueryD.forEach(kido => {
      this.dailyPenaltyIdx[kido] = {}
      DataModel.incPrefCat.forEach(prefCat => {
        this.kidosPrefs[kido][prefCat].forEach(horso => {
          this.dailyPenaltyIdx[kido][horso] = penaltyForFreq[prefCat][horso] + DataModel.getPrefCatValue(prefCat) * this.avaHorsos.length ** 2
        })
      })
    })

    //Get the dailySearchOrder based on lowest dailyPenaltyIdx score
    Object.keys(this.dailyPenaltyIdx).forEach(kido => {
      this.dailySearchOrder[kido] = []
      DataModel.incPrefCat.forEach(prefCat => {
        let sortedHorsos = this.kidosPrefs[kido][prefCat].sort((h1, h2) => {
          return this.dailyPenaltyIdx[kido][h2] - this.dailyPenaltyIdx[kido][h1]
        })

        let kidosSearchOrder = sortedHorsos.map(horso => {
          return {horso, kido, penalty: this.dailyPenaltyIdx[kido][horso]}
        }).sort((match1, match2) => {
          return (match1.penalty - match2.penalty)
        })
        this.dailySearchOrder[kido] = this.dailySearchOrder[kido].concat(kidosSearchOrder)
      })
    })

    console.log('---search order table for whole day:---')
    tableHelper.tableSearchOrder(this.dailySearchOrder)
  }

  //recursively find solutions by dailySearchOrder and excluding horses from prefs
  private async hourlyMatching(hour: IHorseRidingHourQ, hourNo: number) {

    // first part - create a kidoCallingOrder which allows to always get a correctly sorted calling order
    // for next horse from searchOrders objects per each kid
    let allKidosThisHour: string[] = []
    hour.trainingsDetails.forEach(training => {
      allKidosThisHour.push(training.kidName)
    })

    // plain (single level) search order of all kidos for this hour
    let searchOrderForHour: IMatchOptionInfo[] = []
    allKidosThisHour.forEach(kido => {
      searchOrderForHour = searchOrderForHour.concat(this.dailySearchOrder[kido])
    })
    searchOrderForHour.sort((penaltyInfo1, penaltyInfo2) => {
      return (penaltyInfo1.penalty - penaltyInfo2.penalty)
    })

    console.log(`---search order for hour--- (length: ${searchOrderForHour.length})`)
    console.log(searchOrderForHour)

    let allOptionsSoFar: IMatchOptionInfo[] = []
    //firstly we have to make sure, that each kido have at least one horse (duplicates allowed) to start permutation generation
    let kidosIncludedInOptions: string[] = []
    while (true) {
      let currentOption = searchOrderForHour[0]
      if (!currentOption) {
        throw new Error(`Impossible happened: condition for calculation initialization are not sufficient:
         hourNo:${hourNo}; searchOrderForHour: ${JSON.stringify(searchOrderForHour)}`)
      }
      if (!kidosIncludedInOptions.includes(currentOption.kido)) {
        kidosIncludedInOptions.push(currentOption.kido)
      }
      if (kidosIncludedInOptions.length !== allKidosThisHour.length) {
        allOptionsSoFar.push(currentOption)
        searchOrderForHour.shift()
      } else {
        break
      }
    }
    console.log('---allOptionsSoFar at the start---')
    console.log(allOptionsSoFar)

    //go back one step, so when getHourlyPermutation(..) will be call it will get first permutation
    let allOptionsFlexOrder = JSON.parse(JSON.stringify(allOptionsSoFar))

    let timeout = 50 * hour.trainingsDetails.length // + max 0,5 sec per hour scheduled for that day
    let resultsLimit = 20 * timeout
    /*generate new option, one by one and produce permutations as long as:
       - there are options left
       - the limit of result is not reached
       - the timeout flag is not raised
      if at least single solution is obtained will go until end, limit or timeout */
    await Utils.asyncWhile(
      () => {
        return (!!searchOrderForHour.length && this.qInProc[hourNo].length < resultsLimit)
      },
      () => {
        return (!!searchOrderForHour.length && this.qInProc[hourNo].length == 0)
      },
      async () => {
        let currentOption = searchOrderForHour.shift()
        if (currentOption) {
          // Permutations can be generated and stored in qInProc for every hour (which is first level of array).
          // For every new horse added to permutation set it gets combined with the other horses in order given by kidoCallingOrder
          // And then its get validated: complete + no repetition
          let permutation = this.getHourlyPermutation(allOptionsSoFar, allOptionsFlexOrder, currentOption, allKidosThisHour)
          allOptionsSoFar.push(currentOption)
          allOptionsFlexOrder.push(currentOption)
          if (permutation) {
            this.qInProc[hourNo].push(permutation)
          }
        }

        //todo rm
        console.log('   ...')
      }, timeout)
  }


  // get new valid permutations generated by adding currentOption to allOptionsSoFar list and finally putting it to qInProc
  // permutation are taken in order by kidoCallingOrder
  private getHourlyPermutation(allOptionsSoFar: IMatchOptionInfo[], allOptionsFlexOrder: IMatchOptionInfo[],
                               currentOption: IMatchOptionInfo, allKidosThisHour: string[]): IRankedHourlySolution | null {


    //nc2) we create all available permutations: this is similar to Dijkstra algorithm, if there is none return null

    // 0 create new object (copy) of allOptionsSoFar  -> allOptionsFlexOrder -CHECKED
    // 1 take a first kido from allOptionsSoFar (it has the lowest possible penalty)
    // 2 go one-by-one through allOptionsSoFar () and find the first valid solution () - assign it with total penalty property
    // if no solutions return null


    /*think about such exemplary cases of searchOrder:
  ┌─────────┬─────────┬─────┬─────┬─────┐
  │ (index) │ penalty │  C  │  A  │  B  │
  ├─────────┼─────────┼─────┼─────┼─────┤
  │    0    │    1    │ 'a' │     │     │
  │    1    │    3    │ 'b' │     │     │
  │    2    │    3    │     │     │ 'a' │
  │    3    │    3    │     │ 'c' │     │
  │    4    │   18    │ 'c' │     │     │
  │    5    │   18    │     │     │ 'c' │
  │    6    │   21    │     │     │ 'b' │
  │    7    │   21    │     │ 'b' │     │
  │    8    │   37    │     │ 'a' │     │
  │    9    │   50    │     │     │ 'e' │
  │   10    │   50    │ 'e' │     │     │
  └─────────┴─────────┴─────┴─────┴─────┘

  ┌─────────┬─────────┬─────┬─────┬─────┐
  │ (index) │ penalty │  C  │  A  │  B  │
  ├─────────┼─────────┼─────┼─────┼─────┤
  │    0    │    1    │ 'b' │     │     │
  │    1    │    3    │     │ 'a' │     │
  │    2    │    3    │     │     │ 'a' │
  │    3    │    3    │ 'a' │     │     │
  │    4    │   18    │ 'c' │     │     │
  │    5    │   18    │     │     │ 'c' │
  │    6    │   21    │     │     │ 'b' │
  │    7    │   21    │     │ 'b' │     │
  │    8    │   37    │     │ 'c' │     │
  │    9    │   50    │     │     │ 'e' │
  │   10    │   50    │ 'e' │     │     │
  └─────────┴─────────┴─────┴─────┴─────┘

  */

    // 3 take a second kido from allOptionsSoFar (second lowest penalty), starting from the second, and going down
    // 4 go through allOptionsSoFar and find the first solution () - assign it with total penalty property (2)
    // 5 if penalty from 3 > 1 change order of elements 1 and 2 in allOptionsFlexOrder, and compare 2 and 3 (recursive procedure)
    // 6 else validate (check if no repetitions), and add new lowest penalty solution (newSolution)
    // 7 get next solution from fixed allOptionsSoFar (as input take newSolution -> this gives new start point for search)
    // 8 go to 3


    return {
      rank: Math.floor(Math.random() * 50),
      solutionDetails: [{horse: 'a', kidName: 'A'}, {horse: 'b', kidName: 'B'}, {horse: 'c', kidName: 'C'}]
    } //todo rm stub
  }

  /*private updateRanks(oldRankedSolution: IRankedHourlySolution): IRankedHourlySolution {
    let updatedRankedSolution = {}
    return updatedRankedSolution
  }*/

  /*private combineHoursLimited(dailyQuery: IHorseRidingDayQ): IResultList {
    this.breakDailyCalc = false
    let totalTrainings = 0
    dailyQuery.hours.forEach(hour => {
      totalTrainings += hour.trainingsDetails.length
    })
    let limitForTime = 100 * totalTrainings * this.avaHorsos.length // + max ~5s to juxtapose results
    let limitForPossiblities = 20 * limitForTime

    this.combineHoursWorker(limitForPossiblities)

    setTimeout(() => {
      this.breakDailyCalc = true
    }, limitForTime)
    if (this.resultList.results.length) {
      return this.resultList
    } else {
      return {results: [], errorMsg: `Could not find any good results :(`}
    }
  }*/

  //todo search for permutation by expanding an input set by rank
  /*private combineHoursWorker(limit: number) {
    //juxtapose qInProc object

    /!*generate new option, one by one and produce permutations as long as:
       - there are options left
       - the limit of result is not reached
       - the timeout flag is not raised *!/
    while (true && this.resultList.results.length < limit && !this.breakDailyCalc) {

    }
  }*/


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
Then all the horses included in the modified preferences are ranked (in hour scope). This rank represent a usability measure of each horse for each kido and for operator.
The measure is calculated as follows: number of occurrence of horse on each kido's pref level, and higher levels  + (index level * (number of available horses in sables)^2)

#Hourly matching
The goal of hourly matching is to create a sorted list of best possible solutions of matching problem
The idea is to iterate over horses starting from those with lowest rank, and recursively add solutions to the list
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