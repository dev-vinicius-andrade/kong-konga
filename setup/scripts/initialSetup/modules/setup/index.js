const { 
    createKongaAuthKey,
    createKongaDefaultUser,
    createKongaKongDefaultSeed,
} = require('../konga');
const axios = require('axios');
const {createService,createRoute,createConsumer,createPlugin} = require('../kong');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const fs = require('fs').promises;
const {existsSync} = require('fs');
const {overrideEnvironmentVariablesInFiles,logInformationAsTable} = require('../helpers')
const {join: joinPath} = require('path');
const setupInfo ={
  KONG_HOST:process.env.KONG_HOST,
  KONG_ADMIN_PORT : process.env.KONG_ADMIN_PORT,
  KONG_ADMIN_SERVICE_NAME : process.env.KONG_ADMIN_SERVICE_NAME,
  KONG_ADMIN_API_ROUTE_PATH : process.env.KONG_ADMIN_API_ROUTE_PATH,
  KONG_ADMIN_API_ROUTE_HOST : process.env.KONG_ADMIN_API_ROUTE_HOST,
  KONGA_SERVICE_USER : process.env.KONGA_SERVICE_USER,
  KONGA_SERVICE_NAME : process.env.KONGA_SERVICE_NAME,
  KONGA_SERVICE_PORT  : process.env.KONGA_SERVICE_PORT,
  KONGA_SERVICE_HOST:process.env.KONGA_SERVICE_HOST,
  KONGA_ROUTE_PATH : process.env.KONGA_ROUTE_PATH,
  KONGA_ROUTE_HOST : process.env.KONGA_ROUTE_HOST,
  KONGA_ADMIN_USER : process.env.KONGA_ADMIN_USER,
  KONGA_ADMIN_EMAIL : process.env.KONGA_ADMIN_EMAIL,
  KONGA_ADMIN_FIRST_NAME : process.env.KONGA_ADMIN_FIRST_NAME,
  KONGA_ADMIN_PASSWORD : process.env.KONGA_ADMIN_PASSWORD,
  KONGA_SERVICE_CUSTOM_ID:process.env.KONGA_SERVICE_CUSTOM_ID   ?? require('uuid').v4(),
}
const kongOptions = {
    kongHost:setupInfo.KONG_HOST,
    kongAdminPort:setupInfo.KONG_ADMIN_PORT
};

async function checkKongAdminAPI(retries, interval) {
    console.log(`KONG_HOST: ${setupInfo.KONG_HOST}`);
    console.log(`KONG_ADMIN_PORT: ${setupInfo.KONG_ADMIN_PORT}`);
  
    let attempt = 1;
    while (attempt <= retries) {
      console.log(`Checking if Kong Admin API is ready... (Attempt: ${attempt})`);
  
      try {

       console.log(`http://${setupInfo.KONG_HOST}:${setupInfo.KONG_ADMIN_PORT}`)
       const result =  await axios.get(`http://${setupInfo.KONG_HOST}:${setupInfo.KONG_ADMIN_PORT}/status`);
       if(result.status!==200) throw new Error("Kong Admin API is not ready");
       if(!result.data?.database?.reachable) throw new Error("Kong Admin API is not ready")
       console.log('Kong Admin API is ready!');
       return true;
      } catch (error) {
        console.error('Error:', error.message);
        // If the request fails, continue with the next attempt
      }
  
      attempt++;
      await sleep(interval);
    }
  
    console.log(`Kong Admin API is not ready after ${retries} attempts. Exiting.`);
    return false;
}
async function getExistentKongaServiceUser(){
    try{
        const response = await axios.get(`http://${setupInfo.KONG_HOST}:${setupInfo.KONG_ADMIN_PORT}/consumers/${setupInfo.KONGA_SERVICE_USER}`);
        if(response.status===200) return response.data;
        return null;
    }catch(error){
        if(error.response?.status===404) return null;
        console.error('Error checking if user exists:', error.message,error.data);
        throw error;
    }
}
async function createKongaConfigurations(){
    const {keyAuth,kongConsumerKongaId,keyAuthAlreadyExists}= await createKongaAuthKey(
        kongOptions,
        setupInfo.KONG_ADMIN_SERVICE_NAME,
        setupInfo.KONG_HOST,
        setupInfo.KONG_ADMIN_PORT,
        setupInfo.KONGA_SERVICE_USER,
        {
            routePath:setupInfo.KONG_ADMIN_API_ROUTE_PATH,
            routeHost:setupInfo.KONG_ADMIN_API_ROUTE_HOST
        },
        setupInfo.KONGA_SERVICE_CUSTOM_ID ?? require('uuid').v4()
    )
    if(keyAuthAlreadyExists){
      console.log(`Key auth already exists. Skipping...`);
      const existentKongaServiceUser = await getExistentKongaServiceUser();
      return {keyAuth,kongConsumerKongaId:existentKongaServiceUser?.id};
    }
    const {exists,error} = await createService(kongOptions,
    setupInfo.KONGA_SERVICE_NAME,
    setupInfo.KONGA_SERVICE_HOST,
    setupInfo.KONGA_SERVICE_PORT,
    {}
    )
    if(exists) {
        console.log(`Service ${setupInfo.KONGA_SERVICE_NAME} already exists...`);
        return;
    }
    if(error) throw error;
    await createRoute(
    kongOptions,
    setupInfo.KONGA_SERVICE_NAME,
    {
        routePath:setupInfo.KONGA_ROUTE_PATH,
        routeHost:setupInfo.KONGA_ROUTE_HOST
    })
    await createKongaKongDefaultSeed(kongOptions,keyAuth);
    return {keyAuth,kongConsumerKongaId};
}
async function defaultSetup(){
    console.table(returnSetupInfo());
    const isReady=  await checkKongAdminAPI(10, 5000);
    if(!isReady) {
        console.error("Kong Admin API is not ready. Exiting.");
        process.exit(1);
    }
    await createKongaConfigurations();
    await createKongaDefaultUser(kongOptions,{
        username:setupInfo.KONGA_ADMIN_USER,
        email:setupInfo.KONGA_ADMIN_EMAIL,
        firstName:setupInfo.KONGA_ADMIN_FIRST_NAME,
        password:setupInfo.KONGA_ADMIN_PASSWORD
    });
    await createAditionalConfigurations();
    console.log("Default setup finished successfully...");
}
async function createGlobalLogstashPlugin(consumerId){
    if(!setupInfo.LOGSTASH_HOST) {
        console.log("Logstash host not provided. Skipping...");
        return;
    }
    console.log(`Creating global logstash plugin...`);
    try{
       const pluginResponse=  await createPlugin(kongOptions,'udp-log',{host: setupInfo.LOGSTASH_HOST, port: 5000, timeout: 10000},{
            tags:["global","logstash","udp-log"],
            enabled:setupInfo.KONG_LOGSTASH_GLOBAL_PLUGIN_START_ENABLED,
            consumer:{id:consumerId}
        });
        if(pluginResponse.error) throw error;
        if(pluginResponse) {
            console.log("Global logstash plugin created or already exists...")
            return;
        }
        throw new Error("Create plugin response returned false");
        
        
    }catch(error){
        console.error('Error creating the global logstash plugin:', error.message);
    }
}

function validateAditionalConfigurationPluginsConfiguration(configuration) {
    let currentValidationPluginIndex=0;
    for (const plugin of configuration.plugins) {
        if (!plugin.name) throw new Error(`You must provide a plugin name in the plugin index[${currentValidationPluginIndex}]`);
        if (!plugin.config) throw new Error(`You must provide a plugin config in the plugin index[${currentValidationPluginIndex}]`);
        currentValidationPluginIndex++;
    }
}
async function validateAditionalConfiguration(configuration){
    console.log(`Validating global aditional service configuration...`);
    if(configuration.services && configuration.services.length>0) 
        for(const service of  configuration.services){
            validateAditionalServiceConfiguration(service);
            validateAditionalServiceRoutes(service);
            if(!service.plugins || service.plugins.length===0) return;
            validateAditionalConfigurationPluginsConfiguration(service);
        }
    console.log(`Validating global aditional service configuration finished...`);
    console.log(`Validating global aditional configuration plugins...`);
    validateAditionalConfigurationPluginsConfiguration(configuration);
    console.log(`Validating global aditional configuration plugins finished...`);

}
function validateAditionalServiceConfiguration(service) {
    if (!service.name) throw new Error(`You must provide a configuration name`);
    if (!service.protocol) throw new Error("You must provide a configuration protocol");
    if (!service.host) throw new Error("You must provide a configuration host");
}
function validateAditionalServiceRoutes(service) {
    if (service.routes && service.routes.length > 0)
        for (const route of service.routes) {
            if (!route.path && !route.host) throw new Error("You must provide either a route path or a route host");
        }
}

async function createAditionalConfigurations(){
    const volumesFolder = '/usr/share/kong/aditionalConfigurations';
    const finalFolder = '/app/aditionalConfigurations';
    if(!existsSync(volumesFolder)) {
        console.log(`No additional configurations found in ${volumesFolder}, skipping...`);
        console.log(`If you want to add additional configurations, create n <file>.json and mount them in ${volumesFolder}`);
        return;
    }
    console.log(`Additional configurations found in ${volumesFolder}, creating...`);
    await fs.mkdir(finalFolder, { recursive: true });
    await overrideEnvironmentVariablesInFiles(volumesFolder,finalFolder);
    const fileNames = await fs.readdir(finalFolder,{recursive:true});
    if(!fileNames || fileNames.length===0){
        console.log(`No files found in ${volumesFolder}, skipping...`);
        return;
    }
    
    await loopThroughAditionalConfigurationFiles(fileNames, finalFolder);
}
async function loopThroughAditionalConfigurationFiles(fileNames, finalFolder) {
    for (const fileName of fileNames) {
        const aditionalConfigurationsFinalPath = joinPath(finalFolder, fileName);
        const configuration = require(aditionalConfigurationsFinalPath);
        console.log(`Additional configurations found in ${aditionalConfigurationsFinalPath}, creating...`);

        console.log(`Creating additional configuration ${configuration.name}...`);
        try {
            validateAditionalConfiguration(configuration);
            if (configuration.services && configuration.services.length > 0)
                await createAditionalConfigurationServices(configuration.services);
            if (configuration.plugins && configuration.plugins.length > 0)
                await createAditionalConfigurationGlobalPlugins(configuration.plugins);
        } catch (error) {
            console.error(`Error creating the additional configuration index[${currentConfigurationIndex}]:`, error.message);
        }

        console.log(`Additional configurations found in ${aditionalConfigurationsFinalPath}, created...`);
    }
}

async function createAditionalConfigurationGlobalPlugins(plugins){
    let currentGlobalPluginIndex=0;
    const createdPlugins=[];
    for (const plugin of plugins) {
        try {
            const createPluginResult = await createPlugin(kongOptions, plugin.name, plugin.config, plugin.enabled ?? true);
            if (!createPluginResult) throw new Error("Create global plugin response returned false");
            createdPlugins.push({
                id:createPluginResult.id,
                name:plugin.name,
                config:JSON.stringify(plugin.config)
            });
            currentGlobalPluginIndex++;
        } catch (error) {
            console.error(`Error creating the additional configuration service index[${currentGlobalPluginIndex}]:`, error);
        }
    }


    if(createdPlugins.length===0) return;
    logInformationAsTable("ADITIONAL GLOBAL PLUGINS",createdPlugins);
}
async function createAditionalConfigurationServices(services) {
    let currentServiceIndex=0;
    const createdServices=[];
    const serviceRoutes=[];
    const servicePlugins=[];
    for (const service of services) {
        try {
            const createServiceResult = await createService(kongOptions, service.name, service.host, service.port, service);
            if (!createServiceResult) throw new Error("Create service response returned false");
            if (createServiceResult.error) throw createServiceResult.error;
            await createAditionalConfigurationServiceRoutes(createServiceResult.id, service);
            await createAditionalConfigurationServicePlugins(createServiceResult.id, service);
            console.log(`Additional configuration service ${service.name} created...`);
            createdServices.push({
                id:createServiceResult.id,
                name:service.name,
                host:service.host,
                port:parseInt(service.port),
                protocol:service.protocol
            })
            serviceRoutes.push(...service.routes.map(
                route=>({serviceId:createServiceResult.id,
                serviceName:service.name,...route}))
            );
            servicePlugins.push(...service.plugins.map(
                plugin=>({serviceId:createServiceResult.id,
                serviceName:service.name,...plugin}))
            );
            currentServiceIndex++;
        } catch (error) {
            console.error(`Error creating the additional configuration service index[${currentServiceIndex}]:`, error);
        }
    }
    logInformationAsTable("ADITIONAL SERVICES",createdServices);
    logInformationAsTable("ADITIONAL SERVICES ROUTES",serviceRoutes);
    logInformationAsTable("ADITIONAL SERVICES PLUGINS",servicePlugins);
}

async function createAditionalConfigurationServicePlugins(serviceId,configuration) {
    for (const plugin of (configuration.plugins ?? [])) {
        await createPlugin(kongOptions, plugin.name, plugin.config, {
            tags: plugin.tags ?? [],
            enabled: plugin.enabled ?? true,
            service: {id:serviceId}
        });
    }
}

async function createAditionalConfigurationServiceRoutes(serviceId,configuration) {
    for (const route of (configuration.routes ?? [])) {
        await createRoute(kongOptions, serviceId, {
            routePath: route.path,
            routeHost: route.host
        });
    }
}

function returnSetupInfo(){
    return setupInfo;
};    
module.exports = {
    defaultSetup,
    createKongaAuthKey,
    createKongaDefaultUser,
    createKongaKongDefaultSeed,
    checkKongAdminAPI,
    returnSetupInfo,
    createAditionalConfigurations,
    createGlobalLogstashPlugin
}