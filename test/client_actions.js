const Client = require('../client-frontend/build/dist/Client').default;
let client = new Client()

let getSomeInteraction = async () => {

  await client.confirmInitialized()

  let requestId
  requestId = client.login('test_user', 'asd')
  let resultLogin = await client.waitFor(requestId)
  if (!resultLogin.success) {
    console.log('ERROR: could not log in')
  }
  console.log('making request')

  let resultGeneric
  let data = {}

  //success: true
  data = {name:'Aaa0',remarks:''}
  requestId = client.sendRequest('edit_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //success: true
  data = {name:'Aaa0'}
  requestId = client.sendRequest('remove_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //success: false
  data = {name:'Aaa1',remarks:'asdasdas'}
  requestId = client.sendRequest('new_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list limited to ten
  console.log('--10--')
  data = {query:''}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list limited to ten
  data = {query:'a'}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - 5 elem
  console.log('--5--')
  data = {query:'aaa'}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - 1 elem
  console.log('--1--')
  data = {query:'aAa1'}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - 0 elem
  console.log('--0--')
  data = {query:'Aaa11'}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - 0 elem
  data = {query:'aaa11'}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - 0 elem
  data = {query:'aaa11', taken: []}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - few elem without taken
  console.log('--10--')
  data = {query:'a', taken: ['Aaa1','Aaa2','aaa3','aab1']}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - few elem without taken
  data = {query:'', taken: ['Aaa1','Aaa2','aaa3','aab1']}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)

  //list - few elem without taken
  console.log('--5--')
  data = {query:'aaa', taken: ['Aaa1','Aaa2','aaa3','aab1']}
  requestId = client.sendRequest('list_horse',data)
  resultGeneric = await client.waitFor(requestId)
  console.log('INFO:  got results: ',resultGeneric)
}

getSomeInteraction()

