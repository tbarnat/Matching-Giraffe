import {IMatchOptionInfo, IRankedHourlySolution, ITrainingDetail} from "./DataModel";
import Utils from "./Utils";

interface ISearchItem extends IMatchOptionInfo {
  globalIndex: number
}

interface ISearchList {
  [kidoName: string]: ISearchItem []
}

/* Relation between kids and horses and associated cost value for each pair are stored in list with separate ordering mechanism
 * globalIndex is an index of calling next matches across all kids. Term 'subIndex' is used to refer a index for a particular kid */
export default class SearchList {

  //ordered list of all horses by it's cost by kido - order list of object with extra info
  private orderedSearchList: { [kidoName: string]: ISearchItem [] } = {}
  private totalMaxNumberOfKidos: number
  private allKidosInList: string[]
  private lastIndex: number
  private isInitialized: boolean

  // numberOfKidos is irrelevant when searchList is passed
  constructor(maxNumberOfKidos: number, searchList?: ISearchList) {
    if (!searchList) {
      this.orderedSearchList = {}
      this.totalMaxNumberOfKidos = maxNumberOfKidos
      this.allKidosInList = []
      this.lastIndex = -1 // this seems crude, but better then if - let's see how it develops
      this.isInitialized = false
    } else {
      this.orderedSearchList = searchList
      this.totalMaxNumberOfKidos = maxNumberOfKidos
      this.allKidosInList = Object.keys(searchList)
      this.lastIndex = -1
      this.isInitialized = this.checkIfInitialized()
      Object.keys(searchList).forEach(kidoName => {
        this.lastIndex += searchList[kidoName].length
      }) // check it?
    }
  }

  public nuke(){
    this.orderedSearchList = {}
    // this.totalMaxNumberOfKidos - stays as is
    this.allKidosInList = []
    this.lastIndex = -1 // this seems crude, but better then if - let's see how it develops
    this.isInitialized = false
  }

  public totalLength(): number {
    return (this.lastIndex + 1)
  }

  public 'length'(kidoName: string): number {
    return this.orderedSearchList[kidoName].length
  }

  public 'push'(option: IMatchOptionInfo): boolean {
    let kidoName: string = option.kido
    this.lastIndex++
    if (!this.orderedSearchList[kidoName]) {
      this.orderedSearchList[kidoName] = []
    }
    let kidosWorstMatch = this.orderedSearchList[kidoName].length - 1
    if ((this.orderedSearchList[kidoName].length == 0) || this.orderedSearchList[kidoName][kidosWorstMatch].cost < option.cost) {
      this.orderedSearchList[kidoName].push(Object.assign(option, {globalIndex: this.lastIndex}))
      if (!this.allKidosInList.includes(kidoName)) {
        this.allKidosInList.push(kidoName)
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
      this.orderedSearchList[result.kido].shift()
      this.lastIndex--
    }
    return result
  }

  /* Takes next elem with the lowest globalIndex*/
  private readNext(): IMatchOptionInfo | null {
    let headsShortList: ISearchItem[] = []
    Object.keys(this.orderedSearchList).forEach(kidoName => {
      let head = this.orderedSearchList[kidoName][0]
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

  // used to reorder stuff in terms of globalIndex and subIndex for combination algorithm
  // possibly not needed now :/
  public reversePriorityOrder(matchMovesDown: IMatchOptionInfo, matchMovesUp: IMatchOptionInfo): boolean {
    let item_D_subindex: number = this.orderedSearchList[matchMovesDown.kido].findIndex((match) => {
      return (match.horso === matchMovesDown.horso)
    })
    let item_U_subindex = this.orderedSearchList[matchMovesUp.kido].findIndex((match) => {
      return (match.horso === matchMovesUp.horso)
    })
    if (item_D_subindex < 0 || item_U_subindex < 0) {
      throw new Error(`reverting calling order error /${matchMovesDown} / ${matchMovesUp} / ${this.orderedSearchList}`)
    }
    if (matchMovesDown.kido === matchMovesUp.kido) {
      let kidoName = matchMovesDown.kido
      let intermediateItem = this.orderedSearchList[matchMovesDown.kido][item_D_subindex]
      this.orderedSearchList[kidoName][item_D_subindex] = this.orderedSearchList[kidoName][item_U_subindex]
      this.orderedSearchList[kidoName][item_U_subindex] = intermediateItem
    }
    let intermediateIndex = this.orderedSearchList[matchMovesDown.kido][item_D_subindex].globalIndex
    this.orderedSearchList[matchMovesDown.kido][item_D_subindex].globalIndex = this.orderedSearchList[matchMovesUp.kido][item_U_subindex].globalIndex
    this.orderedSearchList[matchMovesUp.kido][item_U_subindex].globalIndex = intermediateIndex
    return this.isInOrder(this.orderedSearchList)
  }

  /* A core method - make it as optimized as possible */
  public getPermutations(newOption: IMatchOptionInfo): IRankedHourlySolution[] | null {
    if (this.isInitialized) {
      let subList = this.getSubListObject(this.allKidosInList.filter(kidosList => (kidosList !== newOption.kido)))
      let subArr: IMatchOptionInfo[][] = []
      Object.keys(subList).forEach(kidosList => {
        subArr.push(subList.kidosList)
      })
      subArr.push([newOption])
      let allCombinations = Utils.allArrComb(subArr)

      // filtering the combinations with the duplicated kido
      allCombinations = allCombinations.filter(comb => {
        let allKidosInComb = comb.map((option: IMatchOptionInfo) => {return option.kido})
        return Utils.hasDuplicates(allKidosInComb)
      })

      if (allCombinations.length > 0) {
        let rankedSolutions = allCombinations.map(comb => {
          let solutionDetails: ITrainingDetail[] = comb.map( (option: IMatchOptionInfo) => {
            return {
              kidName: option.kido,
              horse: option.horso
            }
          })
          /*let cost: number = comb.map((item: IMatchOptionInfo)=> item.cost)
            .reduce((accCost: number, curCost: number) => {return accCost + curCost})*/
          let cost: number = comb.reduce((accCost: number, curItem: IMatchOptionInfo) => {
            return accCost + curItem.cost
          })

          return {solutionDetails, cost}
        })

        //ascending sort of the resulting solutions by its cost - probably not even necessary
        rankedSolutions.sort((solution1, solution2) => {return solution1.cost - solution2.cost})

        return rankedSolutions
      }
    }
    return null
  }

  /* PROTOTYPE:
  // get new valid permutations generated by adding currentOption to allOptionsSoFar list and finally putting it to qInProc
  // permutation are taken in order by kidoCallingOrder
  private getHourlyPermutation(allOptionsSoFar: IMatchOptionInfo[], currentOption: IMatchOptionInfo): IRankedHourlySolution | null {

    //nc2) we create all available permutations: this is similar to Dijkstra algorithm, if there is none return null

    // 0 create new object (copy) of allOptionsSoFar  -> allOptionsFlexOrder -CHECKED
    // 1 take a first kido from allOptionsSoFar (it has the lowest possible cost)
    // 2 go one-by-one through allOptionsSoFar () and find the first valid solution () - assign it with total cost property
    // if no solutions return null
  // 3 take a second kido from allOptionsSoFar (second lowest cost), starting from the second, and going down
  // 4 go through allOptionsSoFar and find the first solution () - assign it with total cost property (2)
  // 5 if cost from 3 > 1 change order of elements 1 and 2 in allOptionsFlexOrder, and compare 2 and 3 (recursive procedure)
  // 6 else validate (check if no repetitions), and add new lowest cost solution (newSolution)
  // 7 get next solution from fixed allOptionsSoFar (as input take newSolution -> this gives new start point for search)
  // 8 go to 3

}*/

  private checkIfInitialized(): boolean {
    if (Object.keys(this.orderedSearchList).length !== this.totalMaxNumberOfKidos) {
      return false // '<' meaning not initialized;  '>' means somethings messed up
    }
    Object.keys(this.orderedSearchList).forEach(kidosList => {
      if (!kidosList.length) {
        return false
      }
    })
    return true
  }

  public getSubListObject(kidoNames: string[]): ISearchList {
    let intersection = Object.keys(this.orderedSearchList).filter(item => -1 !== kidoNames.indexOf(item));
    intersection = [...new Set(intersection)]

    let newSearchList: ISearchList = {}
    intersection.forEach(kidoName => {
      newSearchList[kidoName] = this.orderedSearchList[kidoName]
    })
    this.isInOrder(newSearchList)
    return newSearchList
  }

  public getFullListObject() {
    return this.orderedSearchList
  }

  // helper method to test things out
  private isInOrder(searchList: ISearchList): boolean {

    let allGlobalIndices: number[] = []
    let headsShortList: ISearchItem[] = []

    while (true) {
      Object.keys(searchList).forEach(kidoName => {
        let head = searchList[kidoName][0]
        if (head) {
          headsShortList.push(head)
        }
      })
      if (!headsShortList.length) {
        break
      }
      headsShortList.sort((elem1, elem2) => {
        return elem2.globalIndex - elem1.globalIndex // check it
      })
      let nextElem = searchList[headsShortList[0].kido].shift()
      if (nextElem) {
        allGlobalIndices.push(nextElem.globalIndex)
      }
    }
    // check total length of searchList
    let flatList: ISearchItem[] = []
    Object.keys(searchList).forEach(kido => flatList.concat(searchList[kido]))
    if (allGlobalIndices.length !== flatList.length) {
      console.log('check list not ok - 1')
      return false
    }
    // check if all the indices are sequential
    allGlobalIndices.forEach((value1, i) => {
      if (i + 1 <= allGlobalIndices.length) {
        let value2 = allGlobalIndices[i + 1]
        if (value2 - value1 !== 1) {
          console.log('check list not ok - 2')
          return false
        }
      }
    })
    // check if the indices are increasing for every kido
    Object.keys(searchList).forEach(kido => {
      searchList[kido].forEach((item, i) => {
        if (i + 1 <= searchList[kido].length) {
          if (searchList[kido][i].cost > searchList[kido][i + 1].cost) {
            console.log('check list not ok - 3')
            return false
          }
        }
      })
    })
    console.log('check list ok')
    return true
  }

}