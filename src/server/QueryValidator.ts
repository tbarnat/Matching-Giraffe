import {Database} from "./Database";
import {IHorseRidingDayQ, IHorso, IKido} from "./DataModel";

export default class QueryValidator {

  private _allHorsos: IHorso[]
  private _allHorsosString: string[]
  private _allKidos: IKido[]

  //private _allKidosString: string[]

  constructor(private userName: string, private db: Database) {}

  public async init() {
    let promiseArr: any[] = []
    promiseArr.push(this.db.find('horsos', {userName: this.userName}))
    promiseArr.push(this.db.find('kidos', {userName: this.userName}))
    let resolvedArr = await Promise.all(promiseArr)
    this._allHorsos = (resolvedArr[0] as IHorso[])
    this._allHorsosString = this._allHorsos.map(horso => horso.name)
    this._allKidos = resolvedArr[1] as IKido[]
    //this._allKidosString = this._allKidos.map(kido => kido.name)

  }

  // returns error msg or empty string
  public validateDailyQuery(dailyQuery: IHorseRidingDayQ): string {

    // check if types are correct
    //          no such day in db already
    //          hour names are numbers and are unique
    //          all kidos names matches the ones in db
    //          all horsos names matches the ones in db
    //          all kidos has all horsos in prefs
    // return error msg starting with (Validation) or empty string

    return ''
  }

  public get allKidos(): IKido[] {
    return this._allKidos;
  }

  public get allHorsosString(): string[] {
    return this._allHorsosString;
  }
}