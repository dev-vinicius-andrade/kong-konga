function buildConnectionString(options){
    const type = options.type;
    const connectionStringBuilder=[`${type}://`];
    if(options.user) connectionStringBuilder.push(`${options.user}`);
    if(options.password) connectionStringBuilder.push(`:${options.password}`);
    if(options.user || options.password) connectionStringBuilder.push('@');
    if(options.host) connectionStringBuilder.push(`${options.host}`);
    if(options.port) connectionStringBuilder.push(`:${options.port}`);
    if(options.database) connectionStringBuilder.push(`/${options.database}`);
    if(options.adtionalOptions) connectionStringBuilder.push(`?${options.adtionalOptions}`);
    const connectionString = connectionStringBuilder.join('');
    return connectionString;
}
function returnSetupInfo(type,adminOptions,options){
    return [{type:"admin",...adminOptions},{type:"user",...options}];
}
module.exports = {
    buildConnectionString,
    returnSetupInfo
}