//RUN WITH TAP-SPEC: node test/3_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {no:0, action:'save_matches', reqData:{
      day: "2019-01-02",
      hours: [
        {
          hour: "1230",
          trainer: [
            "Paulina"
          ],
          remarks: "",
          trainingsDetails: [
            {
              kidName: "Julka Mala",
              horse: "Bracio"
            }
          ]
        }
      ],
    }, success:true},
  {no:1, action:'get_day', reqData:{name:'2019-01-01'}, success:true},
  {no:2, action:'list_days', reqData:{name:'2019-01-01'}, success:true, resData:[
        "2019-01-01T00:00:00.000Z",
        "2019-01-02T00:00:00.000Z"
      ]},
  {no:3, action:'remove_day', reqData:{name:'2019-01-02'}, success:true},
  {no:4, action:'list_days', reqData:{name:'2019-01-01'}, success:true, resData:[
      "2019-01-01T00:00:00.000Z",
    ]},
]

genericTest('### ### Saving listing and removing day ### ###','qwe','asd', req_res_arr)

// get_whole_asset
//save_day
//get_day
//remove_day