//RUN WITH TAP-SPEC: node test/3_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {no:2, action:'new_horse', reqData:{name: 'Jolly Jumper', remarks: ''}, success:true, resData:{}},
]

genericTest('### ### Saving listing and removing day ### ###','test_user2','asd', req_res_arr)

// get_whole_asset
//save_day
//get_day
//remove_day