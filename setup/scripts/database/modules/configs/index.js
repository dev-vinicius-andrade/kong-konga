const kongDbType = process.env.KONG_DB_TYPE;
const kongaDbType = process.env.KONGA_DB_TYPE;
const kongAdminOptions = {
    host:process.env.KONG_DB_HOST,
    port:process.env.KONG_DB_PORT,
    user:process.env.KONG_DB_ADMIN_USER,
    password:process.env.KONG_DB_ADMIN_PASSWORD,
    database:process.env.KONG_DB_ADMIN_DATABASE,
    adtionalOptions:process.env.KONG_DB_ADITIONAL_PARAMS
}
const kongaAdminOptions = {
    host:process.env.KONGA_DB_HOST,
    port:process.env.KONGA_DB_PORT,
    user:process.env.KONGA_DB_ADMIN_USER,
    password:process.env.KONGA_DB_ADMIN_PASSWORD,
    database:process.env.KONGA_DB_ADMIN_DATABASE,
    adtionalOptions:process.env.KONGA_DB_ADITIONAL_PARAMS
}
const kongOptions = {
    host:process.env.KONG_DB_HOST,
    port:process.env.KONG_DB_PORT,
    user:process.env.KONG_DB_USER,
    password:process.env.KONG_DB_PASSWORD,
    database:process.env.KONG_DB_DATABASE,
    adtionalOptions:process.env.KONG_DB_ADITIONAL_PARAMS
}
const kongaOptions = {
    host:process.env.KONGA_DB_HOST,
    port:process.env.KONGA_DB_PORT,
    user:process.env.KONGA_DB_USER,
    password:process.env.KONGA_DB_PASSWORD,
    database:process.env.KONGA_DB_DATABASE,
    adtionalOptions:process.env.KONGA_DB_ADITIONAL_PARAMS
};
module.exports = {
    kongDbType,
    kongaDbType,
    kongAdminOptions,
    kongaAdminOptions,
    kongOptions,
    kongaOptions
}