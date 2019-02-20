import SearchList, {IMatch, IMatchOption, ISearchList} from "./SearchList";
import {IHourlySolOption, IHourlySolution, IRankedDailySolution} from "../DataModel";
import Utils from "../utils/Utils";
import {Logger} from "../utils/Logger";

export default class DailySearchList extends SearchList {

  private allCombinations: number = 0
  private combCorrWorkload: number = 0

  public constructor(log: Logger, maxNumberOfCategories: number, private readonly maxWorkHours: number, searchList?: ISearchList) {
    super(log, maxNumberOfCategories, searchList)
  }

  public getCombinations(newOption: IMatchOption): IRankedDailySolution[] | null {
    if (this.isInitialized()) {
      let categoryNames = this.getAllCatInList().filter(catName => (catName !== newOption.category))
      let subList = this.getSubListForCategories(categoryNames)


      let subArr: IMatchOption[][] = []
      Object.keys(subList).forEach(kidosList => {
        subArr.push(subList[kidosList])
      })
      subArr.push([newOption])
      let allCombinations = Utils.allArrComb(subArr)
      // filtering the combinations by the max horso work time
      allCombinations = allCombinations.filter(comb => {
        return this.isWorkLoadOk(comb)
      })



      if (allCombinations.length > 0) {
        return allCombinations.map(comb => {
          let solutions: IHourlySolution[] = comb.map((option: IMatch) => {
            return this.mapOptionTo(option)
          })
          let cost: number = comb.map((item: IHourlySolOption) => item.cost)
            .reduce((accCost: number, curCost: number) => {
              return accCost + curCost
            })

          return {solutions, cost}
        })
        // no point in sorting, cause sort will be done, when all combinations are gathered
      }
    }
    return null
  }

  private isWorkLoadOk(combination: IMatch[]) {
    this.allCombinations++
    let usageStat: { [horse: string]: number } = {}
    for (const solutions of combination) {
      for (const kidHorse of solutions.item) {
        if (usageStat[kidHorse.horse]) {
          if (++usageStat[kidHorse.horse] > this.maxWorkHours) {
            return false
          }
        } else {
          usageStat[kidHorse.horse] = 1
        }
      }
    }
    this.combCorrWorkload++
    return true
  }

  public getWorkloadOkStat(): string{
    return Math.round((this.combCorrWorkload/this.allCombinations)*1000)/10+'%'
  }

  public mapOptionTo(option: IMatch): IHourlySolution {
    return {hourName: option.category, solution: option.item}
  }

  public mapOptionFrom(option: IHourlySolOption): IMatchOption {
    return {category: option.hourName, item: option.solution, cost: option.cost}
  }

}
