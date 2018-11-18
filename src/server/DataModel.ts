/*Horse Riding Day - QUERY*/

export interface IHorseRidingDayQ {
  id: number, //db autoincrement
  day: string //the same as 'name', will be part of an url ie.: '20181011' (domain.pl/schedule20181011)
  remarks?: string // additional comments which would be
  hours: IHorseRidingHourQ[]
}

export interface IHorseRidingHourQ {
  hour: string,
  trainer: string[],
  trainingsDetails: ITrainingQ[]
}

export interface ITrainingQ {
  kidId: string, // this have to match Kido.id
  horse?: string, // undefined is default - matcher engine will handle it
  remarks?: string
}

/*Horse Riding Day - RESULT*/
export interface IHorseRidingDay {
  id: number, //db autoincrement
  day: string //the same as 'name', will be part of an url ie.: '20181011' (domain.pl/schedule20181011)
  remarks?: string // additional comments which would be
  hours: IHorseRidingHour[]
}

export interface IHorseRidingHour {
  hour: string,
  trainer: string[],
  trainingsDetails: ITrainingDetail[]
}

export interface ITrainingDetail {
  kidId: string, // this have to match Kido.id
  horse: string, // undefined is default - matcher engine will handle it
  remarks?: string
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
  id: number,//db autoincrement
  name: string,
  descr?: string,
  remarks?: string
  prefs: string[][] // array will have max 6 levels on first level, and max  elements <= total number of horses
  excludes: string[]
}

export interface IInstructo {
  id: number,//db autoincrement
  name: string
  descr?: string
  remarks?: string
}

export interface IHorso {
  id: number,//db autoincrement
  name: string
  descr?: string
  remarks?: string
}

