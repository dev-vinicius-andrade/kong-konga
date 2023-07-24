#!/bin/bash
docker compose -f docker-compose.yaml -f docker-compose.setup.yaml --env-file ./.env.local  up -d