
const {createPostgresConnection} = require('./postgres');
const {createMySqlConnection} = require('./mysql');
const {createMongoConnection} = require('./mongo');
async function canConnectToDatabase(options){
    const type = options.type;
    if(type === 'postgres') return await createPostgresConnection(options);
    else if(type === 'mysql') return await createMySqlConnection(options);
    else if(type === 'mongo') return await createMongoConnection(options);
    console.log(`Invalid database type ${type}`);
    return false;
}
module.exports = {
    canConnectToDatabase
}