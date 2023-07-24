const {buildConnectionString} = require('../../utils');

async function runMongoSetup(options){
    console.log("Running Mongo Setup...");
    const mongo = require('mongodb').MongoClient;
    let isConnected = false;
    const retryIntervalSeconds = 5;
    while(!isConnected){
        try {
            const {connection} = await mongo.connect(buildConnectionString({...options,type:'postgres'}));
            isConnected = true;
            return {isConnected,connection};
        } catch (error) {
            console.log("Error connecting to database:",err);
            console.log("Retrying in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, retryIntervalSeconds * 1000));
        }
    }
}
async function createUser(connection,options){
    console.log("Not implemented yet");
}
async function createDatabase(connection,options){
    console.log("Not implemented yet");
}
async function grantPrivileges(connection,options){
    console.log("Not implemented yet");
}
async function createMongoConnection(adminConnectionOptions,options){
    console.log("Not implemented yet");
}

module.exports = {
    runMongoSetup,
    createMongoConnection
}