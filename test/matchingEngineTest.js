
const Database = require('../dist/server/Database').Database;
const MatchingEngine = require('../dist/server/MatchingEngine').default
const config = {
    uri: 'mongodb://localhost:27017',
    dbName: 'hmDevMock'
}
let db
let me
let prepApp = async () => {
    db = new Database(config);
    await db.init()
    // make sure db has test data
    me = new MatchingEngine(db)
}

let trainingsDetails1 = [
    {kidName: 'A'},
    {kidName: 'B'},
    {kidName: 'C'},
]

let hours = [{
    hour: '1530',
    trainer: ['I1'],
    trainingsDetails: trainingsDetails1
}]

let dayQuery = {
    day: '20190314',
    remarks: 'uwagi',
    hours,
    dailyExcludes: ['d']
}


prepApp().then(
    () => {
        me.getMatches(dayQuery).then(
            (bestResult) => {
                console.log('*** Reported result: ***')
                console.log(JSON.stringify(bestResult))}
        ).catch(
            (err) => {console.log(err,'inner catch')}
        )
    }
).catch(
    (err) => {console.log(err,'outer catch')}
)

return 0

