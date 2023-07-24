# Kong-Konga
This repository is a simple scaffold project to setup your Kong and Konga environment with logs

Pre-requisites

- **docker**, *you can install it from* [here](https://docs.docker.com/engine/install/)
- **docker-compose**, *you can install it from* [here](https://docs.docker.com/compose/install/)
- *Optional: **git**, you can install it from [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)*

# How to use it
- Clone this repository

## Setup Script permissions
Give execution permissions to the scripts in the project
```bash
chmod +x ./scripts/*.sh
```
## Recommendations 

We recomend you to run the default setup option, it will handle most of the configuration for you.
It will create a service for accessing konga directly from *kong* gateway.

If the environment variable *KIBANA_SERVICE_NAME* is set, it will create a service for accessing kibana directly from *kong* gateway.
> This configuration alson requires the following environment variables to be set:
>    - KIBANA_SERVICE_HOST
>    - KIBANA_SERVICE_PORT
>    - KIBANA_ROUTE_PATH(optional) or KIBANA_ROUTE_HOST(optional)
> Then you can access it from *http://localhost:8000/KIBANA_ROUTE_PATH*



If the environment variable *LOGSTASH_HOST* is set, it will create a global plugin enabled for all services to log your requests throught logstash to elastic.



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

