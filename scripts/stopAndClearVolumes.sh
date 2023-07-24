#!/bin/bash
docker-compose -f docker-compose.yaml --env-file ./.env.local  down -v