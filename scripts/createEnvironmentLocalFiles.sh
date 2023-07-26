#!/bin/bash
source "$(pwd)/scripts/helpers.sh"
echo "Creating local files" >&2

copy_file_with_overwrite_question "$(pwd)/.env.example" "$(pwd)/.env.local"
copy_file_with_overwrite_question "$(pwd)/docker-compose.volumes.yaml" "$(pwd)/docker-compose.volumes.local.yaml"
copy_file_with_overwrite_question "$(pwd)/docker-compose.setup.yaml" "$(pwd)/docker-compose.setup.local.yaml"
copy_file_with_overwrite_question "$(pwd)/docker-compose.yaml" "$(pwd)/docker-compose.local.yaml"
echo "Done creating local files" >&2