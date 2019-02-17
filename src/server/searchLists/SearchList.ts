import Utils from "../Utils";

// SearchList interface - main structure
export interface ISearchList {
  [category: string]: ISearchItem []
}

// SearchList scoped interface
interface ISearchItem extends IMatchOption {
  globalIndex: number
}

// SearchList scoped interface
export interface IMatchOption extends IMatch {
  cost: number
}

// A possible match between category and item defined in object without any SearchList ballast
export interface IMatch {
  category: string,
  item: any
}

// A return-type interface: bunch of matches and associated overall cost
export interface ISolution {
  solution: IMatch[]
  sumCost: number
}

/* SearchList stores ordered list of items (any) for different categories (string). Items are associated with two search-list-scoped values:
 * cost and globalIndex. Cost is algorithmic cost (the lower the better) and globalIndex is used to establish order for
 * pulling out the Items from SearchList. Base unit defining relation between item and category is IMatch, and it is used as base for return list ISolution[]*/
export default abstract class SearchList {

  private searchListHeart: { [category: string]: ISearchItem [] } = {}
  private readonly totalMaxNumberOfCategories: number
  private allCategoriesInList: string[]
  private lastIndex: number
  private initialized: boolean

  protected constructor(maxNumberOfCategories: number, searchList?: ISearchList) {
    if (!searchList) {
      this.searchListHeart = {}
      this.totalMaxNumberOfCategories = maxNumberOfCategories
      this.allCategoriesInList = []
      this.lastIndex = -1 // this seems crude, but works ok
      this.initialized = false
    } else {
      this.searchListHeart = searchList
      this.totalMaxNumberOfCategories = maxNumberOfCategories
      this.allCategoriesInList = Object.keys(searchList)
      this.lastIndex = -1
      this.initialized = this.checkIfInitialized()
      Object.keys(searchList).forEach(kidoName => {
        this.lastIndex += searchList[kidoName].length
      })
    }
  }

  public totalLength(): number {
    return (this.lastIndex + 1)
  }

  public 'length'(category: string): number {
    return this.searchListHeart[category].length
  }

  public 'push'(option: IMatchOption): boolean {
    let catName: string = option.category
    this.lastIndex++
    if (!this.searchListHeart[catName]) {
      this.searchListHeart[catName] = []
    }
    let kidosWorstMatch = this.searchListHeart[catName].length - 1
    if ((this.searchListHeart[catName].length == 0) || this.searchListHeart[catName][kidosWorstMatch].cost < option.cost) {
      this.searchListHeart[catName].push(Object.assign(option, {globalIndex: this.lastIndex}))
      if (!this.allCategoriesInList.includes(catName)) {
        this.allCategoriesInList.push(catName)
      }
      if (!this.initialized) {
        this.initialized = this.checkIfInitialized()
      }
      return true
    }
    return false
  }

  public 'shift'(): IMatchOption | null {  // getNext and remove elem
    let result = this.readNext()
    if (result) {
      this.searchListHeart[result.category].shift()
      this.lastIndex--
    }
    return result
  }

  /* Takes next elem with the lowest globalIndex*/
  private readNext(): IMatchOption | null {
    let headsShortList: ISearchItem[] = []
    Object.keys(this.searchListHeart).forEach(catName => {
      let head = this.searchListHeart[catName][0]
      if (head) {
        headsShortList.push(head)
      }
    })
    if (!headsShortList.length) {
      return null
    }
    headsShortList.sort((item1, item2) => {
      return item1.globalIndex - item2.globalIndex // check it
    })
    let next = headsShortList[0]
    return {category: next.category, item: next.item, cost: next.cost}
  }

  /* A core method - needs to be lighting fast */
  public abstract getCombinations(newOption: IMatchOption): ISolution[] | any[] | null


  private checkIfInitialized(): boolean {
    if (Object.keys(this.searchListHeart).length !== this.totalMaxNumberOfCategories) {
      return false // '<' meaning not initialized;  '>' means somethings messed up
    }
    Object.keys(this.searchListHeart).forEach(kidosList => {
      if (!kidosList.length) {
        return false
      }
    })
    return true
  }

  public getSubListForCategories(catNames: string[]): ISearchList {
    let copySearchList = JSON.parse(JSON.stringify(this.searchListHeart))

    let intersection = Utils.intersection(Object.keys(copySearchList), catNames)
    let newSearchList: ISearchList = {}
    intersection.forEach(catName => {
      newSearchList[catName] = copySearchList[catName]
    })
    this.isInOrder(newSearchList)
    return newSearchList
  }

  public getSubListWithoutItems(horsos: string[]): ISearchList {
    let newSearchList: ISearchList = {}
    this.allCategoriesInList.forEach(catName => {
      newSearchList[catName] = this.searchListHeart[catName].filter(elem => {
        return !horsos.includes(elem.item)
      })
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
      let nextElem = copySearchList[headsShortList[0].category].shift()
      if (nextElem) {
        allGlobalIndices.push(nextElem.globalIndex)
      }
      headsShortList = []
    }
    let flatList: ISearchItem[] = []
    Object.keys(searchList).forEach(kido => {
      flatList = flatList.concat(searchList[kido])
    })
    if (allGlobalIndices.length !== flatList.length) {
      console.log('ERROR: length/global index not ok')
      return false
    }
    allGlobalIndices.forEach((value1, i) => {
      if (i < allGlobalIndices.length - 1) {
        let value2 = allGlobalIndices[i + 1]
        if (value2 - value1 !== 1) {
          //console.log('INFO: sublist not sequential')
          return false
        }
      }
    })
    Object.keys(searchList).forEach(kido => {
      searchList[kido].forEach((item, i) => {
        if (i + 1 < searchList[kido].length) {
          if (searchList[kido][i].cost > searchList[kido][i + 1].cost) {
            console.log('ERROR: cost is increasing with index')
            return false
          }
        }
      })
    })
    return true
  }

  /*public nuke() {
    this.searchListHeart = {}
    // this.totalMaxNumberOfCategories - stays as is
    this.allCategoriesInList = []
    this.lastIndex = -1 // this seems crude, but better then if - let's see how it develops
    this.initialized = false
  }*/

  protected getAllCatInList(): string[]{
    return this.allCategoriesInList
  }

  protected isInitialized(): boolean{
    return this.initialized
  }

  public abstract mapOptionTo(option: IMatch): any

  public abstract mapOptionFrom(option: any): IMatchOption
}
