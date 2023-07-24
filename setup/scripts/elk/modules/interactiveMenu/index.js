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
async function createElkMenu(){
    menu.resetMenu();
    const errors = [];
    try{
        const infos = setup.returnSetupInfo();
        const isConnected = await setup.checkElkIsReady(10,5000);
        menu.disableDefaultHeader()
        .customHeader(()=>{
            
            console.table(infos);
            process.stdout.write(`Can connect to elastic api: \x1b[32m${isConnected} \x1b[0m` + "\n");
            
        })
        .addDelimiter('-', 40, 'ELK Setup')
        .addItem('Run ELK Default Setup',async ()=>{
            try{
                await setup.defaultSetup();
            }catch(err){
                errors.push(err);
            }
        })
        .addItem('Back',async()=>{
            menu.resetMenu();
            createAndStartMenu()
        })
        .addDelimiter('-', 40)
        .start();
    }catch(err){
        console.table(infos);
        console.log("Error:",err);
    }
}
function createAndStartMenu(){
    menu.resetMenu();
    menu.disableDefaultHeader()
    .customHeader(()=>{
        process.stdout.write("Setup" + "\n");
    })
    .addDelimiter('-', 40, 'Setup')
    .addItem('ELK',createElkMenu)
    .addItem('Stop interactive Setup',async ()=>{
        console.log("Finishing interactive setup...");
        console.log("Remember to properly finish this container in a way to return 0 as exit code...")
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



