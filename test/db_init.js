const Database = require('../dist/server/Database').Database;

const config = {
    uri: 'mongodb://localhost:27017',
    dbName: 'hmDev'
}

let horses = [
    {name: 'Czejen'},
    {name: 'Parys'},
    {name: 'Bella'},
    {name: 'Jadzia'},
    {name: 'Dzidzia'},
    {name: 'Bracio'},
    {name: 'Lady'}]

let kids =
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
        }]

let trainers = [{name: 'Eva'}, {name: 'Paulina'}, {name: 'Inna'}]

let fillInDatabase = async () => {

    const db = new Database(config);
    await db.init()

    await db.insertMany('horsos', horses)
    await db.insertMany('kidos', kids)
    await db.insertMany('trainers', trainers)

}

console.log('database is about to be filled with some startup values')
console.log('database is about to be filled with simple mock values')
try {
    fillInDatabase().then(() => {
        console.log('went smooth')
    })
} catch (err) {
    console.log(err, 'filling error')
}