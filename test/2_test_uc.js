//RUN WITH TAP-SPEC: node test/2_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./genericTest').genericTest

// req_res_arr: {action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  //horses
  {action:'new_kid', reqData:{name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':[], 'isok':[], 'limp':[], 'excl':[]}}, success:false, errorMsg:
        'Before adding kid, please add all horses in your Riding Center' },
  {action:'haveAny_horse', reqData:{}, success:true, resData:false},
  {action:'new_horse', reqData:{name: 'Jolly Jumper', remarks: ''}, success:true, resData:{}},
  {action:'get_horse', reqData:{name: 'Stinky'}, success:false},
  {action:'get_horse', reqData:{name: 'Jolly Jumper'}, success:true, resData:{name: 'Jolly Jumper', remarks: ''}},
  {action:'new_horse', reqData:{name: 'Buddy', remarks: 'quickest buddy on the universe', descr: 'brownish', maxDailyWorkload: 2}, success:true, resData:{}},
  {action:'haveAny_horse', reqData:{query:'a'}, success:true, resData:true},
  {action:'edit_horse', reqData:{newName: 'Hasty Harry', name: 'Buddy', remarks: ' :)  \n \\ ^^ '}, success:true, resData:{}},
  {action:'new_horse', reqData:{name: 'X', remarks: 'reject!!'}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)'},
  {action:'edit_horse', reqData:{name: 'X', remarks: 'reject!!'}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)'},
  {action:'new_horse', reqData:{name: 'xxxxx', remarks: ' { '}, success:false, errorMsg: 'Special characters are not allowed' } ,
  {action:'edit_horse', reqData:{name: 'xxxxx', remarks: ' } '}, success:false, errorMsg: 'Special characters are not allowed' } ,
  {action:'new_horse', reqData:{remarks: 'MyHorso'}, success:false, errorMsg: 'Internal error: object properties are missing: name' },
  {action:'edit_horse', reqData:{remarks: 'MyHorso'}, success:false, errorMsg: 'Internal error: object properties are missing: name' },
  {action:'new_horse', reqData:{name: 'Reject2', remarks: '', reject: true}, success:false, errorMsg: 'Internal error: surplus property: reject added to object' },
  {action:'edit_horse', reqData:{name: 'Reject2', remarks: '', reject: true}, success:false, errorMsg: 'Internal error: surplus property: reject added to object' },
  {action:'new_horse', reqData:{name: 'Reject3', remarks: 13}, success:false, errorMsg: 'Internal error: type of: remarks is incorrect' },
  {action:'edit_horse', reqData:{name: 'Reject3', remarks: 13}, success:false, errorMsg: 'Internal error: type of: remarks is incorrect' },
  {action:'new_horse', reqData:{name: 'Reject4Reject4Reject4Reject4', remarks: ''}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)' } ,
  {action:'edit_horse', reqData:{name: 'Reject4Reject4Reject4Reject4', remarks: ''}, success:false, errorMsg: 'Internal error: name length out of bounds (2-20)' } ,
  {action:'new_horse', reqData:{
      name: 'Reject5',
      remarks: 'asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew'
    }, success:false, errorMsg: 'Internal error: remarks length out of bounds (0-200)'},
  {action:'edit_horse', reqData:{
      name: 'Reject5',
      remarks: 'asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew'
    }, success:false, errorMsg: 'Internal error: remarks length out of bounds (0-200)'},
]

genericTest('### ### Basic use case with horses and kids ### ###','test_user2','asd', req_res_arr)

