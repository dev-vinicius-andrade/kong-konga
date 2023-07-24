const {runPostgresSetup} = require('../database/postgres');
const {runMySqlSetup} = require('../database/mysql');
const {runMongoSetup} = require('../database/mongo');
const {canConnectToDatabase} = require('../database');
const {returnSetupInfo} = require('../utils');
const {kongaDbType,kongaAdminOptions,kongaOptions} = require('../configs');
function returnKongaSetupInfo(){
    return returnSetupInfo(kongaDbType,kongaAdminOptions,kongaOptions);
}
async function canConnectToKongaDatabase(){
    return await canConnectToDatabase({
         type:kongaDbType,
         ...kongaAdminOptions
    });
 }

async function runKongaDatabaseSetup(){
    if(kongaDbType === 'postgres')
        await runPostgresSetup(kongaAdminOptions,kongaOptions);
    else if(kongaDbType === 'mysql')
        await runMySqlSetup(kongaAdminOptions,kongaOptions);
    else if(kongaDbType === 'mongo') 
        await runMongoSetup(kongaAdminOptions,kongaOptions);
    else
        console.error(`Invalid KONGA database type ${kongaDbType}`);
}
module.exports = {
    runKongaDatabaseSetup,
    canConnectToKongaDatabase,
    returnKongaSetupInfo
}