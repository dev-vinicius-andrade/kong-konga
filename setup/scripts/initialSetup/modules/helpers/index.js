const fs = require('fs').promises;
const {join: joinPath,parse: parseFile} = require('path');
const {existsSync} = require('fs');
function getDefaultValue(defaultValue) {
    // If the defaultValue starts with ":-", then return the part after ":-" as the default value
    return defaultValue.startsWith(':-') ? defaultValue.slice(2) : defaultValue;
  }
  
function replaceEnvironmentVariables(jsonContent,fileName) {
    // Regular expression to match environment variable placeholders in the format ${ENV_VARIABLE_NAME:-DEFAULT_VALUE}
    const regex = /\${([^:}]+)(:-[^}]+)?}/g;
    let updatedContent = jsonContent;
    const replacedEnvVars = {
        fileName,
    };
    updatedContent = updatedContent.replace(regex, (match, envVar, defaultValue) => {
      console.log(envVar)
      const value = process.env[envVar] || (defaultValue ? getDefaultValue(defaultValue) : null);
      if(value?.endsWith("}")) return value.slice(0,-1)
      replacedEnvVars[envVar] = value;
      return value;
    });
    logInformationAsTable("REPLACED ENVIRONMENT VARIABLES",replacedEnvVars);
    return updatedContent;
}
async function overrideEnvironmentVariablesInFiles(fromFilesFolder,toFilesFolder,encoding='utf8') {
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
              
              const content = await fs.readFile(fullMountFilePath, encoding);
              const updatedContent = replaceEnvironmentVariables(content,fileName);
              await fs.writeFile(fullFinalFilePath, updatedContent);
              console.log(`Environment variables replaced in file ${fullMountFilePath}...`);
      }
  }
  }catch(err){
      console.log("Error:",err);
  }
}

function logInformationAsTable(tableName,tableData){
    if(!tableData) return;
    if(Array.isArray(tableData) && tableData.length===0) return;
    console.log();
    console.log();
    console.log(`__________________ ${tableName} _________________`);
    console.log();
    console.table(tableData);
    console.log();
    console.log();
    console.log(`__________________ ${tableName} _________________`);
    console.log();
    console.log();
}
module.exports = {
    replaceEnvironmentVariables,
    overrideEnvironmentVariablesInFiles,
    logInformationAsTable
}