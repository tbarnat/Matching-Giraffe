
const Database = require('../dist/Database').Database;

const config = {
    uri: 'mongodb://localhost:27017',
    dbName: 'hm-dev'
}

let testDb = async () => {

    const db = new Database(config);
    await db.init()
    console.log(db)

    await db.insertOne('horso',{a:1, b:1, c:1});
    await db.insertOne('testCollection',{a:2, b:2, c:2});
    console.log(JSON.stringify(await db.find('testCollection',{})))
    await db.updateOne('testCollection',{a:2},{$set: {b:5}});
    console.log(JSON.stringify(await db.find('testCollection',{})))
    await db.deleteOne('testCollection',{a:1, b:2, c:2});
    console.log(JSON.stringify(await db.find('testCollection',{})))

}

console.log('db operation test')
testDb()
