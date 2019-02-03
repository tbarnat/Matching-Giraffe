const Database = require('../dist/server/Database').Database;
const MatchingEngine = require('../dist/server/MatchingEngine').default
const config = {
    uri: 'mongodb://localhost:27017',
    dbName: 'hmDev'
}
let db
let me
let prepApp = async () => {
    db = new Database(config);
    await db.init()
    // make sure db has test data (db_test.js)
    me = new MatchingEngine(db)
}


let dayTestQuery = {
    day: '20190314',
    remarks: 'przyjade o 13stej',
    hours: [
        {
            hour: '1230',
            trainer: ['Paulina'],
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja'},
                {kidName: 'Julka Lonza'},
                {kidName: 'Ola C'},
            ]
        },
        {
            hour: '1430',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Ola C'},
                {kidName: 'Weronika'},
                {kidName: 'Emilka'},
                {kidName: 'Kalina'},
                {kidName: 'Paula'},
            ]
        },
        {
            hour: '1530',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Paula'},
                {kidName: 'Kalina'},
            ]
        },

    ],
    dailyExcludes: ['Parys']
}

prepApp().then(
    () => {
        me.getMatches(dayTestQuery).then(
            (bestResult) => {
                console.log('*** Reported result: ***')
                console.log(JSON.stringify(bestResult, undefined, 2))
            }
        ).catch(
            (err) => {
                console.log(err, 'inner catch')
            }
        ).finally(() => {
            console.log('done and out')
            process.exit()
        })
    }
).catch(
    (err) => {
        console.log(err, 'outer catch')
    }
)


