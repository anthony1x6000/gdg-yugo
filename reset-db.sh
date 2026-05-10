#!/bin/bash

# This script wipes the local database and reapplies the latest schema.
# Run this whenever you change the schema or want a fresh start.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERSIST_PATH="$ROOT_DIR/.wrangler"

echo "Wiping local database at $PERSIST_PATH..."

# Remove local D1 storage
rm -rf "$PERSIST_PATH/v3/d1"

echo "Re-initializing database..."
# Use the randomizer's schema to initialize
cd "$ROOT_DIR/backend/randomizer"

# Ensure we have the latest schema.sql
if [ ! -f "schema.sql" ]; then
    echo "Error: schema.sql not found in backend/randomizer"
    exit 1
fi

npx wrangler d1 execute gsrsites --local --persist-to "$PERSIST_PATH" --file ./schema.sql --yes

echo "Database successfully reset and seeded."
