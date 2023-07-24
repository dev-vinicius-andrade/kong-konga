#!/bin/bash
docker compose --profile setup -f "$1" -f docker-compose.setup.yaml --env-file ./.env.local  down -v
grep -oP '(?<=device: ).*' "$1" | while read -r path; do
  rm -Rf "$path"
done
