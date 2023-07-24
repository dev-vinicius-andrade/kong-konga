function appendInFile(filePath, content){
    const fs = require('fs');
    fs.appendFile(filePath, content, (err) => {
        if (err) 
          console.error('Error appending to file:', err);
    });
}
async function runInteractive()
{
  
    console.log("Running interactive setup...");
    console.log("To exit press CTRL+C");
    console.log("To cancel press CTRL+C twice");
    console.log("As you started the application in interactive mode, you may need to take some actions...")
    console.log("You can attach to the running container with the following command:")
    console.log("docker exec -it <container_name> /bin/bash -c \"node interactive.js\"")
    const os = require('os');
    appendInFile(`${os.homedir()}/.profile`,`node /app/interactive.js`);
    let cancellationToken =false;
    process.on('SIGINT', function () {
        console.log("Cancellation token set to true throught SIGINT...")
        cancellationToken = true;
        process.exit(0);
    });
    console.log("Waiting for cancellation token...");
    const interval= setInterval(()=>{
        if(!cancellationToken) return;
        if(!interval)  return;
        clearInterval(interval);  
    },1000); 
}
async function runNonInteractiveSetup(){
    console.log("Running non-interactive setup...");
    const setup = require('/app/modules/setup');
    await setup.runDatabaseSetup();
    process.exit(0);
}
async function run(){
    const commandLineArgs = require('command-line-args')
    const optionsDefinitions=[
        {name:'interactive',alias:"i", type:Boolean,defaultOption:false}
    ];
    const options = commandLineArgs(optionsDefinitions)
    const interactive = options.interactive;
    
    if(interactive) await runInteractive();
    else await runNonInteractiveSetup();
}
run().then(()=>console.log("Setup finished...")).catch((err)=>console.log(`Setup finished with errors: ${err}`));

