#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "1. Checking current record count in production D1 database..."
npx wrangler d1 execute gsrsites --remote --env-file=.env --command="SELECT COUNT(*) FROM sites;"

echo "========================================"
echo "2. Applying schema and seeding production database..."
(cd backend/randomizer && npx wrangler d1 execute gsrsites --remote --env-file=../../.env --file=schema.sql)

echo "========================================"
echo "3. Verifying new record count in production D1 database..."
npx wrangler d1 execute gsrsites --remote --env-file=.env --command="SELECT COUNT(*) FROM sites;"

echo "========================================"
echo "Production database has been successfully seeded!"