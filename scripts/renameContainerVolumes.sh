#!/bin/bash
container_volume="$1"
sed -i "s|device: ./container_volumes|device: $container_volume|g" "$2"
grep -oP '(?<=device: ).*' docker-compose.yaml | while read -r path; do
  mkdir -p "$path"
done