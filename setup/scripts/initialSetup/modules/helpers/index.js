const fs = require('fs').promises;
const {join: joinPath,parse: parseFile} = require('path');
const {existsSync} = require('fs');
function getDefaultValue(defaultValue) {
    // If the defaultValue starts with ":-", then return the part after ":-" as the default value
    return defaultValue.startsWith(':-') ? defaultValue.slice(2) : defaultValue;
  }
  
function replaceEnvironmentVariables(jsonContent) {
    // Regular expression to match environment variable placeholders in the format ${ENV_VARIABLE_NAME:-DEFAULT_VALUE}
    const regex = /\${([^:}]+)(:-[^}]+)?}/g;
    let updatedContent = jsonContent;
  
    updatedContent = updatedContent.replace(regex, (match, envVar, defaultValue) => {
      console.log(envVar)
      const value = process.env[envVar] || (defaultValue ? getDefaultValue(defaultValue) : null);
      if(value?.endsWith("}")) return value.slice(0,-1)
      return value;
    });
  
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
              const updatedContent = replaceEnvironmentVariables(content);
              await fs.writeFile(fullFinalFilePath, updatedContent);
              console.log(`Environment variables replaced in file ${fullMountFilePath}...`);
      }
  }
  }catch(err){
      console.log("Error:",err);
  }
}
module.exports = {
    replaceEnvironmentVariables,
    overrideEnvironmentVariablesInFiles
}