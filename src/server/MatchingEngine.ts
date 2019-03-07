import {
  default as Preferences,
  IHorseRidingDayQ,
  IHorseRidingHourQ,
  IKido,
  PrefType,
  IKidHorseOption,
  IRankedHourlySolution,
  IBestSolution,
  IResult,
  IHorseRidingHour,
  IKidHorse,
  IRankedDailySolution,
  IHourlySolution
} from "./DataModel";
import Utils from "./utils/Utils";
import {IMatchOption} from "./searchLists/SearchList";
import HourlySearchList from "./searchLists/HourlySearchList";
import DailySearchList from "./searchLists/DailySearchList";
import {Logger} from "./utils/Logger";

export default class MatchingEngine {

  /* --- Model settings --- */
  private horsoMaxHoursPerDay: number = 3

  /* --- Source query --- */
  private dailyQuery: IHorseRidingDayQ

  /* --- Data structures --- */
  private avaHorsos: string[] = []
  private kidosInQueryD: string[] = [] //those are distinguishable kidos, not all kidos in query
  private allKidosInQuery: string[] = []
  private kidosPrefs: { [kidoName: string]: PrefType } = {}
  private hourlySearchOrder: HourlySearchList //kid-horse matches grouped by kid

  /* --- Calculation results --- */
  //intermediate solutions - sorted list of solutions for every hour, so first level are hours 1-8, and second level are solutions
  private qInProc: { [hour: string]: IRankedHourlySolution[] } = {}


  constructor(protected allHorsos: string[], protected allKidos: IKido[], private log: Logger) {
  }

  //exposed main method, asked from outside of class
  public async getMatches(dailyQuery: IHorseRidingDayQ): Promise<IBestSolution> {
    try {
      let startTime = Date.now()

      this.dailyQuery = dailyQuery

      this.log.info(this.dailyQuery,'New daily query')
      this.log.debug(this.allHorsos,'All horses as string')
      this.log.debug(this.allKidos,'All kidos')

      let errorMsg = await this.initScopeVariables()
      if (errorMsg) {
        return this.mapResultsToISolution({results: [], errorMsg: `${errorMsg}`})
      }

      /*  Finding solutions for every hour separately  */

      for (let hour of this.dailyQuery.hours) {
        let hourName = hour.hour
        //this.breakHourlyCalc = false
        this.qInProc[hourName] = []
        await this.hourlyMatching(hour, hourName)
        if (!this.qInProc[hourName].length) {
          return this.mapResultsToISolution({
            results: [],
            errorMsg: `There were no solutions for hour: ${hour.hour}`
          })
        }
      }
      let hoursCombined = await this.combineHours()

      let workTime = Date.now() - startTime
      this.log.info(`Calc done with total time: ${workTime} [ms]`)

      return this.mapResultsToISolution(hoursCombined)
    } catch (err) {
      let str: string = err.stack
      return this.mapResultsToISolution({results: [], errorMsg: `${str.substring(0, 170)} ...`})
    }
  }

  private async initScopeVariables(): Promise<string> {

    //  Drop calculation-wise cache
    this.clearSomeScopeVariables()

    //  Checking of global conditions - if there is enough horses
    let minHorsosReqHourly: number = 0
    let minHorsosReqDaily: number = 0
    this.dailyQuery.hours.forEach(hour => {
      minHorsosReqHourly = Math.max(hour.trainingsDetails.length, minHorsosReqHourly)
    })
    this.dailyQuery.hours.forEach(hour => hour.trainingsDetails.forEach(() => {
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
        if (currentHorso) {
          if (preselectedThisHour.includes(currentHorso)) {
            preselectCollision = `Horse: ${currentHorso} was preselected twice at ${hour.hour}`
            return
          }
          preselectedThisHour.push(currentHorso)
          if (!allPreselectedHorses.includes(currentHorso)) {
            allPreselectedHorses.push(currentHorso)
          }
        }
      })
    })
    if (preselectCollision) {
      return preselectCollision
    }
    let intersection = Utils.intersection(this.dailyQuery.dailyExcludes, allPreselectedHorses)
    if (intersection.length) {
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
    await this.updateKidosPreferences()

    // Count cost points for kido-horso combination, and set searching order
    this.countCostPointsAndOrder()

    return ''
  }

  private clearSomeScopeVariables() {
    this.avaHorsos = []
    this.kidosInQueryD = []
    this.kidosPrefs = {}
  }

  private initAvailableHorses() {
    this.avaHorsos = this.allHorsos.filter(horsoName => {
      return !this.dailyQuery.dailyExcludes.includes(horsoName)
    })
  }

  private async updateKidosPreferences() {
    this.initDistKidosInQuery()

    this.log.debug(this.allKidos,'Raw kido preferences: ')
    //tableHelper.tablePreferences(this.allKidos) // todo add script

    this.allKidos.filter(kido => {
      return (this.kidosInQueryD.includes(kido.name))
    }).forEach(kido => {
      //filter the daily excludes
      this.kidosPrefs[kido.name] = {}
      Object.keys(kido.prefs).forEach(level => {
        this.kidosPrefs[kido.name][level] = kido.prefs[level].filter(horso => {
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
    this.log.debug(kidosWithoutExcludedHorses,'Preferences after filtering of excluded horses')
    //tableHelper.tablePreferences(kidosWithoutExcludedHorses)
  }

  private initDistKidosInQuery() {
    this.dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        if (this.kidosInQueryD.indexOf(training.kidName) < 0 && !training.horse) {
          this.kidosInQueryD.push(training.kidName)
        }
      })
    })
    this.hourlySearchOrder = new HourlySearchList(this.log, this.kidosInQueryD.length)
  }


  // Not sure but I think I made an assumptions that duplicates kidos (not distinct) are allowed here
  private initAllKidosInQuery() {
    this.dailyQuery.hours.forEach(hour => {
      hour.trainingsDetails.forEach(training => {
        if (!training.horse) {
          this.allKidosInQuery.push(training.kidName)
        }
      })
    })
  }

  private countCostPointsAndOrder() {
    this.initAllKidosInQuery()
    // Counts amount of occurrence for each horse in this and higher levels and store it in temporary object 'costForFreq'
    let costForFreq: { [prefCat: string]: { [horsoName: string]: number } } = {}
    let costFromUpperLevels: { [horsoName: string]: number } = {}

    Preferences.incPrefCat.forEach(level => {
      costForFreq[level] = {}
      this.allKidosInQuery.forEach(kidoName => {
        this.kidosPrefs[kidoName][level].forEach(horso => {
          costFromUpperLevels[horso] = costFromUpperLevels[horso] ? costFromUpperLevels[horso] : 0
          costForFreq[level][horso] = costForFreq[level][horso] ? costForFreq[level][horso] : 0
          costForFreq[level][horso] += 1 + costFromUpperLevels[horso]
        })
      })
      Object.keys(costForFreq[level]).forEach(horso => {
        costFromUpperLevels[horso] = costFromUpperLevels[horso] ? costFromUpperLevels[horso] : 0
        let storedValue: number = costForFreq[level][horso]
        costForFreq[level][horso] += costFromUpperLevels[horso]
        costFromUpperLevels[horso] += storedValue
      })
    })
    /* Calculate cost points and populate hourlySearchOrder object
       cost = number of occurrence of horse on each kido's pref level (global), and higher levels(global)
              + (globalIndex level (each kido) * (number of available horses in sables)^2) */
    let flatOptionList: IKidHorseOption[] = []
    this.kidosInQueryD.forEach(kido => {
      Preferences.incPrefCat.forEach(level => {
        this.kidosPrefs[kido][level].forEach(horso => {
          let cost = costForFreq[level][horso] + Preferences.getPrefCatValue(level) * this.avaHorsos.length ** 2
          flatOptionList.push({kidName: kido, horse: horso, cost})
        })
      })
    })

    flatOptionList.sort((item1, item2) => {
      return item1.cost - item2.cost
    })
    flatOptionList.forEach(option => {
      let optionGeneric = this.hourlySearchOrder.mapOptionFrom(option)
      this.hourlySearchOrder.push(optionGeneric)
    })

    let tempDailySearchOrder = this.hourlySearchOrder.getFullListObject()
    this.log.debug(tempDailySearchOrder,'Search order table for whole day (sorted by cost)')
    //tableHelper.tableSearchOrder(tempDailySearchOrder)
  }

  private mapResultsToISolution(results: IResult): IBestSolution {
    let message: IBestSolution
    if (!results.results.length && !results.errorMsg) {
      message = {
        solution: {day: '', remarks: '', hours: []},
        errorMsg: `You gave me a very hard task. I checked a lot of possibilities, and could not find a single result :(`
      }
    }else if (!results.results.length && results.errorMsg) {
      message = {
        solution: {day: this.dailyQuery.day, remarks: this.dailyQuery.remarks, hours: []},
        errorMsg: results.errorMsg
      }
    }else{
      results.results.forEach(result => {
        let queryHour = this.dailyQuery.hours.find(hour => {
          return hour.hour === result.hour
        })
        if (queryHour && queryHour.remarks) {
          Object.assign(result, {remarks: queryHour.remarks})
        }
      })
      message = {solution: {day: this.dailyQuery.day, remarks: this.dailyQuery.remarks, hours: results.results}}
    }
    this.log.info(message,'Returned object')
    return message
  }

  //recursively find solutions by hourlySearchOrder and excluding horses from prefs
  private async hourlyMatching(hour: IHorseRidingHourQ, hourName: string) {

    let startTime = Date.now()

    let allUnmatchedKidosThisHour: string[] = []
    let allSelectedMatches: IKidHorse[] = []
    let horsosMatchedInQuery: string[] = []
    hour.trainingsDetails.forEach(training => {
      if (!training.horse) {
        allUnmatchedKidosThisHour.push(training.kidName)
      } else {
        allSelectedMatches.push({kidName: training.kidName, horse: training.horse})
        horsosMatchedInQuery.push(training.horse)
      }
    })

    // this is an unfiltered donor object, form which horses of preselected matches have to be removed
    let hourlySearchListUnfiltered: HourlySearchList =
      new HourlySearchList(this.log, allUnmatchedKidosThisHour.length, this.hourlySearchOrder.getSubListForKidos(allUnmatchedKidosThisHour))

    // this is a donor object, which will be shifted one at a time
    let hourlySearchList: HourlySearchList =
      new HourlySearchList(this.log, allUnmatchedKidosThisHour.length, hourlySearchListUnfiltered.getSubListWithoutHorsos(horsosMatchedInQuery))

    // this is a taker object, which will be pushed one at a time
    let allHourlyOptionsSoFar: HourlySearchList = new HourlySearchList(this.log, allUnmatchedKidosThisHour.length)

    let timeout = 50 * hour.trainingsDetails.length // + max 0,2 sec per hour scheduled for that day
    let resultsLimit = 20 * timeout

    // generate new option, one by one until at least single solutions is obtained then (strongLogicalCondition) until end,
    // limit or timeout (softLogicalCondition)
    await Utils.asyncWhile(
      () => {
        return (!!hourlySearchList.totalLength() && this.qInProc[hourName].length < resultsLimit)
      },
      () => {
        return (!!hourlySearchList.totalLength() && this.qInProc[hourName].length == 0)
      },
      async () => {
        let currentOption: IMatchOption | null = hourlySearchList.shift()
        if (currentOption) {
          // Every new kido-horse-cost (currentOption) added to combination set (allHourlyOptionsSoFar)
          // results in generation new valid combinations or null
          allHourlyOptionsSoFar.push(currentOption)
          let permutations: IRankedHourlySolution[] | null = allHourlyOptionsSoFar.getCombinations(currentOption)
          if (permutations) {
            //complete solutions with matches predefined in query
            permutations = permutations.map(permutation => {
              let completedSolution = permutation.solution.concat(allSelectedMatches)
              return {solution: completedSolution, cost: permutation.cost}
            })
            //store the solutions
            this.qInProc[hourName] = this.qInProc[hourName].concat(permutations)
          }
        }
      }, timeout)
    //ascending sort of the resulting solutions by its cost
    this.qInProc[hourName].sort((solution1, solution2) => {
      return solution1.cost - solution2.cost
    })

    let procTime = Date.now() - startTime
    this.log.info(`   Hourly matching for: ${hourName}     ->  time[ms]: ${procTime} / ${timeout}   comb.: ${this.qInProc[hourName].length} / ${resultsLimit}`)

  }

  private async combineHours(): Promise<IResult> {

    let startTime = Date.now()

    let allHoursCount = this.dailyQuery.hours.length
    //temporary assume, that 3 hour max
    if (allHoursCount <= this.horsoMaxHoursPerDay) {
      let results: IHorseRidingHour[] = []
      this.dailyQuery.hours.forEach((hourDetails) => {
        let hourName = hourDetails.hour
        results.push({
          hour: hourName,
          trainer: hourDetails.trainer,
          trainingsDetails: this.qInProc[hourName][0].solution
        })
      })
      return {results}
    }

    let dailySearchList: DailySearchList =
      new DailySearchList(this.log, allHoursCount, this.horsoMaxHoursPerDay)

    // convert to IMatch, and flatten list then push one-by-one to DailySearchList
    let flatHoursSolutions: IMatchOption[] = []
    Object.keys(this.qInProc).forEach((hourName) => {
      this.qInProc[hourName].map((rankedHourlySol) => {
        return {item: rankedHourlySol.solution, category: hourName, cost: rankedHourlySol.cost}
      }).forEach(elem => {
        flatHoursSolutions.push(elem)
      })
    })
    flatHoursSolutions.sort((elem1, elem2) => {
      return elem1.cost - elem2.cost
    })
    flatHoursSolutions.forEach(elem => {
      dailySearchList.push(elem)
    })

    // this is a taker object, which will be pushed one at a time
    let allDailyOptionsSoFar: DailySearchList = new DailySearchList(this.log, allHoursCount, this.horsoMaxHoursPerDay)

    let timeout = 200 * allHoursCount
    let resultsLimit = 50 * timeout

    let resultsList: IRankedDailySolution[] = []

    await Utils.asyncWhile(
      () => {
        return (!!dailySearchList.totalLength() && resultsList.length < resultsLimit)
      },
      () => {
        return (!!dailySearchList.totalLength() && resultsList.length == 0)
      },
      async () => {
        let currentOption: IMatchOption | null = dailySearchList.shift()
        if (currentOption) {
          // Every new hour-solution-cost (currentOption) added to combination set (allDailyOptionsSoFar)
          // results in generation new valid combinations or null
          allDailyOptionsSoFar.push(currentOption)
          let permutations = allDailyOptionsSoFar.getCombinations(currentOption)
          if (permutations) {
            //store the solutions
            resultsList = resultsList.concat(permutations)
          }
        }
      }, timeout)

    let result: IResult
    if (resultsList && resultsList.length) {
      //ascending sort of the resulting solutions by its cost
      resultsList.sort((solution1, solution2) => {
        return solution1.cost - solution2.cost
      })
      let bestDailySolution = resultsList[0].solutions

      let hourlyResultList: IHorseRidingHour[] = []
      this.dailyQuery.hours.forEach((hourDetails) => {
        let hourName = hourDetails.hour
        let trainingDetails: IHourlySolution | undefined = bestDailySolution.find(elem => {
          return elem.hourName == hourName
        })
        if (trainingDetails) {
          hourlyResultList.push({
            hour: hourDetails.hour,
            trainer: hourDetails.trainer,
            trainingsDetails: trainingDetails.solution
          })
        }
      })
      result = {results: hourlyResultList}
    }else{
      result = {results: []}
    }

    let procTime = Date.now() - startTime
    this.log.info(`   Daily matching for:  ${this.dailyQuery.day} ->  time[ms]: ${procTime} / ${timeout}   comb.: ${resultsList.length} / ${resultsLimit}`)
    this.log.info(`   Combinations with correct workload: ${allDailyOptionsSoFar.getWorkloadOkStat()}`)

    return result
  }
}