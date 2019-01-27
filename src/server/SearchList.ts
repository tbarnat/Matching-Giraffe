import {IMatchOptionInfo} from "./DataModel";

interface ISearchItem extends IMatchOptionInfo {
  globalIndex: number
}

/* Relation between kids and horses and associated penalty value for each pair are stored in list with separate ordering mechanism
 * globalIndex is an index of calling next matches across all kids. Term 'subIndex' is used to refer a index for a particular kid */
export default class SearchList {

  //ordered list of all horses by it's rank by kido - order list of object with extra info
  private searchList: { [kidoName: string]: ISearchItem [] } = {}
  private allKidosInList: string[]
  private lastIndex: number

  constructor(searchList?: { [kidoName: string]: ISearchItem [] }) {
    if(!searchList){
      this.searchList = {}
      this.allKidosInList = []
      this.lastIndex = -1 // this seems crude, but better then if - let's see how it develops
    }else{ // I am not sure now it this would be needed anywhere
      this.searchList = searchList
      this.allKidosInList = Object.keys(searchList)
      this.lastIndex = -1
        Object.keys(searchList).forEach(kidoName => {this.lastIndex += searchList[kidoName].length}) // check it?
    }
  }

  public totalLength(): number {
    return (this.lastIndex + 1)
  }

  public 'length'(kidoName: string): number {
    return this.searchList[kidoName].length
  }

  public 'push'(option: IMatchOptionInfo) {
    let kidoName: string = option.kido
    this.lastIndex++
    if(!this.searchList[kidoName]){
      this.searchList[kidoName] = []
    }
    this.searchList[kidoName].push(Object.assign(option, {globalIndex: this.lastIndex}))
    if (!this.allKidosInList.includes(kidoName)) {
      this.allKidosInList.push(kidoName)
    }
  }

  public 'shift'(): IMatchOptionInfo | null {  // getNext and remove elem
    let result = this.readNext()
    if (result) {
      this.searchList[result.kido].shift()
      this.lastIndex--
    }
    return result
  }

  /* Takes next elem with the lowest globalIndex*/
  private readNext(): IMatchOptionInfo | null {
    let headsShortList: ISearchItem[] = []
    Object.keys(this.searchList).forEach(kidoName => {
      let head = this.searchList[kidoName][0]
      if (head) {
        headsShortList.push(head)
      }
    })
    if (!headsShortList.length) {
      return null
    }
    headsShortList.sort((elem1, elem2) => {
      return elem2.globalIndex - elem1.globalIndex // check it
    })
    let next = headsShortList[0]
    return {kido: next.kido, horso: next.horso, penalty: next.penalty}
  }

  // used to reorder stuffin terms of globalIndex and subIndex for Dijkstra algorithm
  public reversePriorityOrder(matchMovesDown: IMatchOptionInfo, matchMovesUp: IMatchOptionInfo) {
    let item_D_subindex: number = this.searchList[matchMovesDown.kido].findIndex((match) => {
      return (match.horso === matchMovesDown.horso)
    })
    let item_U_subindex = this.searchList[matchMovesUp.kido].findIndex((match) => {
      return (match.horso === matchMovesUp.horso)
    })
    if (item_D_subindex < 0 || item_U_subindex < 0) {
      throw new Error(`reverting calling order error /${matchMovesDown} / ${matchMovesUp} / ${this.searchList}`)
    }
    if (matchMovesDown.kido === matchMovesUp.kido) {
      let kidoName = matchMovesDown.kido
      let intermediateItem = this.searchList[matchMovesDown.kido][item_D_subindex]
      this.searchList[kidoName][item_D_subindex] = this.searchList[kidoName][item_U_subindex]
      this.searchList[kidoName][item_U_subindex] = intermediateItem
    }
    let intermediateIndex = this.searchList[matchMovesDown.kido][item_D_subindex].globalIndex
    this.searchList[matchMovesDown.kido][item_D_subindex].globalIndex = this.searchList[matchMovesUp.kido][item_U_subindex].globalIndex
    this.searchList[matchMovesUp.kido][item_U_subindex].globalIndex = intermediateIndex
  }

  //getPermutations(newOption: IMatchOptionInfo): IRankedHourlySolution[]{}
  // helper: elem from sudIndex i = this.searchItem[kidoName][i]

}