const Client = require('../client-frontend/build/dist/Client').default;

let client = new Client()

const dailyQuery0 = require('./4_input').dailyQuery0
const dailyQuery1 = require('./4_input').dailyQuery1
const dailyQuery2 = require('./4_input').dailyQuery2
const dailyQuery3 = require('./4_input').dailyQuery3
const dailyQuery4 = require('./4_input').dailyQuery4
const dailyQuery5 = require('./4_input').dailyQuery5
const dailyQuery6 = require('./4_input').dailyQuery6
const dailyQuery7 = require('./4_input').dailyQuery7
const dailyQuery8 = require('./4_input').dailyQuery8
const dailyQuery9 = require('./4_input').dailyQuery9
const dailyQuery10 = require('./4_input').dailyQuery10
const dailyQuery11 = require('./4_input').dailyQuery11
const dailyQuery12 = require('./4_input').dailyQuery12
const dailyQuery13 = require('./4_input').dailyQuery13
const dailyQuery14 = require('./4_input').dailyQuery14
const dailyQuery15 = require('./4_input').dailyQuery15
const dailyQuery16 = require('./4_input').dailyQuery16
const dailyQuery17 = require('./4_input').dailyQuery17
const dailyQuery18 = require('./4_input').dailyQuery18
const dailyQuery19 = require('./4_input').dailyQuery19
const dailyQuery20 = require('./4_input').dailyQuery20
const dailyQuery21 = require('./4_input').dailyQuery21
const dailyQuery22 = require('./4_input').dailyQuery22


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
        if(reqNumber === 23){ //23
            clearInterval(reqInt)
            console.log('...done')
        }
    }, 50)

}

getSomeInteraction()

