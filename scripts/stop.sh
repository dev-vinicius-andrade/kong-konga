#!/bin/bash
docker compose -f "$(pwd)/docker-compose.local.yaml" -f "$(pwd)/docker-compose.volumes.local.yaml" --env-file "$(pwd)/.env.local" down