const Client = require('../client-frontend/build/dist/Client').default;

let client = new Client()

const dailyQuery0 = require('./zDailyQueriesInvalid').dailyQuery0
const dailyQuery1 = require('./zDailyQueriesInvalid').dailyQuery1
const dailyQuery2 = require('./zDailyQueriesInvalid').dailyQuery2
const dailyQuery3 = require('./zDailyQueriesInvalid').dailyQuery3
const dailyQuery4 = require('./zDailyQueriesInvalid').dailyQuery4
const dailyQuery5 = require('./zDailyQueriesInvalid').dailyQuery5
const dailyQuery6 = require('./zDailyQueriesInvalid').dailyQuery6
const dailyQuery7 = require('./zDailyQueriesInvalid').dailyQuery7
const dailyQuery8 = require('./zDailyQueriesInvalid').dailyQuery8
const dailyQuery9 = require('./zDailyQueriesInvalid').dailyQuery9
const dailyQuery10 = require('./zDailyQueriesInvalid').dailyQuery10
const dailyQuery11 = require('./zDailyQueriesInvalid').dailyQuery11
const dailyQuery12 = require('./zDailyQueriesInvalid').dailyQuery12
const dailyQuery13 = require('./zDailyQueriesInvalid').dailyQuery13
const dailyQuery14 = require('./zDailyQueriesInvalid').dailyQuery14
const dailyQuery15 = require('./zDailyQueriesInvalid').dailyQuery15
const dailyQuery16 = require('./zDailyQueriesInvalid').dailyQuery16
const dailyQuery17 = require('./zDailyQueriesInvalid').dailyQuery17
const dailyQuery18 = require('./zDailyQueriesInvalid').dailyQuery18


let getSomeInteraction = async () => {

    await client.confirmInitialized()
    console.log('INFO:  is initialized')

    let requestId
    requestId = client.login('qwe','asd')
    let resultLogin = await client.waitFor(requestId)
    if(resultLogin.success){
        console.log('INFO:  is logged in')
    }else{
        console.log('ERROR: could not log in')
    }

    let reqNumber = 0
    let reqInt = setInterval(async() => {
        let dailyQuery = 'dailyQuery' + reqNumber
        requestId = client.sendRequest('get_matches',eval(dailyQuery))
        let result = await client.waitFor(requestId)
        console.log('--------------------------------',reqNumber)
        console.log(JSON.stringify(result,null,2))
        reqNumber += 1
        if(reqNumber === 19){ //19
            clearInterval(reqInt)
            console.log('...done')
        }
    }, 50)

}

getSomeInteraction()

