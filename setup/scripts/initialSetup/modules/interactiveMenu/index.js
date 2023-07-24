const menu = require('node-menu');
const { exec  } = require('child_process');
const setup = require('../setup');
function killInteractiveProcess() {
    const processName = "node /app/modules/main.js --interactive";
    exec(`ps -ef | grep "${processName}" | grep -v grep | awk '{print $2}'`, (error, pid, stderr) => {
        const killCommand = `kill -s INT ${pid}`;
        exec(killCommand, (error, stdout, stderr) => {
        if (error) {
        console.error(`Error sending SIGINT to process with PID ${pid}:`, error.message);
        return;
        }
    
        console.log(`SIGINT sent to process with PID ${pid}.`);
    });
    })
}
async function createSetupMenu(){
    menu.resetMenu();
    try{
        const isConnected = await setup.checkKongAdminAPI(10,5000);
        menu.disableDefaultHeader()
        .customHeader(()=>{
            const infos = setup.returnSetupInfo();
            console.table(infos);
            process.stdout.write(`Can connect to kong admin api: \x1b[32m${isConnected} \x1b[0m` + "\n");
            
        })
        .addDelimiter('-', 40, 'Konga Setup')
        .addItem('Default Setup',async ()=>{
            try{
                await setup.defaultSetup();
            }catch(err){
                console.log("Error in default setup:",err);
            }
        })
        .addItem('Create kibana service and route',async ()=>{
            try{
                await setup.createKibanaService();
            }catch(err){
                console.log("Error in create kibana service:",err);
            }
        })
        .addItem('Create Global logstash plugin',async ()=>{
            try{
                await setup.createGlobalLogstashPlugin();
            }catch(err){
                console.log("Error in create global logstash plugin:",err);
            }
        })
        .addItem('Create aditional configurations',async ()=>{
            try{
                await setup.createAditionalConfigurations();
            }catch(err){
                console.log("Error in create aditional configurations:",err);
            }
        })
        .addItem('Back',async()=>{
            menu.resetMenu();
            createAndStartMenu()
        })
        .addItem('Finish Interactive Setup Successfully', async ()=>{
            killInteractiveProcess();
        })
        .addDelimiter('-', 40)
        .start();
    }catch(err){
        console.log("Error:",err);
        menu.resetMenu();
        reateAndStartMenu()
    }
}
function createAndStartMenu(){
    menu.resetMenu();
    menu.disableDefaultHeader()
    .customHeader(()=>{
        process.stdout.write("Setup" + "\n");
    })
    .addDelimiter('-', 40, 'Setup')
    .addItem('Setup',createSetupMenu)
    .addItem('Stop interactive Setup',async ()=>{
        console.log("Finishing interactive setup...");
        console.log("Remember to properly finish this container in a way to return 0 as exit code...")
        console.log("You can always open the interactive menu again by running the command: \x1b[32mnode node /app/interactive.js \x1b[0m")
        menu.stop();
    })
    .addItem('Finish Interactive Setup Successfully', async ()=>{
        killInteractiveProcess();
    })
    .addDelimiter("-",40).start();

}
module.exports = {
    createAndStartMenu
}



