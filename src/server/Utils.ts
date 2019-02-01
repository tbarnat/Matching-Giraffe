export default class Utils {

  public static async asyncWhileRecursive(condition: () => boolean, inWhileBody: () => any) {
    if (condition()) { //condition() is not waited for, hence it allows timeout to be pushed to js eventLoop
      await inWhileBody()
      await this.asyncWhileRecursive(condition, inWhileBody)
    }
  }

  //if strongLogicalCondition is true, loop will continue even in case of timeout
  public static async asyncWhile( softLogicalCondition: () => boolean, strongLogicalCondition: () => boolean, inWhileBody: () => any, timeout: number){
    let isTimedOut: boolean = false
    setTimeout(() => {isTimedOut = true},timeout)
    await this.asyncWhileRecursive(()=> {return (softLogicalCondition() && !isTimedOut) || strongLogicalCondition() },inWhileBody)
  }

  private static allArraysCombinations(arr: any[]): any[] {
    if (arr.length == 1) {
      return arr[0];
    } else {
      let result = [];
      let allCasesOfRest: any[] = Utils.allArraysCombinations(arr.slice(1));  // recur with the rest of array
      for (let i = 0; i < allCasesOfRest.length; i++) {
        for (let j = 0; j < arr[0].length; j++) {
          result.push(arr[0][j] + allCasesOfRest[i]);
        }
      }
      return result;
    }
  }


  const data = []
  const keys = ['a', 'b', 'c']

  for (const k of keys) {
  const list = []
  data.push(list)
  for (let i=0; i<3; i++) {
  list.push(${k}${i})
}
}

const result = data.reduce((a, b) => a.reduce((r, v) => r.concat(b.map(w => [].concat(v, w))), []));

console.log('data', data)
console.log('result', result)

}