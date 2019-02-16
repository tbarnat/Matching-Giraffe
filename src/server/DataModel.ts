//all names are identifiers

/*Horse Riding Day - QUERY*/

export interface IHorseRidingDayQ {
  //_id: number, //mongo id
  day: string //the same as 'name', will be part of an url ie.: '20181011' (domain.pl/schedule20181011)
  remarks?: string // additional comments which would be rewritten
  hours: IHorseRidingHourQ[]
  dailyExcludes: string[] //unavailable horses 4e. injured
}

export interface IHorseRidingHourQ {
  hour: string,
  trainer: string[],
  remarks?: string
  trainingsDetails: ITrainingQ[]
}

export interface ITrainingQ {
  kidName: string,
  horse?: string, //rewritten to result if predefined. Matched by engine if undefined
}

/*Horse Riding Day - RESULT*/
export interface IHorseRidingDay {
  //_id: number, //mongo id
  day: string //the same as 'name', will be part of an url ie.: '2018-10-12', '2018-10-11-a' (domain.com/diary/2018-10-11-b)
  remarks?: string // additional comments which would be
  hours: IHorseRidingHour[]
}

export interface IHorseRidingHour {
  hour: string,
  trainer: string[],
  remarks?: string,
  trainingsDetails: ITrainingDetail[]
}

export interface ITrainingDetail {
  kidName: string,
  horse: string, // undefined is default - matcher engine will handle it
}

/*Archive */
//IHorseRidingDay[]


/*Administration console*/
export interface IStableAsset {
  clients: IKido[],
  horses: IHorso[],
  trainers: IInstructo[]
}

export interface IKido {
  //_id: number, //mongo id
  name: string, // unique!!!
  descr?: string,
  remarks?: string
  prefs: PrefType //
  // last level of prefs is excludes
}

/*  Important type - defines kido preferences for horse (horso.name) selection  */
/* total no of elements $lte total number of horses in stables
the levels of match are: 'best' | 'nice' | 'ok' | 'limp' | 'excl'
last (5th) level of prefs is excludes - horses which mustn't be selected for any training */
export type PrefType = {[prefCategory:string]:string[]}
export type prefCategory = 'best' | 'nice' | 'isok' | 'limp' | 'excl'

export default class DataModel{
  static readonly allPrefCat= ['best', 'nice', 'isok', 'limp', 'excl']
  static readonly incPrefCat = ['best', 'nice', 'isok', 'limp']
  static readonly incPrefCatRev = ['limp','isok','nice', 'best']
  static readonly excPrefCat = ['excl']

  public static getPrefCatValue(prefCat: string): number{
    switch (prefCat){
      case 'best': return 0
      case 'nice': return 1
      case 'isok': return 2
      case 'limp': return 3
      default: return -10000000000000  //'excl' //todo set to -1 after tests
    }
  }
}

export interface IInstructo {
  name: string // unique!!!
  descr?: string
  remarks?: string
}

export interface IHorso {
  name: string // unique!!!
  descr?: string
  remarks?: string
}

export interface IMatchOptionInfo {
  horso: string,
  kido: string,
  cost: number
}

export interface IRankedHourlySolution {
  solutionDetails: ITrainingDetail[],
  cost: number
}

export interface IResultList extends BackendData{
  results: IHorseRidingHour[] //array of a single result for every hour in daily query
}

export interface IBestSolution extends BackendData{
  solution: IHorseRidingDay
}

export interface BackendData {
  errorMsg?: string
}
