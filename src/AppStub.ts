import {IHorseRidingDay, IHorseRidingDayQ} from "./server/DataModel";
import {Database} from "./server/Database";


interface IBestSolution {
  solution: IHorseRidingDay
  errorMsg?: string
}

/*  this is stub for the whole application for the front-end development plus some front-end methods
 *  to use it: install mongodb, run db_init script to get test data, and run AppStub.initApp() */
export default class AppStub {

  private db: Database
  private isInitialized: boolean = false

  constructor() {
  }

  public async initApp() {
    let config = {
      uri: 'mongodb://localhost:27017',
      dbName: 'hm-dev'
    }
    const db = new Database(config);
    await db.init()
    this.isInitialized = true
    console.log(`*** init complete***`)
  }


  public async getHintsForKido(query: string, taken: string[]): Promise<string[]> {
    return await this.getHintsForQuery('kidos', query, taken)
  }

  public async getHintsForHorsos(query: string, taken: string[]): Promise<string[]> {
    return await this.getHintsForQuery('horsos', query, taken)
  }

  public async getHintsForTrainers(query: string): Promise<string[]> {
    return await this.getHintsForQuery('trainers', query)
  }

  /*  Get 10 first hints of select-one-menu for entry name by query string in ex. 'Nata', plus filter for all names that were already taken  */
  public async getHintsForQuery(collection: string, query: string, taken?: string[]): Promise<string[]> {
    if (this.isInitialized) {
      let entries = await this.db.find(collection)
      if (taken) {
        entries = entries.filter(entry => {
          return -taken.indexOf(entry)
        })
      }
      return entries.filter(entry => {
        return (entry.substr(0, query.length) === query)
      }).sort().slice(0, 9)
    }
    return []
  }

  public async generateMockSolution(dailyQuery: IHorseRidingDayQ): Promise<IBestSolution> {
    dailyQuery.remarks = dailyQuery.remarks ? dailyQuery.remarks : ''
    if (this.isInitialized) {
      let allHorsos: string[] = await this.db.find('horsos')
      let dailyResultMock: IHorseRidingDay = {
        day: dailyQuery.day,
        remarks: dailyQuery.remarks,
        hours: dailyQuery.hours.map(hourDetails => {
          return {
            hour: hourDetails.hour,
            trainer: hourDetails.trainer,
            trainingsDetails: hourDetails.trainingsDetails.map(training => {
              return {
                kidName: training.kidName,
                horse: allHorsos[Math.floor(Math.random() * allHorsos.length)],
                remarks: training.remarks
              }
            })
          }
        })
      }
      return {solution: dailyResultMock}
    }
    return {solution: {day: dailyQuery.day, remarks: dailyQuery.remarks, hours: []}, errorMsg: 'db not initialized'}
  }

  public async getNextSolution(dailyQuery: IHorseRidingDayQ): Promise<IBestSolution> {
    return this.generateMockSolution(dailyQuery)
  }

}