genericTest = require('./genericTest').genericTest

// req_res_arr: {action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {action:'new_horse', reqData:{name:'Aaa0'}, success:true, resData:{}},
  {action:'edit_horse', reqData:{name:'Aaa0',remarks:''}, success:true, resData:{}},
  {action:'remove_horse', reqData:{name:'Aaa0'}, success:true, resData:{}},
  {action:'list_horse', reqData:{query:''}, success:true, resData:[ 'Aaa1', 'Aaa2', 'aaa3', 'aaa4', 'aaa5', 'aab1', 'aab2', 'aab3', 'Abb4', 'Abb5' ]},
  {action:'list_horse', reqData:{query:'a'}, success:true, resData:[ 'Aaa1', 'Aaa2', 'aaa3', 'aaa4', 'aaa5', 'aab1', 'aab2', 'aab3', 'Abb4', 'Abb5' ]},
  {action:'list_horse', reqData:{query:'aaa'}, success:true, resData:[ 'Aaa1', 'Aaa2', 'aaa3', 'aaa4', 'aaa5' ]},
  {action:'list_horse', reqData:{query:'aAa1'}, success:true, resData:['Aaa1']},
  {action:'list_horse', reqData:{query:'Aaa11'}, success:true, resData:[]},
  {action:'list_horse', reqData:{query:'aaa11'}, success:true, resData:[]},
  {action:'list_horse', reqData:{query:'1'}, success:true, resData:[]},
  {action:'list_horse', reqData:{query:'a', taken: ['Aaa1','Aaa2','aaa3','aab1']}, success:true, resData:[ 'Aaa2', 'aaa3', 'aaa4', 'aaa5', 'aab1', 'aab2', 'aab3', 'Abb4', 'Abb5', 'Abb6' ]},
  {action:'list_horse', reqData:{query:'', taken: ['Aaa1','Aaa2','aaa3','aab1']}, success:true, resData:[ 'Aaa2', 'aaa3', 'aaa4', 'aaa5', 'aab1', 'aab2', 'aab3', 'Abb4', 'Abb5', 'Abb6' ] },
  {action:'list_horse', reqData:{query:'aaa', taken: ['Aaa1','Aaa2','aaa3','aab1']}, success:true, resData:[ 'Aaa2', 'aaa3', 'aaa4', 'aaa5' ]},
]

genericTest('Listing','test_user1','asd', req_res_arr)

