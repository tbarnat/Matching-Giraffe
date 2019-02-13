const Client = require('../client-frontend/build/dist/Client').default;

let client = new Client()

const dailyQuery = require('./dailyQueries').dailyQuery1

let getSomeInteraction = async () => {

    await client.confirmInitialized()
    console.log('is initialized')

    let requestId
    requestId = client.login('qwe','asd')
    await client.waitFor(requestId)
    console.log('is logged in')

    requestId = client.getMathes(dailyQuery)
    let result = await client.waitFor(requestId)
    console.log('got results')
    console.log('--------------------------------')
    console.log(JSON.stringify(result,null,2))

}

getSomeInteraction()

