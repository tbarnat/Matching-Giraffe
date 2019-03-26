//RUN WITH TAP-SPEC: node test/4_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest
let dailyQueries = require('./4_input').dailyQueries
let response0 = require('./4_input').response0

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {no:0, action:'get_matches', reqData:dailyQueries[0], success:true, resData:response0},
  {no:1, action:'get_matches', reqData:dailyQueries[1], success:false, resData:{}}, //case1: to many fields
  {no:2, action:'get_matches', reqData:dailyQueries[2], success:false, resData:{}}, //case2: to few fields
  {no:3, action:'get_matches', reqData:dailyQueries[3], success:false, resData:{}}, //case3: to incorrect structure
  {no:4, action:'get_matches', reqData:dailyQueries[4], success:false, resData:{}}, //case4: misspelled keys
  {no:5, action:'get_matches', reqData:dailyQueries[5], success:false, resData:{}}, //case5: incorrect day format - to long
  {no:6, action:'get_matches', reqData:dailyQueries[6], success:false, resData:{}}, //case6: incorrect day format - not number
  {no:7, action:'get_matches', reqData:dailyQueries[7], success:false, resData:{}}, //case7: incorrect day format - not convertable to date
  {no:8, action:'get_matches', reqData:dailyQueries[8], success:false, resData:{}}, //case8: day already exists
  {no:9, action:'get_matches', reqData:dailyQueries[9], success:false, resData:{}}, //case9: hour format incorrect
  {no:10, action:'get_matches', reqData:dailyQueries[10], success:false, resData:{}}, //case10: hours not sorted
  {no:11, action:'get_matches', reqData:dailyQueries[11], success:false, resData:{}}, //case11: kid does not exist
  {no:12, action:'get_matches', reqData:dailyQueries[12], success:false, resData:{}}, //case12: kid does not exist
  {no:13, action:'get_matches', reqData:dailyQueries[13], success:false, resData:{}}, //case13: horse does not exist
  {no:14, action:'get_matches', reqData:dailyQueries[14], success:false, resData:{}}, //case14 trainer does not exist
  {no:15, action:'get_matches', reqData:dailyQueries[15], success:false, resData:{}}, //case:15 excluded horse does not exist
  {no:16, action:'get_matches', reqData:dailyQueries[16], success:false, resData:{}}, //case:16 repeated data - trainers
  {no:17, action:'get_matches', reqData:dailyQueries[17], success:false, resData:{}}, //case:17 repeated data - kids
  {no:18, action:'get_matches', reqData:dailyQueries[18], success:false, resData:{}}, //case:18 repeated data - predefined horses
  {no:19, action:'get_matches', reqData:dailyQueries[19], success:false, resData:{}}, //case:19 repeated data - horse in excluded and in predefined match
  {no:20, action:'get_matches', reqData:dailyQueries[20], success:false, resData:{}}, //case:20 incomplete preferences
  {no:21, action:'get_matches', reqData:dailyQueries[21], success:false, resData:{}}, //case:21 incomplete preferences
  {no:22, action:'get_matches', reqData:dailyQueries[22], success:false, resData:{}}, //case:22 - nothing to solve
]

genericTest('### ### Get matches test ### ###','qwe','asd', req_res_arr)

//execute db_init first to get proper db values for test - user 'qwe'

//case:0 - calibrating CORRECT query
