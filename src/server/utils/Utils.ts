export default class Utils {

  public static async asyncWhileRecursive(condition: () => boolean, inWhileBody: () => any) {
    if (condition()) { //condition() is not waited for, hence it allows timeout to be pushed to js eventLoop
      await inWhileBody()
      await this.asyncWhileRecursive(condition, inWhileBody)
    }
  }

  //if strongLogicalCondition is true, loop will continue even in case of timeout
  public static async asyncWhile(softLogicalCondition: () => boolean, strongLogicalCondition: () => boolean, inWhileBody: () => any, timeout: number) {
    let isTimedOut: boolean = false
    setTimeout(() => {
      isTimedOut = true
    }, timeout)
    await this.asyncWhileRecursive(() => {
      return (softLogicalCondition() && !isTimedOut) || strongLogicalCondition()
    }, inWhileBody)
  }

  // this is a magic, stack-taken, and adjusted function, and it works like this:
  // [ [1], [2,3] ] -> [ [ 1, 2 ], [ 1, 3 ] ]
  // [ [1], [2] ]   -> [ [ 1, 2 ] ]
  // [ [1,2] ]      -> [ [ 1, 2 ] ]
  // [ [1] ]        -> [ [ 1 ] ]
  // 'With Great Power Comes Great Responsibility'
  public static allArrComb(arr: any[][]): any[] {
    if (arr.length == 1 && arr[0].length == 1) {
      return arr
    }
    return arr.reduce((a, b) => a.reduce((r: any, v: any) => r.concat(b.map((w: any) => [].concat(v, w))), []));
  }

  public static strArrHasDuplicates(strArr: string[]): boolean {
    strArr.sort()
    for (let i = 0; i < strArr.length - 1; i++) {
      if (strArr[i + 1] == strArr[i]) {
        return true
      }
    }
    return false
  }

  public static intersection(arr1: any[], arr2: any[]): any[] {
    let intersection = arr1.filter(item => -1 !== arr2.indexOf(item));
    return [...new Set(intersection)]
  }
}