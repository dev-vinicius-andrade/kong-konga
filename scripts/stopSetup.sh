#!/bin/bash
source help.sh
docker compose \
    -f ../docker-compose.volumes.local.yaml \ 
    -f ../docker-compose.setup.local.yaml \
    --env-file ../.env.local down