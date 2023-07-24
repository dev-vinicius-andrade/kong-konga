#!/bin/bash
source ./getNamedParameter.sh
volumes_folder=$(get_named_parameter "root-folder" "" "${@}")
docker compose --profile setup -f docker-compose.yaml -f docker-compose.setup.yaml --env-file ./.env.local  down -v
rm -Rf "$volumes_folder"