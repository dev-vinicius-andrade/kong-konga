const axios = require('axios');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const fs = require('fs').promises;
const {join: joinPath,parse: parseFile} = require('path');
const {existsSync, mkdir} = require('fs');
const { execSync } = require('child_process');
const volumeRolesFolder = '/usr/share/elastic/roles';
const volumeUsersFolder = '/usr/share/elastic/users';
const finalRolesFolder = '/app/roles';
const finalUsersFolder = '/app/users';
const {replaceEnvironmentVariables} = require('../helpers');
const setupInfo ={
    ELASTICSEARCH_HOST:process.env.ELASTICSEARCH_HOST,
    ELASTICSEARCH_PORT:process.env.ELASTICSEARCH_PORT,
    ELASTIC_USERNAME:process.env.ELASTIC_USERNAME ?? 'elastic',
    ELASTIC_PASSWORD:process.env.ELASTIC_PASSWORD,
    LOGSTASH_ELASTICSEARCH_USERNAME:process.env.LOGSTASH_ELASTICSEARCH_USERNAME??'logstash_internal',
    LOGSTASH_ELASTICSEARCH_INDEX:process.env.LOGSTASH_ELASTICSEARCH_INDEX??'kong-%{+YYYY.MM.dd}',
    KIBANA_SYSTEM_USERNAME:process.env.KIBANA_SYSTEM_USERNAME??'kibana_system',
    KIBANA_SYSTEM_PASSWORD:process.env.KIBANA_SYSTEM_PASSWORD??'changeme',
    LOGSTASH_INTERNAL_PASSWORD:process.env.LOGSTASH_INTERNAL_PASSWORD??'changeme',
    volumeRolesFolder,
    finalRolesFolder
}
const elasticUrl=`http://${setupInfo.ELASTICSEARCH_HOST}:${setupInfo.ELASTICSEARCH_PORT}`;
async function overrideEnvironmentVariablesInFiles(fromFilesFolder,toFilesFolder) {
    try{
        const fileNames = await fs.readdir(fromFilesFolder,{recursive:true});
        if(!fileNames || fileNames.length===0){
            console.log(`No files found in ${fromFilesFolder}, skipping...`);
            return;
        }
        for(const fileName of fileNames){
            const fullMountFilePath = joinPath(fromFilesFolder,fileName);
            const fullFinalFilePath = joinPath(toFilesFolder,fileName);
            if (existsSync(fullMountFilePath)) {
                console.log(`Replacing environment variables in file ${fullMountFilePath}...`);
                
                const content = await fs.readFile(fullMountFilePath, 'utf8');
                const updatedContent = replaceEnvironmentVariables(content);
                await fs.writeFile(fullFinalFilePath, updatedContent);
                console.log(`Environment variables replaced in file ${fullMountFilePath}...`);
        }
    }
    }catch(err){
        console.log("Error:",err);
    }
}
async function checkElkIsReady(retries, interval){
    console.log(`ELASTICSEARCH_HOST: ${setupInfo.ELASTICSEARCH_HOST}`);
    console.log(`ELASTICSEARCH_PORT: ${setupInfo.ELASTICSEARCH_PORT}`);
  
    let attempt = 1;
    while (attempt <= retries) {
      console.log(`Checking if Elastic is ready... (Attempt: ${attempt})`);
  
      try {
        const options = {
            method: 'GET',
            url:elasticUrl,
            timeout: 15000, // 15 seconds timeout for the request
        };
        if (setupInfo.ELASTIC_PASSWORD) {
            options.auth = {
              username: setupInfo.ELASTIC_USERNAME,
              password: setupInfo.ELASTIC_PASSWORD,
            };
          }
       const result =  await axios(options);
       if(result.status!==200) throw new Error("Elastic API is not ready");
       console.log('Elastic API is ready!');
       return true;
      } catch (error) {
        console.error('Error:', error);
      }
      attempt++;
      await sleep(interval);
    }
  
    console.log(`Kong Admin API is not ready after ${retries} attempts. Exiting.`);
    return false;
}
async function setupBuiltinUsers() {
    const url = `${elasticUrl}/_security/user?pretty`;
    const headers = {};
  
    for (let i = 1; i <= 30; i++) {
      let num_users = 0;
  
      try {
        const options = {
            method: 'GET',
            url,
            timeout: 15000, // 15 seconds timeout for the request
        };
        if(setupInfo.ELASTIC_PASSWORD){
            options.auth = {
                username: setupInfo.ELASTIC_USERNAME,
                password: setupInfo.ELASTIC_PASSWORD,
            };
        }
        const response = await axios(options);
  
        if (response.status === 200) {
          const users = response.data;
          const usernames = Object.keys(users);
          for (const username of usernames) {
            const user = users[username];
            if(user.metadata?._reserved) num_users++;
          }
        }
        if (num_users > 1) 
          return true;
        
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
  
      await sleep(1000); // Sleep for 1 second before retrying
    }
  
    return false;
}
async function createRoles(){
    try{
        await fs.mkdir('/app/roles', { recursive: true });
        await overrideEnvironmentVariablesInFiles(volumeRolesFolder,finalRolesFolder);
        const fileNames = await fs.readdir(finalRolesFolder,{recursive:true});
        if(!fileNames || fileNames.length===0){
            console.log(`No files found in ${finalRolesFolder}, skipping...`);
            return;
        }
        for(const fileName of fileNames){
            const fileNameWithoutExtension = parseFile(fileName).name;
            const fullFilePath = joinPath(finalRolesFolder,fileName);
            const url = `${elasticUrl}/_security/role/${fileNameWithoutExtension}`;
            const body = await fs.readFile(fullFilePath, 'utf8');
            console.log(body)
            const options={
                method: 'POST',
                url,
                timeout: 15000, // 15 seconds timeout for the request
                headers: {
                    'Content-Type': 'application/json',
                },
                data: body,
            }
            if (setupInfo.ELASTIC_PASSWORD) {
                options.auth = {};
                options.auth.username = setupInfo.ELASTIC_USERNAME;
                options.auth.password = setupInfo.ELASTIC_PASSWORD;
            }
            
            try {
                const response = await axios(
                    options
                );

                if (response.status === 200) {
                console.log('Role created successfully.');
                }
            } catch (error) {
                console.error('Error creating role:', error.response ? error.response.data : error);
            }
        }
        return true;
    }catch(err){
        console.log("Error:",err);
        return false;
    }
}
async function userExists(username){
    try {
        const url = `${elasticUrl}/_security/user/${username}`;
        const options = {
            method: 'GET',
            url,
            timeout: 15000, // 15 seconds timeout for the request
        };
        if (setupInfo.ELASTIC_PASSWORD) {
            options.auth = {
              username: setupInfo.ELASTIC_USERNAME,
              password: setupInfo.ELASTIC_PASSWORD,
            };
          }
        const response = await axios(options);
        if(response.status===200) return true;
        return false;
        
    } catch (error) {
        if(error.response?.status===404) return false;

        console.error(`Unhandled error checking if user ${username} exists`, error);
        throw error;
    }
}
async function setUserPassword(username,password){
    console.log(`Setting password for user ${username}...`);
    try {
        const url = `${elasticUrl}/_security/user/${username}/_password`;
        const options = {
            method: 'POST',
            url,
            timeout: 15000, // 15 seconds timeout for the request
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({password}),
        };
        if (setupInfo.ELASTIC_PASSWORD) {
            options.auth = {
              username: setupInfo.ELASTIC_USERNAME,
              password: setupInfo.ELASTIC_PASSWORD,
            };
          }
        const response = await axios(options);
        if(response.status===200) {
            console.log(`Password set for user ${username}...`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error setting username:${username} password...`, error);
        throw error;
    }
}
async function createUser(username,password,roles){
    try{
       const exists = await userExists(username);
       if(exists && password)
       {
            await setUserPassword(username,password);
            return;
       }
       const url = `${elasticUrl}/_security/user/${username}`;
        const options = {
            method: 'POST',
            url,
            timeout: 15000, // 15 seconds timeout for the request
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({password,roles}),
        };
        if (setupInfo.ELASTIC_PASSWORD) {
            options.auth = {
              username: setupInfo.ELASTIC_USERNAME,
              password: setupInfo.ELASTIC_PASSWORD,
            };
          }
        const response = await axios(options);
        if(response.status===200) {
            console.log(`User ${username} created...`);
            return true;
        }

    }catch(err){
        console.log(`Error creating user:${username}`,err);
        throw err;
    }
}
async function createUsers(){
    try {
        await fs.mkdir('/app/users', { recursive: true });
        await overrideEnvironmentVariablesInFiles(volumeUsersFolder,finalUsersFolder);
        const fileNames = await fs.readdir(finalUsersFolder,{recursive:true});
        if(!fileNames || fileNames.length===0){
            console.log(`No files found in ${finalUsersFolder}, skipping...`);
            return;
        }
        for(const fileName of fileNames){
            const fullFilePath = joinPath(finalUsersFolder,fileName);
            const usersFileContent =  await fs.readFile(fullFilePath, 'utf8');
            const users = JSON.parse(usersFileContent);
            console.log(users);
            for(const user of users){
                await createUser(user.username,user.password,user.roles);
            }

        }
    } catch (error) {
        console.error(`Error creating users`, error);
        throw error;
    }
}
async function defaultSetup(){
    try {
        const isConnected = await checkElkIsReady(10,3000);
        if(!isConnected) throw new Error("Elastic is not ready");
        await setupBuiltinUsers();
        await createRoles();
        await createUsers();
        console.log("Default setup finished successfully...");
    } catch (error) {
        console.error(`Error in default setup`, error);
        throw error;
    }
}
function returnSetupInfo(){
    return setupInfo;
}
module.exports = {
    defaultSetup,
    returnSetupInfo,
    checkElkIsReady
}