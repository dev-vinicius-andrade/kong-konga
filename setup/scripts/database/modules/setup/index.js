

const {canConnectToKongDatabase,returnKongSetupInfo,runKongDatabaseSetup} = require('../kong');
const {canConnectToKongaDatabase,returnKongaSetupInfo,runKongaDatabaseSetup} = require('../konga');
async function runDatabaseSetup(){
    console.table(returnKongSetupInfo());
    console.table(returnKongaSetupInfo());
    await runKongDatabaseSetup();
    await runKongaDatabaseSetup();
}
module.exports = {
    runDatabaseSetup,
    runKongDatabaseSetup,
    runKongaDatabaseSetup,
    canConnectToKongDatabase,
    canConnectToKongaDatabase,
    returnKongSetupInfo,
    returnKongaSetupInfo
}