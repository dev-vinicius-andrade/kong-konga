#!/bin/bash
# Set the environment variables
export KONG_DATABASE="$KONG_DB_TYPE"
export KONG_PG_DATABASE="$KONG_DB_DATABASE"
export KONG_PG_HOST="$KONG_DB_HOST"
export KONG_PG_PORT="$KONG_DB_PORT"
export KONG_PG_USER=$(python3 -c "import urllib.parse, os; print(urllib.parse.quote(os.environ.get('KONG_DB_USER')))")
export KONG_PG_PASSWORD=$(python3 -c "import urllib.parse, os; print(urllib.parse.quote(os.environ.get('KONG_DB_PASSWORD')))")
# dsadasd
# Run kong migrations bootstrap
kong migrations bootstrap