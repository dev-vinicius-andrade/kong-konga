#!/bin/bash
docker compose -f docker-compose-networks.yaml -f "$(pwd)/docker-compose.volumes.local.yaml" -f "$(pwd)/docker-compose.local.yaml" --env-file "$(pwd)/.env.local" down