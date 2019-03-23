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
  kidName: string | undefined,
  horse?: string | undefined, //rewritten to result if predefined. Matched by engine if undefined
}