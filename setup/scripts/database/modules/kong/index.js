const {kongDbType,kongAdminOptions,kongOptions} = require('../configs');
const {runPostgresSetup} = require('../database/postgres');
const {runMySqlSetup} = require('../database/mysql');
const {runMongoSetup} = require('../database/mongo');
const {canConnectToDatabase} = require('../database');
const {returnSetupInfo} = require('../utils');
async function canConnectToKongDatabase(){
    return await canConnectToDatabase({
         type:kongDbType,
         ...kongAdminOptions
    });
 }
 async function runKongDatabaseSetup(){
    if(kongDbType === 'postgres')
        await runPostgresSetup(kongAdminOptions,kongOptions);
    else if(kongDbType === 'mysql')
        await runMySqlSetup(kongAdminOptions,kongOptions);
    else if(kongDbType === 'mongo') 
        await runMongoSetup(kongAdminOptions,kongOptions);
    else
        console.error(`Invalid KONGA database type ${kongDbType}`);
}
function returnKongSetupInfo(){
    return returnSetupInfo(kongDbType,kongAdminOptions,kongOptions);
}
module.exports = {
    runKongDatabaseSetup,
    canConnectToKongDatabase,
    returnKongSetupInfo
};