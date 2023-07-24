const menu = require('node-menu');
const { exec  } = require('child_process');
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
async function createKongMenu(){
    
    const setup = require('../setup');
    menu.resetMenu();
    const errors = [];
    try{
        const infos = setup.returnKongaSetupInfo();
        const {isConnected} = await setup.canConnectToKongDatabase();
        menu.disableDefaultHeader()
        .customHeader(()=>{
            console.table(infos);
            process.stdout.write(`Can connect to database: \x1b[32m${isConnected} \x1b[0m` + "\n");
            
        })
        .addDelimiter('-', 40, 'Kong Setup')
        .addItem('Run Kong Database Setup',async ()=>{
            try{
                await setup.runKongDatabaseSetup();
            }catch(err){
                errors.push(err);
            }
        }).addItem('Show Errors',async ()=>{
            console.log("Errors:",errors);
        })
        .addItem('Back',async()=>{
            menu.resetMenu();
            createAndStartMenu()
        })
        .addDelimiter('-', 40)
        .start();
    }catch(err){
        menu.resetMenu();
        createAndStartMenu()
    }
}

async function createKongaMenu(){
    
    const setup = require('../setup');
    menu.resetMenu();
    const errors = [];
    const infos = setup.returnKongaSetupInfo();
    try{
        const {isConnected} = await setup.canConnectToKongaDatabase();
        menu.disableDefaultHeader()
        .customHeader(async ()=>{
            console.table(infos);
            process.stdout.write(`Can connect to database: \x1b[32m${isConnected} \x1b[0m` + "\n");
        })
        .addDelimiter('-', 40, 'Konga Setup')
        .addItem('Run Kong Database Setup',async ()=>{
            try{
                await setup.runKongaDatabaseSetup();
            }catch(err){
                errors.push(err);
            }
        }).addItem('Show Errors',async ()=>{
            console.log("Errors:",errors);
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
    const setup = require('../setup');
    const errors = [];
    menu.disableDefaultHeader()
    .customHeader(()=>{
        process.stdout.write("Setup" + "\n");
    })
    .addDelimiter('-', 40, 'Setup')
    .addItem('Kong',createKongMenu)
    .addItem('Konga',createKongaMenu)
    .addItem('Run Full Database Setup',setup.runDatabaseSetup)
    .addItem('Stop interactive Setup Kong Setup',async ()=>{
        console.log("Finishing interactive setup...");
        console.log("Remember to properly finish this container in a way to return 0 as exit code...")
        menu.stop();
    })
    .addItem('Finish Interactive Setup Successfully', async ()=>{
        killInteractiveProcess();
            // console.log("Finishing interactive setup...");
            // console.log("The application will shutdown with exit code 0, it may take a few seconds...")
            // process.exit(0);
    }).addItem('Finish Interactive Setup With Errors',
    async ()=>{
            console.log("Finishing interactive setup with errors...");
            console.log("The application will shutdown with exit code 1, it may take a few seconds...")
            process.exit(1);
        }
    )
    .addItem('Show Errors',async ()=>{
        console.log("Errors:",errors);
    }).addDelimiter("-",40).start();

}
module.exports = {
    createAndStartMenu
}



