import {IHorseRidingDay, IHorseRidingDayQ} from "./DataModel";


export default class MatchingEngine {

  private matches: IHorseRidingDay[]
  private breakCalcFlag: boolean = false
  private readonly breakCalcTime: number = 5 * 1000
  /*exposed for use - informs if all the combinations were found before timeout*/
  public allMatchesFound: boolean


  /*exposed for use - returns list of all possible IHorseRidingDays*/
  public async findMatchesLimited(query: IHorseRidingDayQ): Promise<IHorseRidingDay[]>{
    setTimeout(() => {
      this.breakCalcFlag = false
    }, this.breakCalcTime)
    this. allMatchesFound = await this.getMatchesAll(query)
    return this.matches
  }

  /*adds to class object all horso-kido matches for preferences provided by db
  return false if timeout, and breakCalcFlag is raised
  return true if all possible matches are found */
  private async getMatchesAll(query: IHorseRidingDayQ): Promise<boolean> {
    while (this.breakCalcFlag) {
      let hasNextCalc = true

      //all the algorithmic logic
      /*
      1 - for every kido take
      2 -
      3 -
      4 -
      */


      //in the end of a loop pushes next possible match
      this.matches.push()
      if (!hasNextCalc) {
        return true
      }
    }
    return false
  }
}

