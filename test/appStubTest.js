const AppStub = require('../dist/AppStub').default
let me = new AppStub()

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
    dailyExcludes: ['Czejen'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
}

me.generateMockSolution(dayTestQuery).then(
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


