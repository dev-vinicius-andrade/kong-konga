#!/bin/bash
# check if not exists docker-compose.volumes.local.yaml and exit if not exists
source help.sh
if [[ ! -f "../docker-compose.volumes.local.yaml" ]]; then
    echo "docker-compose.volumes.local.yaml does not exist"
    echo_run_help
    exit 1
fi

# check if not exists .env.local and exit if not exists
if [[ ! -f "../env.local" ]]; then
    echo ".env.local does not exist"
    echo_run_help
    exit 1
fi
echo "Running as setup"
docker compose \
    --profile setup \
    -f ../docker-compose.setup.local.yaml \
    -f ../docker-compose.volumes.local.yaml \
    --env-file ../.env.local \
    up -d    