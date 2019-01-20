const Database = require('../dist/server/Database').Database;

const config = {
    uri: 'mongodb://localhost:27017',
    dbName: 'hmDevMock'
}

let horses = [
    {name:'a'},
    {name:'b'},
    {name:'c'},
    {name:'d'},
    {name:'e'}]

let kids =
    [{
        name: 'A',
        prefs: {
            best: ['a'],
            nice: ['b'],
            isok: ['c'],
            limp: ['d'],
            excl: ['e']
        }
    },
        {
            name: 'B',
            prefs: {
                best: ['a'],
                nice: ['b', 'c'],
                isok: ['d'],
                limp: ['e'],
                excl: []
            }
        },
        {
            name: 'C',
            prefs: {
                best: ['a', 'b'],
                nice: ['c', 'd'],
                isok: [],
                limp: ['e'],
                excl: []
            }
        }]

let trainers = [{name:'I1'},{name:'I2'}]

let fillInDatabase = async () => {

    const db = new Database(config);
    await db.init()

    await db.insertMany('horsos', horses)
    await db.insertMany('kidos',kids)
    await db.insertMany('trainers',trainers)

}

console.log('database is about to be filled with simple mock values')
try{
    fillInDatabase().then(() => {console.log('went smooth')})
}catch(err){
    console.log(err,'filling error')
}
