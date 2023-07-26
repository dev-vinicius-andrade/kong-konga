#!/bin/bash
# check if not exists docker-compose.volumes.local.yaml and exit if not exists
source "$(pwd)/scripts/help.sh"
if [[ ! -f "$(pwd)/docker-compose.volumes.local.yaml" ]]; then
    echo "$(pwd)/docker-compose.volumes.local.yaml does not exist" >&2
    echo_run_help
    exit 1
fi

# check if not exists .env.local and exit if not exists
if [[ ! -f ".env.local" ]]; then
    echo "$(pwd)/.env.local does not exist"
    echo_run_help
    exit 1
fi
echo "Running as local"
docker compose \
    -f "$(pwd)/docker-compose.volumes.local.yaml" \
    -f "$(pwd)/docker-compose.local.yaml" \
    --env-file "$(pwd)/.env.local" \
    up -d