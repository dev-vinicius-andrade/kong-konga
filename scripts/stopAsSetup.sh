#!/bin/bash
docker compose --profile setup -f docker-compose.yaml -f docker-compose.setup.yaml --env-file ./.env.local  down
