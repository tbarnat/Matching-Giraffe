const Client = require('../client-frontend/build/dist/Client').default;
const tableHelper = require('./tableHelper.js')

let client = new Client()

// const dailyQuery = require('./zDailyQueriesValid').dailyQueryBasic
// const dailyQuery = require('./zDailyQueriesValid').dailyQuery3h
// const dailyQuery = require('./zDailyQueriesValid').dailyQuery3h_2
const dailyQuery = require('./zDailyQueriesValid').dailyQueryTEMP
// const dailyQuery = require('./zDailyQueriesValid').dailyQuery4h_2
// const dailyQuery = require('./zDailyQueriesValid').dailyQuery4h_simple

let getSomeInteraction = async () => {

  await client.confirmInitialized()

  let requestId
  requestId = client.login('qwe', 'asd')
  let resultLogin = await client.waitFor(requestId)
  if (!resultLogin.success) {
    console.log('ERROR: could not log in')
  }
  console.log('making request')

  requestId = client.sendRequest('get_matches', dailyQuery)
  let result = await client.waitFor(requestId)
  console.log('---------------------------------')
  console.log('success:', result.success)
  if (result.success) {
    tableHelper.tableResults(result.data)
  } else {
    console.log(result.data.errorMsg)
  }
  console.log('---------------------------------')

}

getSomeInteraction()

