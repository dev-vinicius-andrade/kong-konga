#!/bin/bash
docker compose -f docker-compose.yaml --env-file ./.env.local  down -v
grep -oP '(?<=device: ).*' "$1" | while read -r path; do
  rm -Rf "$path"
done
