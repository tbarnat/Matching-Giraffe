const Database = require('../dist/server/Database').Database;

const config = {
    uri: 'mongodb://localhost:27017',
    dbName: 'hmDev'
}

let horsos = [
    {name: 'Czejen'},
    {name: 'Parys'},
    {name: 'Bella'},
    {name: 'Jadzia'},
    {name: 'Dzidzia'},
    {name: 'Bracio'},
    {name: 'Lady'}]

let kidos =
    [{
        name: 'Emilka',
        prefs: {
            best: ['Dzidzia'],
            nice: ['Lady', 'Jadzia'],
            isok: ['Parys', 'Bracio'],
            limp: ['Czejen', 'Bella'],
            excl: []
        }
    },
        {
            name: 'Weronika',
            prefs: {
                best: ['Bella'],
                nice: ['Bracio', 'Jadzia'],
                isok: ['Lady', 'Czejen'],
                limp: ['Parys'],
                excl: ['Dzidzia']
            }
        },
        {
            name: 'Maja',
            prefs: {
                best: ['Lady', 'Czejen'],
                nice: ['Jadzia', 'Bella'],
                isok: ['Parys'],
                limp: ['Dzidzia'],
                excl: ['Bracio']
            }
        },
        {
            name: 'Julka Duza',
            prefs: {
                best: ['Bella'],
                nice: ['Lady', 'Jadzia'],
                isok: ['Parys', 'Czejen'],
                limp: ['Dzidzia'],
                excl: ['Bracio']
            }
        },
        {
            name: 'Julka Mala',
            prefs: {
                best: ['Czejen'],
                nice: ['Lady', 'Jadzia'],
                isok: ['Parys', 'Bella'],
                limp: ['Dzidzia'],
                excl: ['Bracio']
            }
        },
        {
            name: 'Paula',
            prefs: {
                best: ['Dzidzia', 'Czejen'],
                nice: ['Lady'],
                isok: ['Bracio'],
                limp: ['Jadzia', 'Parys'],
                excl: ['Bella']
            }
        },
        {
            name: 'Julka Lonza',
            prefs: {
                best: ['Jadzia'],
                nice: ['Bracio'],
                isok: ['Czejen'],
                limp: ['Lady'],
                excl: ['Parys', 'Bella', 'Dzidzia']
            }
        },
        {
            name: 'Ola C',
            prefs: {
                best: ['Parys', 'Bella'],
                nice: ['Lady', 'Jadzia'],
                isok: ['Dzidzia'],
                limp: ['Czejen'],
                excl: ['Bracio']
            }
        },
        {
            name: 'Kalina',
            prefs: {
                best: ['Dzidzia', 'Bella'],
                nice: ['Bracio', 'Jadzia'],
                isok: ['Lady'],
                limp: ['Czejen', 'Parys'],
                excl: []
            }
        },
        {
            name: 'IncompletePreferences',
            prefs: {
                best: ['Bella'],
                nice: ['Bracio'],
                isok: ['Lady', 'Czejen'],
                limp: ['Parys'],
                excl: ['Dzidzia']
            }
        },
        {
            name: 'InvalidPreferences',
            prefs: {
                best: ['Bella'],
                nice: ['Bracio', 'Bug-bug-bug'],
                isok: ['Lady', 'Czejen'],
                limp: ['Parys'],
                excl: ['Dzidzia']
            }
        },
    ]

let trainers = [{name: 'Ja'}, {name: 'Paulina'}, {name: 'Inna'}]

let fillInDatabase = async () => {

    const db = new Database(config);
    await db.init()

    let collections = {horsos, kidos, trainers}
    for (let collName of Object.keys(collections)) {
        let data = await db.find(collName)
        if (data.length) {
            await db.drop(collName)
        }
        await db.insertMany(collName, collections[collName])
        await db.updateMany(collName, {}, {$set: {"userName": "qwe"}})
    }
    let data = await db.find('users')
    if (data.length) {
        await db.drop('users')
    }
    await db.insertOne('users', {
        userName: 'qwe',
        email: 'qwe@wp.pl',
        password: '7815696ecbf1c96e6894b779456d330e',
        lastVisit: Date.now(),
        allVisits: 0
    })
    data = await db.find('diary')
    if (data.length) {
        await db.drop('diary')
    }
    await db.insertOne('diary', {
        day: '2019-01-01',
        hours: [
            {
                hour: '1230',
                trainer: ['Ja'],
                remarks: '',
                trainingsDetails: [
                    {kidName: 'Ola C', horse: 'Bella'},
                ]
            },
        ],
        dailyExcludes: [],
        userName: "qwe"
    })
}

console.log('database will be repopulated with some start-up values')
try {
    fillInDatabase().then(() => {
        console.log('--- everything went smooth :)) ---')
    })
} catch (err) {
    console.log(err, 'filling error')
}