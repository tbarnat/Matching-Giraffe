import SearchList, {IMatch, IMatchOption, ISearchList} from "./SearchList";
import {IHourlySolOption, IHourlySolution, IRankedDailySolution} from "../DataModel";
import Utils from "../Utils";

export default class DailySearchList extends SearchList {

  public constructor(maxNumberOfCategories: number, private readonly maxWorkHours: number, searchList?: ISearchList) {
    super(maxNumberOfCategories, searchList)
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

      //console.log('-> new Opt: ',newOption)
      //console.log('-> subList: ',subArr,'\n')

      let allCombinations = Utils.allArrComb(subArr)

      // filtering the combinations by the max horso work time
      allCombinations = allCombinations.filter(comb => {
        this.isWorkLoadOk(comb)
      })

      //console.log('-> result: ',allCombinations)
      //console.log('\n ------------------------------------------------------ \n')

      if (allCombinations.length > 0) {
        let rankedDailySolution = allCombinations.map(comb => {
          let solutions: IHourlySolution[] = comb.map((option: IMatch) => {
            this.mapOptionTo(option)
          })
          let cost: number = comb.map((item: IHourlySolOption) => item.cost)
            .reduce((accCost: number, curCost: number) => {
              return accCost + curCost
            })

          return {solutions, cost}
        })
        // no point in sorting, cause sort will be done, when all combinations are gathered
        //console.log('-> finally: ',rankedSolutions)
        return rankedDailySolution
      }
    }
    return null
  }

  private isWorkLoadOk(combination: IHourlySolution[]): boolean {
    let usageStat: { [horse: string]: number } = {}
    combination.forEach(solutions => {
      solutions.solution.forEach(kidHorse => {
        usageStat[kidHorse.horse] ? usageStat[kidHorse.horse] += 1 : usageStat[kidHorse.horse] = 1
      })
      Object.keys(usageStat).forEach(horse => {
        if (usageStat[horse] > this.maxWorkHours) return false
      })
    })
    return true
  }

  public mapOptionTo(option: IMatch): IHourlySolution{
    return {hour: option.category, solution: option.item}
  }

  public mapOptionFrom(option: IHourlySolOption): IMatchOption {
    return {category: option.hour, item: option.solution, cost: option.cost}
  }

}
