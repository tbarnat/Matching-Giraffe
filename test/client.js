const Client = require('../client-frontend/build/dist/Client').default;

let client = new Client()

// const dailyQuery = require('./dailyQueries').dailyQuery3h
// const dailyQuery = require('./dailyQueries').dailyQuery3h_2
const dailyQuery = require('./dailyQueries').dailyQuery4h
// const dailyQuery = require('./dailyQueries').dailyQuery4h_2
// const dailyQuery = require('./dailyQueries').dailyQuery4h_simple

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

    requestId = client.sendRequest('get_matches',dailyQuery)
    let result = await client.waitFor(requestId)
    console.log('INFO:  got results')
    console.log('--------------------------------')
    console.log(JSON.stringify(result,null,2))

    /*let newTrainer = {name:'newGuy',remarks:'temp'}
    requestId = client.sendRequest('new_trainer',newTrainer)
    let resultNewT = await client.waitFor(requestId)
    console.log('INFO:  got results: ',resultNewT)*/

    /*let editTrainer = {name:'newGuy',remarks:'temp2'}
    requestId = client.sendRequest('edit_trainer',editTrainer)
    let resultEditT = await client.waitFor(requestId)
    console.log('INFO:  got results: ',resultEditT)*/

    /*let removeTrainer = {name:'newGuy',remarks:'temp2'}
    requestId = client.sendRequest('remove_trainer',removeTrainer)
    let resultRemoveT = await client.waitFor(requestId)
    console.log('INFO:  got results: ',resultRemoveT)*/

}

getSomeInteraction()

