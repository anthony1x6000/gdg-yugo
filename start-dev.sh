#!/bin/bash

# Kill all background processes on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "Starting services in development mode..."

# Get absolute path to the shared wrangler directory
PERSIST_PATH="$(pwd)/.wrangler"
mkdir -p "$PERSIST_PATH"

# 0. Initialize Shared D1 Database
echo "Initializing shared local database..."
(cd backend/randomizer && npx wrangler d1 execute gsrsites --local --persist-to "$PERSIST_PATH" --file ./schema.sql --yes)

# 1. Start Filter Worker (Port 8789)
echo "Starting Filter Worker on http://127.0.0.1:8789"
(cd backend/filter && npx wrangler dev --port 8789 --inspector-port 9231 --persist-to "$PERSIST_PATH") &

# 2. Start Randomizer Worker (Port 8787)
# Overriding FILTER_URL to point to local filter worker
echo "Starting Randomizer Worker on http://127.0.0.1:8787"
(cd backend/randomizer && npx wrangler dev --port 8787 --inspector-port 9229 --persist-to "$PERSIST_PATH" --var FILTER_URL:http://127.0.0.1:8789) &

# 3. Start Pusher Worker (Port 8788)
echo "Starting Pusher Worker on http://127.0.0.1:8788"
(cd backend/pusher && npx wrangler dev --port 8788 --inspector-port 9230 --persist-to "$PERSIST_PATH") &

# 4. Start Frontend
echo "Starting Frontend..."
(cd frontend && npm run dev) &

echo "All services are starting. Press Ctrl+C to stop."

# Wait for all background processes
wait
