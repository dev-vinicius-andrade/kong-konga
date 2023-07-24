const {buildConnectionString} = require('../../utils');
async function createPostgresConnection(options){
    const pg = require('pg');
    let isConnected = false;
    const retryIntervalSeconds = 5;
    while(!isConnected){
        const connection = new pg.Client(buildConnectionString({...options,type:'postgres'}));
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
    const query= `SELECT 1 FROM pg_roles WHERE rolname = '${options.database}'`;
    const exists = await connection.query(query)
    if(exists.rows.length===0)
    { 
        console.log(`User does not exist, creating ${options.user}...`);
        await connection.query(`CREATE USER ${options.user} WITH PASSWORD '${options.password}'`);
        console.log("User created");
        return;
    }
    console.log("User already exists");
}
async function createDatabase(connection,options){
    const query= `SELECT 1 FROM pg_database WHERE datname = '${options.database}'`;
    const exists = await connection.query(query);
    if(exists.rows.length===0)
    {
        console.log("Database does not exist, creating...");
        await connection.query(`CREATE DATABASE ${options.database}`);
        console.log("Database created");
        return;
    }
    console.log("Database already exists");
}
async function grantPrivileges(connection,options){
    console.log("Granting privileges...");
    const query= `ALTER DATABASE ${options.database} OWNER TO ${options.user}`;
    await connection.query(query);
    console.log("Privileges granted");
}
async function runPostgresSetup(adminConnectionOptions,options){
    console.log("Running Postgres Setup");
    const {isConnected,connection} = await createPostgresConnection(adminConnectionOptions);
    if(!isConnected) {
        console.error("Cannot connect to database");
        return;
    }
    console.log("Connected to database");
    try{   
     await createUser(connection,options);
     await createDatabase(connection,options);
     await grantPrivileges(connection,options); 
    }catch(err)
    {
        console.log("Error checking if user exists:",err);
    }
}
module.exports = {
    createPostgresConnection,
    runPostgresSetup
 };