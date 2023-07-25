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
module.exports = {
    replaceEnvironmentVariables
}