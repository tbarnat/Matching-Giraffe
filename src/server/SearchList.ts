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

  public nuke() {
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

  /* A core method - make it as optimized as possible */
  public getPermutations(newOption: IMatchOptionInfo): IRankedHourlySolution[] | null {
    if (this.isInitialized) {
      let subList = this.getSubListObject(this.allKidosInList.filter(kidosList => (kidosList !== newOption.kido)))


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
    let copySearchList = JSON.parse(JSON.stringify(this.orderedSearchList))
    let intersection = Object.keys(copySearchList).filter(item => -1 !== kidoNames.indexOf(item));
    intersection = [...new Set(intersection)]

    let newSearchList: ISearchList = {}
    intersection.forEach(kidoName => {
      newSearchList[kidoName] = copySearchList[kidoName]
    })
    this.isInOrder(newSearchList)
    return newSearchList
  }

  public getFullListObject() {
    return this.orderedSearchList
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