//RUN WITH TAP-SPEC: node test/3_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./genericTest').genericTest

// req_res_arr: {action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {action:'new_kid', reqData:{name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':[], 'isok':[], 'limp':[], 'excl':[]}}, success:false, errorMsg:
        'Before adding kid, please add all horses in your Riding Center' },
  {action:'new_horse', reqData:{name: 'Jolly Jumper', remarks: ''}, success:true, resData:{}},
  {action:'get_horse', reqData:{name: 'Jolly Jumper'}, success:true, resData:{name: 'Jolly Jumper', remarks: ''}},
  {action:'new_horse', reqData:{name: 'Buddy', remarks: 'quickest buddy on the universe', descr: 'brownish', maxDailyWorkload: 2}, success:true, resData:{}},
  {action:'haveAny_horse', reqData:{query:'a'}, success:true, resData:true},
  {action:'edit_horse', reqData:{newName: 'Hasty Harry', name: 'Buddy', remarks: ' :)  \n \\ ^^ '}, success:true, resData:{}},
  {action:'new_kid', reqData:{name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':['Hasty Harry'], 'limp':[], 'excl':[]}}, success:true, resData:{}},
  {action:'get_kid', reqData:{name: 'Steven'}, success:false, resData:{}},
  {action:'get_kid', reqData:{name: 'Steve'}, success:true, resData:{name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':['Hasty Harry'], 'limp':[], 'excl':[]}}},
  {action:'new_kid', reqData:{name:'Jessica', prefs:{'best':[], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper'], 'excl':[]}}, success:true, resData:{}},
  {action:'get_kid', reqData:{name:'Jessica'}, success:true, resData:{name:'Jessica', prefs:{'best':[], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper'], 'excl':[]}}},
  {action:'haveAny_kid', reqData:{}, success:true, resData:true},
  {action:'edit_kid', reqData:{newName:'Steven', name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':[], 'limp':[], 'excl':[]}}, success:false, errorMsg: 'Internal error: number of horsos in prefs incorrect'},
  {action:'edit_kid', reqData:{newName:'Steven', name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper','Hasty Harry'], 'isok':[], 'limp':[], 'excl':[]}}, success:true, resData:{}},
  {action:'prefs_template',reqData:'Steve',success:false, errorMsg: 'Internal error: No kid by the name: Steve'},
  {action:'prefs_template',reqData:'Steven',success:true,resData:{ best: [], nice: [ 'Jolly Jumper', 'Hasty Harry' ], isok: [], limp: [], excl: [] } },

  {action:'new_horse', reqData:{name: 'Foxy'}, success:false, resData:{}},// no adding scheme
  {action:'new_horse', reqData:{name: 'Foxy', addToPrefLevel:'good'}, success:false, errorMsg: 'Internal error: addToPrefLevel should be any of best, nice, isok, limp, excl' },
  {action:'new_horse', reqData:{name: 'Foxy', addToPrefLevel:'best'}, success:true, resData:{}},
  {action:'get_kid', reqData:{name: 'Jessica'}, success: true, resData:{name:'Jessica', prefs:{'best':['Foxy'], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper'], 'excl':[]}}}, //todo  resData

  {action:'new_kid', reqData:{name:'Margaret', remarks: '', prefs:{'best':['Jolly Jumper'], 'nice':['Foxy'], 'isok':[], 'limp':[], 'excl':['Hasty Harry']}}, success:true, resData:{}},

  {action:'new_horse', reqData:{name: 'Porche', addAsHorse:'Ghost'}, success:false, errorMsg:'Internal error: cannot add horse to preferences as: Ghost, because it doesn\'t exist in db'},
  {action:'new_horse', reqData:{name: 'Porche', addAsHorse:'Jolly Jumper'}, success:true, resData:{}},
  {action:'get_kid', reqData:{name: 'Jessica'}, success: true, resData:{name:'Jessica', prefs:{'best':['Foxy'], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper','Porche'], 'excl':[]}}}, //todo  resData

  {action:'edit_horse', reqData:{name: 'Jolly Jumper', newName:'Jolly Jumper'}, success: false, errorMsg: 'Edited none - new and old objects are the same'},
  {action:'edit_horse', reqData:{name: 'Jolly Jumper', newName:'Joyful'}, success: true, resData:{}},
  {action:'get_horse', reqData:{name: 'Joyful'}, success: true, resData:{ name: 'Joyful', remarks: '' } },
  {action:'remove_kid', reqData:{name: 'Dylan'}, success:false, errorMsg: 'Deleted none by the name: Dylan'},
  {action:'remove_kid', reqData:{name: 'Jessica'}, success: true, resData:{}},
  {action:'remove_horse', reqData:{name: 'Joyful'}, success: true, resData:{}},
  //{action:'get_horse' and action:get_kid  and compare state


  //rozbic na dwa osobne use case'y
]

genericTest('### ### Some more advanced use case with removals of horses and kids ### ###','test_user2','asd', req_res_arr)

