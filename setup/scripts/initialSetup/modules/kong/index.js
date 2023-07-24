const axios = require('axios');
async function createRoute({kongHost,kongAdminPort},serviceName,{routePath,routeHost}){  
    console.log(`Creating route...`);
    console.log(`Calling [POST] => http://${kongHost}:${kongAdminPort}/services/${serviceName}/routes`);
  
    try {
     let routePathOrHost = routePath || routeHost;
     if(routePath)
     {
        console.log(`Creating route with path ${routePath}...`);
        await axios.post(`http://${kongHost}:${kongAdminPort}/services/${serviceName}/routes`, {
          paths: [routePath],
        });
        console.log(`Route with path ${routePath} created...`);
        routePathOrHost=true;
     }
    if(routeHost)
    {
        console.log(`Creating route with host ${routeHost}...`);
        await axios.post(`http://${kongHost}:${kongAdminPort}/services/${serviceName}/routes`, {
        hosts: [routeHost],
        });
        console.log(`Route with host ${routeHost} created...`);
        routePathOrHost=true;
    }
    if(!routePathOrHost) throw new Error("You must provide a route path or host");
      
    } catch (error) {
      console.error('Error creating the route:', error.message);
    }
}
async function serviceExists({kongHost,kongAdminPort},serviceName){
  try {
    const exists = await axios.get(`http://${kongHost}:${kongAdminPort}/services/${serviceName}`);
    if(exists.status===200) {
      console.log(`Service ${serviceName} already exists...`);
      return exists.data;
    }
    return false;
  } catch (error) {
    if(error.response?.status===404) return false;
    console.error('Error checking if service exists:', error.message,error.data);
    throw error;
  }
}
async function createService({kongHost,kongAdminPort},serviceName,serviceHost,servicePort){
    console.log(`Creating ${serviceName} service...`);
    console.log(`With host: ${serviceHost}`);
    console.log(`With port: ${servicePort}`);
    console.log(`Calling [POST] => http://${kongHost}:${kongAdminPort}/services`);
    try {
      const existsResponse = await serviceExists({kongHost,kongAdminPort},serviceName);
      if(existsResponse)  return existsResponse;
      
     const serviceResponse=  await axios.post(`http://${kongHost}:${kongAdminPort}/services/`, {
        name: serviceName,
        host: serviceHost,
        port: parseInt(servicePort??80),
      });
      if(serviceResponse.status===201 || serviceResponse.status===200)
      {
        console.log(`Service ${serviceName} created...`);
        return serviceResponse.data;
      }
      throw new Error("Error creating service",serviceResponse);
    } catch (error) {
      console.error('Error creating the service:', error.message,error.data);
      console.error(error)
      return {error}
    }
}
async function consumerExists({kongHost,kongAdminPort},serviceUser){
  try{
    const exists = await axios.get(`http://${kongHost}:${kongAdminPort}/consumers/${serviceUser}`);
    if(exists.status===200) {
      console.log(`${serviceUser} already exists...`);
      return {consumerId:exists.data.id};
    }
    return false;
  }
  catch(error){
    if(error.response?.status===404) return false;
    console.error('Error checking if consumer exists:', error.message,error.data);
    throw error;
  }

}
async function createConsumer({kongHost,kongAdminPort},serviceUser,serviceCustomId){
  console.log(`Creating ${serviceUser} with custom_id ${serviceCustomId}...`);
  console.log(`Calling [POST] => http://${kongHost}:${kongAdminPort}/consumers/`);

  try {
    const exists = await consumerExists({kongHost,kongAdminPort},serviceUser);
    if(exists.consumerId) {
      return {consumerId:exists.consumerId}
    }

    const response = await axios.post(`http://${kongHost}:${kongAdminPort}/consumers/`, {
      username: serviceUser,
      custom_id: serviceCustomId,
    });
    const consumerId = response.data.id;
    console.log(`${serviceUser} with custom_id ${serviceCustomId} created...`);
    console.log('Getting consumer id...');
    return {consumerId};
  } catch (error) {
    console.error('Error creating the user:', error.message);
    return {error}
  }
}
async function pluginExists({kongHost,kongAdminPort},pluginName){
  try {
    const response = await axios.get(`http://${kongHost}:${kongAdminPort}/plugins/${pluginName}`);
    if(response.status===200) {
      console.log(`Plugin ${pluginName} already exists...`);
      return response.data;
    }
    return false;
  } catch (error) {
    if(error.response?.status===404) return false;
    console.error('Error checking if plugin exists:', error.message,error.data);
    throw error;
  }
}
async function createPlugin({kongHost,kongAdminPort},pluginName,pluginConfig,{tags,consumer,service,route,enabled}){
    console.log(`Creating ${pluginName} plugin...`);
    
    try {
      const existsResponse = await pluginExists({kongHost,kongAdminPort},pluginName);
      if(existsResponse) return existsResponse;
      
      const response=  await axios.post(`http://${kongHost}:${kongAdminPort}/plugins/`, {
        name: pluginName,
        config: pluginConfig,
        consumer,
        service,
        route,
        tags,
        enabled:enabled==="true"||enabled===true?true:false
      });
      if(response.status===201 || response.status===200) 
      { 
        console.log(`Plugin ${pluginName} created...`);
        return response.data;
      }
      return false;
    } catch (error) {
      console.error('Error creating the plugin:', error.message,error);
      return {error};
    }
}
module.exports = {
    createRoute,
    createService,
    createConsumer,
    createPlugin
}