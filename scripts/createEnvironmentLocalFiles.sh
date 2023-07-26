#!/bin/bash
source help.sh
echo "Creating local files" >&2
copy_file_with_overwrite_question "../.env.example" "../.env.local"
copy_file_with_overwrite_question "../docker-compose.volumes.yaml" "../docker-compose.volumes.local.yaml"
copy_file_with_overwrite_question "../docker-compose.setup.yaml" "../docker-compose.setup.local.yaml"