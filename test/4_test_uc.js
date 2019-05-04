//RUN WITH TAP-SPEC: node test/4_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest
let dailyQueries = require('./4_input').dailyQueries
let response0 = require('./4_input').response0
let response22 = require('./4_input').response22
let response23 = require('./4_input').response23
let response24 = require('./4_input').response24

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {no:0, action:'get_matches', reqData:dailyQueries[0], success:true, resData:response0},
  {no:1, action:'get_matches', reqData:dailyQueries[1], success:false, errorMsg: "Internal error: surplus property: foo added to object"}, //case1: to many fields
  {no:2, action:'get_matches', reqData:dailyQueries[2], success:false, errorMsg: "Internal error: object properties are missing: trainer"}, //case2: to few fields
  {no:3, action:'get_matches', reqData:dailyQueries[3], success:false, errorMsg: "Internal error: object properties are missing: kidName"}, //case3: to incorrect structure
  {no:4, action:'get_matches', reqData:dailyQueries[4], success:false, errorMsg: "Internal error: surplus property: remaks added to object"}, //case4: misspelled keys
  {no:5, action:'get_matches', reqData:dailyQueries[5], success:false, errorMsg: "Internal error: day: '2019-03-142' length out of bounds (10-10)"}, //case5: incorrect day format - to long
  {no:6, action:'get_matches', reqData:dailyQueries[6], success:false, errorMsg: "Day name: 2O19-03-I4 is not ok. Apply following format: YYYY-MM-DD"}, //case6: incorrect day format - not number
  {no:7, action:'get_matches', reqData:dailyQueries[7], success:false, errorMsg: "Day name: 2019-02-31 is not ok. Apply following format: YYYY-MM-DD"}, //case7: incorrect day format - not convertable to date
  {no:8, action:'get_matches', reqData:dailyQueries[8], success:true}, //case8: it is possible to override
  {no:9, action:'get_matches', reqData:dailyQueries[9], success:false, errorMsg: "Hour name: 12:30 is not ok. Apply following format: hhmm"}, //case9: hour format incorrect
  {no:10, action:'get_matches', reqData:dailyQueries[10], success:false, errorMsg: "Hours are entered in non-ascending order"}, //case10: hours not sorted
  {no:11, action:'get_matches', reqData:dailyQueries[11], success:false, errorMsg: "Kid by the name: Bug kid does not exist in db"}, //case11: kid does not exist
  {no:12, action:'get_matches', reqData:dailyQueries[12], success:false, errorMsg: "Internal error: kidName: 'x' length out of bounds (2-20)"}, //case12: kid does not exist
  {no:13, action:'get_matches', reqData:dailyQueries[13], success:false, errorMsg: "Horse by the name: Bug horse does not exist in db"}, //case13: horse does not exist
  {no:14, action:'get_matches', reqData:dailyQueries[14], success:false, errorMsg: "Trainer by the name: Bug trainer does not exist in db"}, //case14 trainer does not exist
  {no:15, action:'get_matches', reqData:dailyQueries[15], success:false, errorMsg: "Excluded horse by the name: Bug horse does not exist in db"}, //case:15 excluded horse does not exist
  {no:16, action:'get_matches', reqData:dailyQueries[16], success:false, errorMsg: "Trainers were duplicated for: 1230 "}, //case:16 repeated data - trainers
  {no:17, action:'get_matches', reqData:dailyQueries[17], success:false, errorMsg: "Kidos were duplicated for: 1230 "}, //case:17 repeated data - kids
  {no:18, action:'get_matches', reqData:dailyQueries[18], success:false, errorMsg: "Preselected horses were duplicated for: 1230 "}, //case:18 repeated data - predefined horses
  {no:19, action:'get_matches', reqData:dailyQueries[19], success:false, errorMsg: "Excluded horses were selected for 1230"}, //case:19 repeated data - horse in excluded and in predefined match
  {no:20, action:'get_matches', reqData:dailyQueries[20], success:false, errorMsg: "Internal error: kidName: 'IncompletePreferences' length out of bounds (2-20)"}, //case:20 incomplete preferences
  {no:21, action:'get_matches', reqData:dailyQueries[21], success:false, errorMsg: "InvalidPreferences have a non-existing horse: Bug-bug-bug in preferences"
  }, //case:21 incomplete preferences
  {no:22, action:'get_matches', reqData:dailyQueries[22], success:true, resData:response22}, //case:22 - nothing to solve
  {no:23, action:'get_matches', reqData:dailyQueries[23], success:true, resData:response23}, //case:23 query partially solved - one hour fully solved
  {no:24, action:'get_matches', reqData:dailyQueries[0], success:true, resData:response0},
  {no:25, action:'save_matches', reqData:response0.solution, success:true},
  {no:26, action:'get_matches', reqData:dailyQueries[24], success:true, resData:response24},
  {no:27, action:'save_matches', reqData:response24.solution, success:true},
]


genericTest('### ### Get matches test ### ###','qwe','asd', req_res_arr)

//execute db_init first to get proper db values for test - user 'qwe'

//case:0 - calibrating CORRECT query
