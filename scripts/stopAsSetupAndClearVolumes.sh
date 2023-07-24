#!/bin/bash
docker compose --profile setup -f docker-compose.yaml -f docker-compose.setup.yaml --env-file ./.env.local  down -v
grep -oP '(?<=device: ).*' docker-compose.yaml | while read -r path; do
  rm -Rf "$path"
done
