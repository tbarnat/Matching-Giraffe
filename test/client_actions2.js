const Client = require('../client-frontend/build/dist/Client').default;
let client = new Client('ws://localhost:8080')

let getSomeInteraction = async () => {

  await client.confirmInitialized()

  let requestId
  requestId = client.login('test_user2', 'asd')
  let resultLogin = await client.waitFor(requestId)
  if (!resultLogin.success) {
    console.log('\nERROR: could not log in')
  }
  console.log('\nmaking request')

  let resultGeneric
  let data = {}

  console.log('\n----> REJECT - no horses')
  data = {name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':[], 'isok':[], 'limp':[], 'excl':[]}}
  requestId = client.sendRequest('new_kid', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept - but returns false')
  data = {}
  requestId = client.sendRequest('haveAny_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept')
  data = {name: 'Jolly Jumper', remarks: '', addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept')
  data = {name: 'Buddy', remarks: 'quickest buddy on the universe', descr: 'brownish', maxDailyWorkload: 2, addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept - returns true')
  data = {}
  requestId = client.sendRequest('haveAny_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept (edit)')
  data = {newName: 'Hasty Harry', name: 'Buddy', remarks: ':)^^', addAsHorse:''}
  requestId = client.sendRequest('edit_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT min length')
  data = {name: '', remarks: 'reject!!', addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT required fields')
  data = {remarks: 'reject!!', addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT too many fields')
  data = {name: 'Reject2', remarks: '', reject: true, addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT types')
  data = {name: 'Reject3', remarks: 13, addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT fields length')
  data = {name: 'Reject4Reject4Reject4Reject4', remarks: '', addAsHorse:''}
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT fields length')
  data = {
    name: 'Reject5', addAsHorse:'',
    remarks: 'asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew asdfasgfadsgsadgwqetgfwefvxxcvsfwserfew'
  }
  requestId = client.sendRequest('new_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT no name')
  data = {newName:'Lollipop', remarks: 'reject!!', addAsHorse:''}
  requestId = client.sendRequest('edit_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT name length')
  data = {newName:'Lollipop should be rejected - no offence', name:'Jolly Jumper', remarks: 'reject!!', addAsHorse:''}
  requestId = client.sendRequest('edit_horse', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  // kido

  console.log('\n----> Accept')
  data = {name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':['Hasty Harry'], 'limp':[], 'excl':[]}}
  requestId = client.sendRequest('new_kid', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept - returns true')
  data = {}
  requestId = client.sendRequest('haveAny_kid', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> Accept')
  data = {newName:'Kido1 TU2', name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper','Hasty Harry'], 'isok':[], 'limp':[], 'excl':[]}}
  requestId = client.sendRequest('edit_kid', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  console.log('\n----> REJECT on preferences')
  data = {name:'Kido0 TU2', remarks: '', prefs:{'best':[], 'nice':['Jolly Jumper'], 'isok':[], 'limp':[], 'excl':[]}}
  requestId = client.sendRequest('edit_kid', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)

  // prefs
  console.log('\n----> SOME VALID DATA')
  data = 'Kido0 TU2'
  requestId = client.sendRequest('prefs_template', data)
  resultGeneric = await client.waitFor(requestId)
  console.log('\nINFO:  got results: ', resultGeneric)


}

getSomeInteraction()

