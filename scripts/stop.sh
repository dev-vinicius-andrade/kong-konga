#!/bin/bash
source help.sh
docker compose \
    -f ../docker-compose.local.yaml \
    -f ../docker-compose.volumes.local.yaml \ 
    --env-file ../.env.local down