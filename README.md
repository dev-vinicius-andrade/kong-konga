# Kong-Konga
This repository is a simple scaffold project to setup your Kong and Konga environment with logs

Pre-requisites

- **docker**, *you can install it from* [here](https://docs.docker.com/engine/install/)
- **docker-compose**, *you can install it from* [here](https://docs.docker.com/compose/install/)
- *Optional: **git**, you can install it from [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)*

**IMPORTANT** your docker compose must be able to run version 3.9 or higher

# How to use it
- Clone this repository
- Create a .env.local file in the root of the project, you can do it by running the following command
```bash
cp .env.example .env.local
```
- Edit the .env.local file and set the environment variables as you need



## Setup Script permissions
Give execution permissions to the scripts in the project
```bash
chmod +x ./scripts/*.sh
```

## Override default volumes path

If you want to override the default volumes path you can use the command
```bash
 container_volume="/your/desired/path" sed -i "s|device: ./container_volumes|device: $container_volume|g" docker-compose.yaml &&  grep -oP '(?<=device: ).*' docker-compose.yaml | while read -r path; do \
   mkdir -p "$path" \
done
```
## Recommendations 

We recomend you to run the default setup option, it will handle most of the configuration for you.
It will create a service for accessing konga directly from *kong* gateway.

## Setting up aditional configurations
You can setup aditional configurations by following the example of this repository.
There is a file inside **configurations** folder called **aditionalConfigurations.json**
It's a json array of objects, each object represents a service configuration to be added to kong.
There you can setup your routes and plugins availables.

> **Note:** You can checkout more about the plugins names in this [link](https://docs.konghq.com/gateway/latest/admin-api/#plugin-object).


## Running the environment as setup 
- Run the script **runAsSetup.sh" to start the environment
```bash
./scripts/runAsSetup.sh
```


## Running as production
As the environment is already setup, you can run it as production.
- Run the script **stopAsSetup.sh** to stop the environment
```bash
./scripts/stopAsSetup.sh
```
- Run the script **run.sh** to start the environment
```bash
./scripts/run.sh
```

