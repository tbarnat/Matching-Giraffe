import SearchList, {IMatch, IMatchOption, ISearchList} from "./SearchList";
import {IKidHorse, IKidHorseOption, IRankedHourlySolution, ITrainingDetail} from "../DataModel";
import Utils from "../utils/Utils";

/* SearchList for generating permutations for an hour of training and finding different kid-horse matches with associated total cost */
export default class HourlySearchList extends SearchList{

  public constructor(maxNumberOfCategories: number, searchList?: ISearchList){
    super(maxNumberOfCategories, searchList)
  }

  public getCombinations(newOption: IMatchOption): IRankedHourlySolution[] | null {
    if (this.isInitialized()) {
      let categoryNames = this.getAllCatInList().filter(catName => (catName !== newOption.category))
      let subList = this.getSubListForCategories(categoryNames)


      let subArr: IMatchOption[][] = []
      Object.keys(subList).forEach(kidosList => {
        subArr.push(subList[kidosList])
      })
      subArr.push([newOption])

      let allCombinations = Utils.allArrComb(subArr)
      // filtering the combinations by the duplicated kido
      allCombinations = allCombinations.filter(comb => {
        let allItemsInComb = comb.map((option: IMatchOption) => {
          return option.item
        })
        return Utils.strArrHasDuplicates(allItemsInComb)
      })

      if (allCombinations.length > 0) {
        return allCombinations.map(comb => {
          let solution: ITrainingDetail[] = comb.map((option: IMatch) => {
            return this.mapOptionTo(option)
          })
          let cost: number = comb.map((item: IKidHorseOption)=> item.cost)
            .reduce((accCost: number, curCost: number) => {return accCost + curCost})

          return {solution, cost}
        })
        // no point in sorting, cause sort will be done, when all combinations are gathered
        //console.log('-> finally: ',rankedSolutions)
        //return rankedSolutions
      }
    }
    return null
  }

  public getSubListForKidos(kidoNames: string[]): ISearchList {
    return this.getSubListForCategories(kidoNames)
  }

  public getSubListWithoutHorsos(horsos: string[]): ISearchList {
    return this.getSubListWithoutItems(horsos)
  }

  public mapOptionTo(option: IMatch): IKidHorse{
    return {kidName:option.category, horse:option.item}
  }

  public mapOptionFrom(option: IKidHorseOption): IMatchOption{
    return {category:option.kidName, item:option.horse, cost:option.cost}
  }

}