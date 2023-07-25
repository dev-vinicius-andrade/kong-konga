
const axios = require('axios');
const {createService,createRoute,createConsumer} = require('../kong');
const fs = require('fs').promises;
const {existsSync} = require('fs');


async function createKongaAuthKey({kongHost,kongAdminPort},serviceName,serviceHost,servicePort,serviceUser, {routePath,routeHost},serviceCustomId) {
  try {
    
    // Create service
    let keyAuth=null;
    if(existsSync('/usr/share/konga/data/kong_auth_key.key')){
      console.log('Kong auth key already exists using to continue...');
      keyAuth = await fs.readFile('/usr/share/konga/data/kong_auth_key.key', 'utf8');
    }


    const createServiceResponse=  await createService({kongHost,kongAdminPort},serviceName, serviceHost, servicePort);
    if(createServiceResponse.error) throw new Error(`Error creating service ${serviceName}: ${createServiceResponse.error}`);
   
    // Create service route
    await createRoute({kongHost,kongAdminPort},serviceName, {routePath, routeHost});

    // Create service user and get the KONG_CONSUMER_KONGA_ID
    const {consumerId: kongConsumerKongaId} = await createConsumer({kongHost,kongAdminPort},serviceUser, serviceCustomId);

    // Create key-auth for user
    console.log(`Creating key-auth for user ${kongConsumerKongaId}...`);

    try {
      const response =keyAuth?{data:{key:keyAuth}}:await axios.post(`http://${kongHost}:${kongAdminPort}/consumers/${kongConsumerKongaId}/key-auth`);
      keyAuth = response.data.key;
      console.log();
      console.log();
      console.log('__________________ GENERATED KEY _________________');
      console.log();
      console.table({keyAuth});
      console.log();
      console.log('__________________ GENERATED KEY _________________');
      console.log();
      console.log();

      await fs.writeFile('/usr/share/konga/data/kong_auth_key.key', keyAuth);
      return {keyAuth,kongConsumerKongaId};
    } catch (error) {
      console.error('Error creating key-auth:', error.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
async function createKongaDefaultUser({kongHost,kongAdminPort},{username,email,firstName,password}) {
  try {
    // Create the /usr/share/konga/data directory if it doesn't exist
    await fs.mkdir('/usr/share/konga/data', { recursive: true });

    const defaultUsersContent = `module.exports = [
      {
          "username": "${username}",
          "email": "${email}",
          "firstName": "${firstName}",
          "node_id":  "http://${kongHost}:${kongAdminPort}",
          "admin": true,
          "active" : true, 
          "password": "${password}"
      }
    ];`;
    
    // Write the default_users_db.data file
    await fs.writeFile('/usr/share/konga/data/default_users_db.data', defaultUsersContent);
    console.log();
    console.log();
    console.log('__________________ KONGA USER DATA _________________');
    console.log();
    console.log();
    console.table({username,email,firstName,password});
    console.log();
    console.log();
    console.log('__________________ KONGA USER DATA _________________');
    console.log();
    console.log();
  } catch (error) {
    console.error('Error:', error);
  }
}
async function createKongaKongDefaultSeed({kongHost,kongAdminPort},kongApiKey) {
  try {
    // Create the /usr/share/konga/data directory if it doesn't exist
    await fs.mkdir('/usr/share/konga/data', { recursive: true });

    const defaultSeedContent = `module.exports = [
      {
          "name": "${kongHost}",
          "type": "key_auth",
          "kong_admin_url": "http://${kongHost}:${kongAdminPort}",
          "kong_api_key": "${kongApiKey}",
          "health_checks": false,
          "active": true
      }
    ];`;

    // Write the default_kong_node.data file
    await fs.writeFile('/usr/share/konga/data/default_kong_node.data', defaultSeedContent);

    console.log('Konga kong default seed created.');
    console.log();
    console.log();
    console.log('__________________ KONGA KONG DEFAULT SEED DATA _________________');
    console.log();
    console.log();
    console.table({
      NAME: kongHost,
      TYPE: 'key_auth',
      'KONG ADMIN URL': `http://${kongHost}:${kongAdminPort}`,
      'KONG API KEY': kongApiKey,
      'HEALTH CHECKS': false,
    })
    console.log();
    console.log();
    console.log('__________________ KONGA KONG DEFAULT SEED DATA _________________');
    console.log();
    console.log();
  } catch (error) {
    console.error('Error:', error.message);
  }
}



module.exports = {
    createKongaAuthKey,
    createKongaDefaultUser,
    createKongaKongDefaultSeed,
}