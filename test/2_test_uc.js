//RUN WITH TAP-SPEC: node test/2_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  //horses
  {no:1, action:'new_kid', reqData:{name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':[], 'isok':[], 'limp':[], 'excl':[]}}, success:false, errorMsg:
        'Before adding kid, please add all horses in your Riding Center' },
  {no:2, action:'haveAny_horse', reqData:{}, success:true, resData:false},
  {no:3, action:'new_horse', reqData:{name: 'Jolly Jumper', remarks: ''}, success:true, resData:{}},
  {no:4, action:'get_horse', reqData:{name: 'Stinky'}, success:false},
  {no:5, action:'get_horse', reqData:{name: 'Jolly Jumper'}, success:true, resData:{name: 'Jolly Jumper', remarks: ''}},
  {no:6, action:'new_horse', reqData:{name: 'Buddy', remarks: 'quickest buddy on the universe', descr: 'brownish', maxDailyWorkload: 2}, success:true, resData:{}},
  {no:7, action:'haveAny_horse', reqData:{query:'a'}, success:true, resData:true},
  {no:8, action:'edit_horse', reqData:{newName: 'Hasty Harry', name: 'Buddy', remarks: ' :)  \n \\ ^^ '}, success:true, resData:{}},
  {no:9, action:'new_horse', reqData:{name: 'X', remarks: 'reject!!'}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)'},
  {no:10, action:'edit_horse', reqData:{name: 'X', remarks: 'reject!!'}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)'},
  {no:11, action:'new_horse', reqData:{name: 'xxxxx', remarks: ' { '}, success:false, errorMsg: 'Special characters are not allowed' } ,
  {no:12, action:'edit_horse', reqData:{name: 'xxxxx', remarks: ' } '}, success:false, errorMsg: 'Special characters are not allowed' } ,
  {no:12, action:'new_horse', reqData:{remarks: 'MyHorso'}, success:false, errorMsg: 'Internal error: object properties are missing: name' },
  {no:13, action:'edit_horse', reqData:{remarks: 'MyHorso'}, success:false, errorMsg: 'Internal error: object properties are missing: name' },
  {no:14, action:'new_horse', reqData:{name: 'Reject2', remarks: '', reject: true}, success:false, errorMsg: 'Internal error: surplus property: reject added to object' },
  {no:15, action:'edit_horse', reqData:{name: 'Reject2', remarks: '', reject: true}, success:false, errorMsg: 'Internal error: surplus property: reject added to object' },
  {no:16, action:'new_horse', reqData:{name: 'Reject3', remarks: 13}, success:false, errorMsg: 'Internal error: type of: remarks is incorrect' },
  {no:17, action:'edit_horse', reqData:{name: 'Reject3', remarks: 13}, success:false, errorMsg: 'Internal error: type of: remarks is incorrect' },
  {no:18, action:'new_horse', reqData:{name: 'Reject4Reject4Reject4Reject4', remarks: ''}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)' } ,
  {no:19, action:'edit_horse', reqData:{name: 'Reject4Reject4Reject4Reject4', remarks: ''}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)' } ,
  {no:20, action:'new_horse', reqData:{
      name: 'Reject5',
      remarks: 'asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew'
    }, success:false, errorMsg: 'Internal error: remarks length out of bounds (0-200)'},
  {no:21, action:'edit_horse', reqData:{
      name: 'Reject5',
      remarks: 'asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew'
    }, success:false, errorMsg: 'Internal error: remarks length out of bounds (0-200)'},
]

genericTest('### ### Basic use case with horses and kids ### ###','test_user2','asd', req_res_arr)

