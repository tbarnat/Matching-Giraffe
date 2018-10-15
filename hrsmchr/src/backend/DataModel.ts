
/*Horse Riding Day*/
export interface IHorseRidingDay {
  day: Date
  hours: IHorseRidingHour[]
}

export interface IHorseRidingHour {
  hour: string,
  trainingsDetails: ITrainingDetail[]
}

export interface ITrainingDetail {
  kidId: string, // this have to match Kido.id
  horse: string | undefined, // undefined is default - matcher engine will handle it
  trainer: string,
  remarks?: string
}

/*Archive */
export interface IArchiveCalendar {
  [shortDate: string]: IHorseRidingDay
}

/*Administration console*/
export interface IStableAsset {
  clients: IKido[],
  horses: IHorso[],
  trainers: ITrainer[]
}

export interface IKido {
  id: string,
  name: string,
  surname?: string,
  remarks?: string
  prefs: string[][] // array will have max 6 levels on first level, and max  elements <= total number of horses
  excludes: string[]
}

export interface ITrainer {
  id: string,
  name?: string
}

export interface IHorso {
  id: string,
  name?: string
}