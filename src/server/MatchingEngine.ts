import {
  default as DataModel, IHorseRidingDayQ, IHorseRidingHourQ, IHorso, IKido, PrefType,
  IMatchOptionInfo, IRankedHourlySolution, IBestSolution, IResultList, IHorseRidingHour, ITrainingDetail
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
    try {
      let startTime = Date.now()
      this.dailyQuery = dailyQuery
      console.log('daily query:', JSON.stringify(this.dailyQuery))

      let errorMsg = await this.initScopeVariables()
      if (errorMsg) {
        return this.mapResultsToISolution({results: [], errorMsg: `${errorMsg}`})
      }

      /*  Finding solutions for every hour separately  */
      let hourNo: number = 0

      for (let hour of this.dailyQuery.hours) {
        //this.breakHourlyCalc = false
        this.qInProc[hourNo] = []
        await this.hourlyMatching(hour, hourNo)
        if (!this.qInProc[hourNo].length) {
          return this.mapResultsToISolution({
            results: [],
            errorMsg: `There were no solutions for hour No.: ${hourNo} (${hour.hour})`
          })
        }

        console.log(`   -- number of solutions for hour no. ${hour.hour}: `, this.qInProc[hourNo].length)
        hourNo++
      }
      let workTime = Date.now() - startTime
      console.log(`Total time: ${workTime} [ms]`)

      return this.mapResultsToISolution(this.combineHours())
    } catch (err) {
      let str: string = err.stack
      return this.mapResultsToISolution({results: [], errorMsg: `${str.substring(0, 170)} ...`})
    }
  }

  private async initScopeVariables(): Promise<string> {

    //  Drop calculation-wise cache
    this.clearSomeScopeVariables()

    //  Checking of global conditions - if there is enough horses
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

    //  Checking if two horses are not preselected for the same hour
    //  Checking if no horses are preselected and excluded
    let allPreselectedHorses: string[] = []
    let preselectCollision: string | undefined
    this.dailyQuery.hours.forEach(hour => {
      let preselectedThisHour: string[] = []
      hour.trainingsDetails.forEach(training => {
        let currentHorso = training.horse
        if(currentHorso){
          if(preselectedThisHour.includes(currentHorso)){
            preselectCollision = `Horse: ${currentHorso} was preselected twice at ${hour.hour}`
            return
          }
          preselectedThisHour.push(currentHorso)
          if(!allPreselectedHorses.includes(currentHorso)){
            allPreselectedHorses.push(currentHorso)
          }
        }
      })
    })
    if(preselectCollision){
      return preselectCollision
    }
    let intersection = Utils.intersection(this.dailyQuery.dailyExcludes,allPreselectedHorses)
    if(intersection.length){
      return `Horse(s): ${intersection.join(',')} were both excluded and preselected`
    }

    //  Checking if kidos for every particular hour are distinct
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

    //  Update preferences
    let kidosWithIncompletePrefs = await this.updateKidosPreferences()
    if (!!kidosWithIncompletePrefs.length) {
      return `Preferences for: ${kidosWithIncompletePrefs.join(', ')} are incomplete or incorrect`
    }

    // Count cost points for kido-horso combination, and set searching order
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
        if (this.kidosInQueryD.indexOf(training.kidName) < 0 && !training.horse) {
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
        if(!training.horse){
          this.allKidosInQuery.push(training.kidName)
        }
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

  private mapResultsToISolution(results: IResultList): IBestSolution {
    if (!results.results.length && !results.errorMsg) {
      return {solution: {day: '', remarks: '', hours: []}, errorMsg: `Som Ting Wong`}
    }
    if (!results.results.length && results.errorMsg) {
      return {
        solution: {day: this.dailyQuery.day, remarks: this.dailyQuery.remarks, hours: []},
        errorMsg: results.errorMsg
      }
    }

    results.results.forEach(result => {
      let queryHour = this.dailyQuery.hours.find(hour => {
        return hour.hour === result.hour
      })
      if (queryHour && queryHour.remarks) {
        Object.assign(result, {remarks: queryHour.remarks})
      }
    })
    return {solution: {day: this.dailyQuery.day, remarks: this.dailyQuery.remarks, hours: results.results}}
  }

  //recursively find solutions by dailySearchOrder and excluding horses from prefs
  private async hourlyMatching(hour: IHorseRidingHourQ, hourNo: number) {

    //console.log(`hourly matching for hour No. ${hour.hour}`)

    let allUnmatchedKidosThisHour: string[] = []
    let allSelectedMatches: ITrainingDetail[] = []
    let horsosMatchedInQuery: string[] = []
    hour.trainingsDetails.forEach(training => {
      if (!training.horse) {
        allUnmatchedKidosThisHour.push(training.kidName)
      } else {
        allSelectedMatches.push({kidName: training.kidName, horse: training.horse})
        horsosMatchedInQuery.push(training.horse)
      }
    })

    //console.log('this.dailySearchOrder',this.dailySearchOrder.totalLength())

    // this is an unfiltered donor object, form which horses of preselected matches have to be removed
    let hourlySearchListUnfiltered: SearchList = new SearchList(allUnmatchedKidosThisHour.length, this.dailySearchOrder.getSubListForKidos(allUnmatchedKidosThisHour))

    // this is a donor object, which will be shifted one at a time
    let hourlySearchList: SearchList = new SearchList(allUnmatchedKidosThisHour.length, hourlySearchListUnfiltered.getSubListWithoutHorsos(horsosMatchedInQuery))

    //console.log('hourlySearchList',hourlySearchList.totalLength())

    // this is a taker object, which will be pushed one at a time
    let allOptionsSoFar: SearchList = new SearchList(allUnmatchedKidosThisHour.length)

    //console.log('allOptionsSoFar',allOptionsSoFar.totalLength())

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
          allOptionsSoFar.push(currentOption)
          let permutations = allOptionsSoFar.getPermutations(currentOption)
          if (permutations) {
            //complete solutions with matches predefined in query
            permutations = permutations.map(permutation => {
              let completedSolution = permutation.solutionDetails.concat(allSelectedMatches)
              return {solutionDetails: completedSolution, cost: permutation.cost}
            })
            //store the solutions
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

  }
}