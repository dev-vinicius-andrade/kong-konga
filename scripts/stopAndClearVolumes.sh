#!/bin/bash
docker compose -f docker-compose.yaml --env-file ./.env.local  down -v
grep -oP '(?<=device: ).*' docker-compose.yaml | while read -r path; do
  rm -Rf "$path"
done
