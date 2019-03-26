import Utils from "../utils/Utils";

export interface IInterfaceObj {
  req: boolean //is required field
  altReq?: string, // one of fields sharing the same group should be submitted
  key: string
  type: string
  anyOf?: any[]
  isArr?: boolean
  regEx?: string
  minL?: number //max string/array length
  maxL?: number
  minV?: number //max number value
  maxV?: number
  transient?: boolean //fields marked as transient are removed from 'data', and returned
}

export abstract class BaseValidator {

  protected patternCheck(data: any, patternName: string, type?: string): string {
    let objPatternArr = this.getPatternByName(patternName, type)
    if (!objPatternArr) {
      return `Internal error: missing interface/pattern definition for: ${patternName}`
    }
    let missingKeys: string[] = []
    let actualKeys = Object.keys(data)
    objPatternArr.filter(fieldPattern => {
      return fieldPattern.req
    }).forEach(inter => {
      if (!actualKeys.includes(inter.key)) {
        missingKeys.push(inter.key)
      }
    })
    if (missingKeys.length) {
      return `Internal error: object properties are missing: ${missingKeys.join(',')}`
    }
    let allGroups = objPatternArr.filter(fieldPattern => {
      return fieldPattern.altReq
    })
      .map(fieldPattern => {
        return fieldPattern.altReq
      })
    if (allGroups.length) {
      allGroups = [...new Set(allGroups)]
      for (let groupOfFields of allGroups) {

        // check if only one field of list is filled
        let namesOfFieldsInGroup = objPatternArr.filter(fieldPattern => {
          return fieldPattern.altReq == groupOfFields
        }).map(fieldPattern => {
          return fieldPattern.key
        })

        let groupFieldsCount = Utils.intersection(actualKeys, namesOfFieldsInGroup).length
        if (groupFieldsCount < 1) {
          return `Internal error: one of the fields: ${namesOfFieldsInGroup.join(',')} has to be submitted`
        }
        if (groupFieldsCount > 1) {
          return `Internal error: just one of the fields: ${namesOfFieldsInGroup.join(',')} has to be submitted`
        }
      }
    }

    for (let actualKey of actualKeys) {
      let regex = RegExp('\{|\}|\'|\"')
      if (regex.test(data[actualKey])) {
        return `Special characters are not allowed`
      }
      let fieldPattern = objPatternArr.find(inter => {
        return inter.key === actualKey
      })
      if (fieldPattern) {
        if (typeof data[actualKey] != fieldPattern.type) {
          return `Internal error: type of: ${actualKey} is incorrect`
        }
        if (fieldPattern.isArr && !Array.isArray(data[actualKey])) {
          return `Internal error: ${actualKey} is not an array`
        }
        if (((fieldPattern.maxL && data[actualKey].length > fieldPattern.maxL)
          || (fieldPattern.minL && data[actualKey].length < fieldPattern.minL)) && fieldPattern.req) {
          return `Internal error: ${actualKey}: '${data[actualKey]}' length out of bounds (${fieldPattern.minL ? fieldPattern.minL : 0}-${fieldPattern.maxL ? fieldPattern.maxL : 200})`
        }
        if (((fieldPattern.minV && +data[actualKey] < fieldPattern.minV) ||
          (fieldPattern.maxV && +data[actualKey] > fieldPattern.maxV)) && fieldPattern.req) {
          return `Internal error: ${actualKey}: '${data[actualKey]}' value out of bounds (${fieldPattern.minL ? fieldPattern.minL : 0}-${fieldPattern.maxL ? fieldPattern.maxL : 200})`
        }
        if (fieldPattern.anyOf && !fieldPattern.anyOf.includes(data[actualKey])) {
          return `Internal error: ${actualKey}: '${data[actualKey]}' should be any of ${fieldPattern.anyOf.join(', ')}`
        }
        if (fieldPattern.regEx) {
          regex = RegExp(fieldPattern.regEx)
          if (regex.test(data[actualKey])) {
            return `Internal error: regEx test failed`
          }
        }
      } else {
        return `Internal error: surplus property: ${actualKey} added to object`
      }
    }
    return ''
  }

  // a handicapped way of hardcoding the interfaces for objects - still better then anything
  protected abstract getPatternByName(name: string, type?: string): IInterfaceObj[]

}