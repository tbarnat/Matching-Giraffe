//RUN WITH TAP-SPEC: node test/3_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {no:1, action:'new_kid', reqData:{name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':[], 'isok':[], 'limp':[], 'excl':[]}}, success:false, errorMsg:
        'Before adding kid, please add all horses in your Riding Center' },
  {no:2, action:'new_horse', reqData:{name: 'Jolly Jumper', remarks: ''}, success:true, resData:{}},
  {no:3, action:'get_horse', reqData:{name: 'Jolly Jumper'}, success:true, resData:{name: 'Jolly Jumper', remarks: ''}},
  {no:4, action:'new_horse', reqData:{name: 'Buddy', remarks: 'quickest buddy on the universe', descr: 'brownish', maxDailyWorkload: 2}, success:true, resData:{}},
  {no:5, action:'haveAny_horse', reqData:{query:'a'}, success:true, resData:true},
  {no:6, action:'edit_horse', reqData:{newName: 'Hasty Harry', name: 'Buddy', remarks: ' :)  \n \\ ^^ '}, success:true, resData:{}},
  {no:7, action:'new_kid', reqData:{name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':['Hasty Harry'], 'limp':[], 'excl':[]}}, success:true, resData:{}},
  {no:8, action:'get_kid', reqData:{name: 'Steven'}, success:false, resData:{}},
  {no:9, action:'get_kid', reqData:{name: 'Steve'}, success:true, resData:{name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':['Hasty Harry'], 'limp':[], 'excl':[]}}},
  {no:10, action:'new_kid', reqData:{name:'Jessica', prefs:{'best':[], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper'], 'excl':[]}}, success:true, resData:{}},
  {no:11, action:'get_kid', reqData:{name:'Jessica'}, success:true, resData:{name:'Jessica', prefs:{'best':[], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper'], 'excl':[]}}},
  {no:12, action:'haveAny_kid', reqData:{}, success:true, resData:true},
  {no:13, action:'edit_kid', reqData:{newName:'Steven', name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':[], 'limp':[], 'excl':[]}}, success:false, errorMsg: 'Internal error: number of horsos in prefs incorrect'},
  {no:14, action:'edit_kid', reqData:{newName:'Steven', name:'Steve', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper','Hasty Harry'], 'isok':[], 'limp':[], 'excl':[]}}, success:true, resData:{}},
  {no:15, action:'prefs_template',reqData:'Steve',success:false, errorMsg: 'Internal error: No kid by the name: Steve'},
  {no:16, action:'prefs_template',reqData:'Steven',success:true,resData:{ best: [], nice: [ 'Jolly Jumper', 'Hasty Harry' ], isok: [], limp: [], excl: [] } },

  {no:17, action:'new_horse', reqData:{name: 'Foxy'}, success:false, resData:{}},// no adding scheme
  {no:18, action:'new_horse', reqData:{name: 'Foxy', addToPrefLevel:'good'}, success:false, errorMsg: "Internal error: addToPrefLevel: 'good' should be any of best, nice, isok, limp, excl" },
  {no:19, action:'new_horse', reqData:{name: 'Foxy', addToPrefLevel:'best'}, success:true, resData:{}},
  {no:20, action:'get_kid', reqData:{name: 'Jessica'}, success: true, resData:{name:'Jessica', prefs:{'best':['Foxy'], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper'], 'excl':[]}}},

  {no:21, action:'new_kid', reqData:{name:'Margaret', remarks: '', prefs:{'best':['Jolly Jumper'], 'nice':['Foxy'], 'isok':[], 'limp':[], 'excl':['Hasty Harry']}}, success:true, resData:{}},

  {no:22, action:'new_horse', reqData:{name: 'Porshe', addAsHorse:'Ghost'}, success:false, errorMsg:'Internal error: cannot add horse to preferences as: Ghost, because it doesn\'t exist in db'},
  {no:23, action:'new_horse', reqData:{name: 'Porshe', addAsHorse:'Jolly Jumper'}, success:true, resData:{}},
  {no:24, action:'get_kid', reqData:{name: 'Jessica'}, success: true, resData:{name:'Jessica', prefs:{'best':['Foxy'], 'nice':[], 'isok':['Hasty Harry'], 'limp':['Jolly Jumper','Porshe'], 'excl':[]}}},

  {no:25, action:'edit_horse', reqData:{name: 'Jolly Jumper', newName:'Jolly Jumper'}, success: false, errorMsg: 'Edited none by the name: Jolly Jumper'},
  {no:26, action:'edit_horse', reqData:{name: 'Jolly Jumper', newName:'Joyful'}, success: true, resData:{}},
  {no:27, action:'get_horse', reqData:{name: 'Joyful'}, success: true, resData:{ name: 'Joyful', remarks: '' } },
  {no:28, action:'remove_kid', reqData:{name: 'Dylan'}, success:false, errorMsg: 'Deleted none by the name: Dylan'},
  {no:29, action:'remove_kid', reqData:{name: 'Jessica'}, success: true, resData:{}},
  {no:30, action:'remove_horse', reqData:{name: 'Joyful'}, success: true, resData:{}},
  {no:31, action:'get_kid', reqData:{name: 'Jessica'}, success: false, resData:{}},
  {no:32, action:'get_kid', reqData:{name: 'Steven'}, success: true, resData:{name: 'Steven', remarks: '', prefs:{'best':['Foxy'], 'nice':['Hasty Harry','Porshe'], 'isok':[], 'limp':[], 'excl':[]}}},
  {no:33, action:'edit_horse', reqData:{name: 'Foxy'}, success:false, errorMsg:'Edited none - new and old objects are the same'},
  {no:34, action:'edit_horse', reqData:{newName: 'Foxy', name: 'Foxy'}, success:false, errorMsg:'Edited none - new and old objects are the same'},
  {no:35, action:'edit_horse', reqData:{newName: 'Shifty', name: 'Foxy'}, success:true, resData:{}},
  {no:36, action:'get_kid', reqData:{name: 'Steven'}, success: true, resData:{name: 'Steven', remarks: '', prefs:{'best':['Shifty'], 'nice':['Hasty Harry','Porshe'], 'isok':[], 'limp':[], 'excl':[]}}},



  //rozbic na dwa osobne use case'y
]

genericTest('### ### Some more advanced use case with removals of horses and kids ### ###','test_user2','asd', req_res_arr)

