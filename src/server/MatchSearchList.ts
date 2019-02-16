import {IMatchOptionInfo, IRankedHourlySolution, ITrainingDetail} from "./DataModel";
import Utils from "./Utils";
import SearchList from "./SearchList";

interface ISearchItem extends IMatchOptionInfo {
  globalIndex: number
}

interface ISearchList {
  [kidoName: string]: ISearchItem []
}

/* Relation between kids and horses and associated cost value for each pair are stored in list with separate ordering mechanism
 * globalIndex is an index of calling next matches across all kids. Term 'subIndex' is used to refer a index for a particular kid */
export default class MatchSearchList extends SearchList{

  //ordered list of all horses by it's cost by kido - order list of object with extra info
  protected searchListHeart: { [item: string]: ISearchItem [] } = {}
  protected readonly totalMaxNumberOfItems: number
  private allItemsInList: string[]
  private lastIndex: number
  private isInitialized: boolean

  // numberOfKidos is irrelevant when searchList is passed
  constructor(maxNumberOfKidos: number, searchList?: ISearchList) {
    super()
    if (!searchList) {
      this.searchListHeart = {}
      this.totalMaxNumberOfItems = maxNumberOfKidos
      this.allItemsInList = []
      this.lastIndex = -1 // this seems crude, but better then if - let's see how it develops
      this.isInitialized = false
    } else {
      this.searchListHeart = searchList
      this.totalMaxNumberOfItems = maxNumberOfKidos
      this.allItemsInList = Object.keys(searchList)
      this.lastIndex = -1
      this.isInitialized = this.checkIfInitialized()
      Object.keys(searchList).forEach(kidoName => {
        this.lastIndex += searchList[kidoName].length
      }) // check it?
    }
  }

  public nuke() {
    this.searchListHeart = {}
    // this.totalMaxNumberOfItems - stays as is
    this.allItemsInList = []
    this.lastIndex = -1 // this seems crude, but better then if - let's see how it develops
    this.isInitialized = false
  }

  public totalLength(): number {
    return (this.lastIndex + 1)
  }

  public 'length'(kidoName: string): number {
    return this.searchListHeart[kidoName].length
  }

  public 'push'(option: IMatchOptionInfo): boolean {
    let kidoName: string = option.kido
    this.lastIndex++
    if (!this.searchListHeart[kidoName]) {
      this.searchListHeart[kidoName] = []
    }
    let kidosWorstMatch = this.searchListHeart[kidoName].length - 1
    if ((this.searchListHeart[kidoName].length == 0) || this.searchListHeart[kidoName][kidosWorstMatch].cost < option.cost) {
      this.searchListHeart[kidoName].push(Object.assign(option, {globalIndex: this.lastIndex}))
      if (!this.allItemsInList.includes(kidoName)) {
        this.allItemsInList.push(kidoName)
      }
      if (!this.isInitialized) {
        this.isInitialized = this.checkIfInitialized()
      }
      return true
    }
    return false
  }

  public 'shift'(): IMatchOptionInfo | null {  // getNext and remove elem
    let result = this.readNext()
    if (result) {
      this.searchListHeart[result.kido].shift()
      this.lastIndex--
    }
    return result
  }

  /* Takes next elem with the lowest globalIndex*/
  private readNext(): IMatchOptionInfo | null {
    let headsShortList: ISearchItem[] = []
    Object.keys(this.searchListHeart).forEach(kidoName => {
      let head = this.searchListHeart[kidoName][0]
      if (head) {
        headsShortList.push(head)
      }
    })
    if (!headsShortList.length) {
      return null
    }
    headsShortList.sort((elem1, elem2) => {
      return elem1.globalIndex - elem2.globalIndex // check it
    })
    let next = headsShortList[0]
    return {kido: next.kido, horso: next.horso, cost: next.cost}
  }

  /* A core method - make it as optimized as possible */
  public getPermutations(newOption: IMatchOptionInfo): IRankedHourlySolution[] | null {
    if (this.isInitialized) {
      let subList = this.getSubListForKidos(this.allItemsInList.filter(kidosList => (kidosList !== newOption.kido)))


      let subArr: IMatchOptionInfo[][] = []
      Object.keys(subList).forEach(kidosList => {
        subArr.push(subList[kidosList])
      })
      subArr.push([newOption])

      //console.log('-> new Opt: ',newOption)
      //console.log('-> subList: ',subArr,'\n')

      let allCombinations = Utils.allArrComb(subArr)
      // filtering the combinations with the duplicated kido
      allCombinations = allCombinations.filter(comb => {
        let allHorsosInComb = comb.map((option: IMatchOptionInfo) => {
          return option.horso
        })
        return Utils.hasDuplicates(allHorsosInComb)
      })
      //console.log('-> result: ',allCombinations)
      //console.log('\n ------------------------------------------------------ \n')

      if (allCombinations.length > 0) {
        let rankedSolutions = allCombinations.map(comb => {
          let solutionDetails: ITrainingDetail[] = comb.map((option: IMatchOptionInfo) => {
            return {
              kidName: option.kido,
              horse: option.horso
            }
          })
          let cost: number = comb.map((item: IMatchOptionInfo)=> item.cost)
            .reduce((accCost: number, curCost: number) => {return accCost + curCost})

          return {solutionDetails, cost}
        })
        // no point in sorting, cause sort will be done, when all combinations are gathered
        //console.log('-> finally: ',rankedSolutions)
        return rankedSolutions
      }
    }
    return null
  }

  private checkIfInitialized(): boolean {
    if (Object.keys(this.searchListHeart).length !== this.totalMaxNumberOfItems) {
      return false // '<' meaning not initialized;  '>' means somethings messed up
    }
    Object.keys(this.searchListHeart).forEach(kidosList => {
      if (!kidosList.length) {
        return false
      }
    })
    return true
  }

  public getSubListForKidos(kidoNames: string[]): ISearchList {
    let copySearchList = JSON.parse(JSON.stringify(this.searchListHeart))

    let intersection = Utils.intersection(Object.keys(copySearchList), kidoNames)
    let newSearchList: ISearchList = {}
    intersection.forEach(kidoName => {
      newSearchList[kidoName] = copySearchList[kidoName]
    })
    this.isInOrder(newSearchList)
    return newSearchList
  }

  public getSubListWithoutHorsos(horsos: string[]): ISearchList {
    let newSearchList: ISearchList = {}
    this.allItemsInList.forEach(kido => {
      newSearchList[kido] = this.searchListHeart[kido].filter(item => {return !horsos.includes(item.horso)})
    })
    return newSearchList
  }

  public getFullListObject() {
    return this.searchListHeart
  }

  // helper method to test things out
  private isInOrder(searchList: ISearchList): boolean {

    let copySearchList = JSON.parse(JSON.stringify(searchList))
    let allGlobalIndices: number[] = []
    let headsShortList: ISearchItem[] = []

    while (true) {
      Object.keys(copySearchList).forEach(kidoName => {
        let head = copySearchList[kidoName][0]
        if (head) {
          headsShortList.push(head)
        }
      })
      if (!headsShortList.length) {
        break
      }
      headsShortList.sort((elem1, elem2) => {
        return elem1.globalIndex - elem2.globalIndex // check it
      })
      let nextElem = copySearchList[headsShortList[0].kido].shift()
      if (nextElem) {
        allGlobalIndices.push(nextElem.globalIndex)
      }
      headsShortList = []
    }

    // check total length of searchList
    let flatList: ISearchItem[] = []
    Object.keys(searchList).forEach(kido => {
      flatList = flatList.concat(searchList[kido])
    })
    if (allGlobalIndices.length !== flatList.length) {
      console.log('  ############## sublist check not ok - 1')
      return false
    }
    // check if all the indices are sequential (it is not necessary for valid sublist)
    allGlobalIndices.forEach((value1, i) => {
      if (i < allGlobalIndices.length - 1) {
        let value2 = allGlobalIndices[i + 1]
        if (value2 - value1 !== 1) {
          //console.log('  ############## sublist check not ok - 2')
          return false
        }
      }
    })
    // check if the indices are increasing for every kido
    Object.keys(searchList).forEach(kido => {
      searchList[kido].forEach((item, i) => {
        if (i + 1 < searchList[kido].length) {
          if (searchList[kido][i].cost > searchList[kido][i + 1].cost) {
            console.log('  ############## sublist check not ok - 3')
            return false
          }
        }
      })
    })
    //console.log('  //sublist check seems to be ok')
    return true
  }

}