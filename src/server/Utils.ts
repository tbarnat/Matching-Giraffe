export default class Utils {

  public static async asyncWhileRecursive(condition: () => boolean, inWhileBody: () => any) {
    if (condition()) { //condition() is not waited for, hence it allows timeout to be pushed to js eventLoop
      await inWhileBody()
      await this.asyncWhileRecursive(condition, inWhileBody)
    }
  }

  //if strongLogicalCondition is true, loop will continue even in case of timeout
  public static async asyncWhile( weakLogicalCondition: () => boolean, strongLogicalCondition: () => boolean, inWhileBody: () => any, timeout: number){
    let isTimedOut: boolean = false
    setTimeout(() => {isTimedOut = true},timeout)
    await this.asyncWhileRecursive(()=> {return (weakLogicalCondition() && !isTimedOut) || strongLogicalCondition() },inWhileBody)
  }

}