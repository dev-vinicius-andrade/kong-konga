const {buildConnectionString} = require('../../utils/index.js');
async function createMySqlConnection(options){
    const mysql = require('mysql');
    let isConnected = false;
    const retryIntervalSeconds = 5;
    while(!isConnected){
        const connection = mysql.createConnection(buildConnectionString({...options,type:'mysql'}));
        try{
            await connection.connect();
            isConnected = true;
            return {isConnected,connection};
        }
        catch(err){
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
async function runMySqlSetup(adminConnectionOptions,options){
    console.log("Not implemented yet");

    // console.log("Running MySql Setup");
    // const {isConnected,connection} = await createMySqlConnection(adminConnectionOptions);
    // if(!isConnected) {
    //     console.error("Cannot connect to database");
    //     return;
    // }

}

module.exports = {
    createMySqlConnection,
    runMySqlSetup
}